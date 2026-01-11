"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardBody } from "@heroui/card";
import { button as buttonStyles } from "@heroui/theme";
import { title, subtitle } from "@/components/primitives";
import { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Divider } from "@heroui/divider";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import {
  FiRefreshCw,
  FiGlobe,
  FiBookOpen,
  FiFileText,
  FiUsers,
  FiMapPin,
  FiShield,
} from "react-icons/fi";
import {
  HiOutlineServer,
  HiOutlineDatabase,
  HiOutlineScale,
} from "react-icons/hi";
import { BsChatDots, BsFileEarmarkText, BsBookHalf } from "react-icons/bs";
import { IoShareSocialOutline } from "react-icons/io5";
import { RiGovernmentLine } from "react-icons/ri";

// Import AmCharts libraries
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_indonesiaLow from "@amcharts/amcharts5-geodata/indonesiaLow";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

interface Datacenter {
  _id: string;
  name: string;
  address: string;
  coordinate: string;
  description: string;
  provider: string;
}

export default function CustomerHome() {
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);
  const chartRef = useRef<am5.Root | null>(null);

  // Fetch datacenter data
  useEffect(() => {
    const fetchDatacenters = async () => {
      try {
        const response = await fetch("/api/customer/get-datacenter");
        const result = await response.json();
        if (result.data) {
          setDatacenters(result.data);
          setIsMapReady(true);
        }
      } catch (error) {
        console.error("Failed to fetch datacenter data:", error);
      }
    };

    fetchDatacenters();
  }, []);

  // Initialize AmCharts map when data is available
  useEffect(() => {
    if (!datacenters.length || !mapRef.current) return;

    // Cleanup previous instance if it exists
    if (chartRef.current) {
      chartRef.current.dispose();
    }

    // Function to initialize the map
    const initializeMap = () => {
      // Wait for AmCharts to be ready - this is critical
      am5.ready(function () {
        try {
          // Create root element
          const root = am5.Root.new(mapRef.current!);
          chartRef.current = root;

          // Set themes
          root.setThemes([am5themes_Animated.new(root)]);

          // Create the map chart
          const chart = root.container.children.push(
            am5map.MapChart.new(root, {
              panX: "none", // Disable X-axis panning
              panY: "none", // Disable Y-axis panning
              wheelX: "none", // Disable horizontal wheel zooming - correct property
              wheelY: "none", // Disable vertical wheel zooming - correct property
              projection: am5map.geoMercator(),
              zoomLevel: 1.7,
            })
          );

          // Create polygon series for Indonesia
          const polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(root, {
              geoJSON: am5geodata_indonesiaLow,
              exclude: ["AQ"],
            })
          );

          // Configure polygon appearance
          polygonSeries.mapPolygons.template.setAll({
            tooltipText: "{name}",
            toggleKey: "active",
            interactive: true,
            fill: am5.color(0x155183), // Updated to #155183
            stroke: am5.color(0xffffff),
            strokeWidth: 0.5,
          });

          // Configure hover state
          polygonSeries.mapPolygons.template.states.create("hover", {
            fill: am5.color(0x0e3b61), // Darker shade of #155183 for hover
          });

          // Create point series for datacenter markers
          const pointSeries = chart.series.push(
            am5map.MapPointSeries.new(root, {
              latitudeField: "latitude",
              longitudeField: "longitude",
            })
          );

          // Configure markers appearance
          pointSeries.bullets.push(function () {
            const circle = am5.Circle.new(root, {
              radius: 6,
              fill: am5.color(0xff9d00), // Changed to orange-gold to complement the blue
              stroke: am5.color(0xffffff),
              strokeWidth: 2,
              tooltipText: "{name}\n{address}", // Tooltip with name and address
            });

            // Hover state for markers
            circle.states.create("hover", {
              scale: 1.5,
              fill: am5.color(0xffa726), // Slightly darker orange on hover
            });

            return am5.Bullet.new(root, {
              sprite: circle,
            });
          });

          // Add datacenter markers
          const pointData = datacenters.map((dc) => {
            const [lat, lng] = dc.coordinate
              .split(",")
              .map((coord) => parseFloat(coord.trim()));
            return {
              name: dc.name,
              address: dc.address,
              description: dc.description,
              latitude: lat,
              longitude: lng,
            };
          });

          pointSeries.data.setAll(pointData);

          // Remove zoom control since zooming is disabled
          // No longer needed:
          // const zoomControl = am5map.ZoomControl.new(root, {});
          // chart.set("zoomControl", zoomControl);

          // Add grid lines for better visibility
          const graticuleSeries = chart.series.push(
            am5map.GraticuleSeries.new(root, {})
          );
          graticuleSeries.mapLines.template.setAll({
            stroke: am5.color(0x000000),
            strokeOpacity: 0.08,
          });

          // Center the map on Indonesia immediately without animation
          // Set the third parameter to false to disable animation
          chart.zoomToGeoPoint({ longitude: 118, latitude: -2 }, 1.7, false);

          // Important: Force immediate rendering with no animation delay
          chart.setTimeout(() => {
            chart.goHome(0); // Zero animation duration
          }, 50);

          // Make the chart appear immediately with no animation
          root.container.appear(0, 0);
          chart.appear(0, 0);

          // Mark map as ready
          setIsMapReady(true);
        } catch (err) {
          console.error("Map initialization error:", err);
        }
      });
    };

    // Give the browser a moment to calculate layout before rendering the map
    const timer = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, [datacenters]);

  return (
    <div className="min-h-screen ">
      {" "}
      {/* Hero Section with side-by-side layout */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden min-h-[800px] flex items-center">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/banner.svg"
            alt="Data Center Background"
            fill
            priority
            className="object-cover object-center scale-130"
          />
          {/* <div className="absolute inset-0 bg-blue-900/70 "></div> */}
          <div className="absolute inset-0 "></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Text Content */}
            <motion.div
              className="text-white"
              initial="hidden"
              animate="visible"
              variants={fadeInLeft}
            >
              <div className="backdrop-blur-md bg-blue-800/30 p-6 rounded-xl border border-white/10 shadow-xl">
                <p className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-2">
                  DIGITAL CONNECTIVITY
                </p>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight  text-white">
                  APJII
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-6 text-white">
                  DATACENTER
                </h1>

                <p className="text-lg md:text-xl text-justify text-blue-100 mb-8 leading-relaxed max-w-lg font-normal">
                  Program kolaborasi strategis untuk memperkuat infrastruktur
                  internet nasional dan meningkatkan kualitas layanan internet
                  di Indonesia
                </p>
                <motion.div
                  className="flex flex-wrap gap-4"
                  variants={staggerChildren}
                >
                  <motion.div variants={fadeIn}>
                    <Link
                      href="/customer/about"
                      className={buttonStyles({
                        radius: "lg",
                        variant: "solid",
                        size: "lg",
                        className:
                          "bg-white text-blue-700 hover:bg-blue-50 font-medium px-6 py-3",
                      })}
                    >
                      Pelajari Lebih Lanjut
                    </Link>
                  </motion.div>
                  <motion.div variants={fadeIn}>
                    <Link
                      href="/customer/join-provider"
                      className={buttonStyles({
                        variant: "bordered",
                        radius: "lg",
                        size: "lg",
                        className:
                          "border-white text-white hover:bg-white/10 font-medium px-6 py-3",
                      })}
                    >
                      Jadi Mitra Kami
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Vector/Illustration */}
            {/* <motion.div
              className="flex justify-center lg:justify-end"
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
            >
              <motion.div
                className="relative w-full max-w-md lg:max-w-full"
                animate={{
                  y: [0, -15, 0],
                  transition: {
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  },
                }}
              >
                <Image
                  src="/images/data-center2.png"
                  alt="APJII Data Center Illustration"
                  width={650}
                  height={550}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div> */}
          </div>
        </div>

        {/* Only subtle decorative elements that don't distract */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
          <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-1/4 left-10 w-48 h-48 rounded-full bg-blue-400/10"></div>
        </div>

        {/* Modern smooth wave effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            className="w-full h-[80px] translate-y-1"
          >
            <path
              fill="currentColor"
              fillOpacity="1"
              className="text-gray-50 dark:text-gray-950"
              d="M0,128L48,122.7C96,117,192,107,288,101.3C384,96,480,96,576,112C672,128,768,160,864,154.7C960,149,1056,107,1152,90.7C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>
      {/* Map Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
          className="text-center mb-10"
        >
          <Chip color="primary" variant="flat" className="mb-4">
            <span className="font-medium">Lokasi Data Center</span>
          </Chip>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            APJII Datacenter Partner di Indonesia
          </h2>
          <Divider className="max-w-xs mx-auto my-4" />
        </motion.div>

        <motion.div
          className="text-gray-700 dark:text-gray-300 space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
        >
          <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50 z-0" />
            <CardBody className="relative z-10 p-4">
              <div
                ref={mapRef}
                id="datacenterMap"
                className="w-full h-[400px] rounded-lg"
                style={{
                  height: "400px",
                  width: "100%",
                  backgroundColor: "#f0f8ff", // Light blue background to make it visible immediately
                }}
              />

              {!isMapReady && (
                <div className="absolute inset-0 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-blue-600 dark:text-blue-400">
                      Memuat peta...
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <p className="text-center text-sm font-normal mt-2">
            <FiMapPin className="inline mr-1" />
            Menampilkan {datacenters.length} lokasi data center di seluruh
            Indonesia
          </p>
        </motion.div>
      </section>
      {/* Tentang APJII Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
          className="text-center mb-10"
        >
          <Chip color="primary" variant="flat" className="mb-4">
            <span className="font-medium">Mengapa Program Ini Penting</span>
          </Chip>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Program APJII Data Center
          </h2>
          <Divider className="max-w-xs mx-auto my-4" />
        </motion.div>

        <motion.div
          className="text-gray-700 dark:text-gray-300 space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
        >
          <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50 z-0" />
            <CardBody className="relative z-10 p-8">
              <p className="leading-relaxed text-base font-normal text-justify">
                APJII memiliki peran strategis dalam mendukung pertumbuhan dan
                pemerataan infrastruktur internet di Indonesia. Melalui Program
                APJII Data Center, kami merumuskan kebijakan dan tata kelola
                layanan IIX dan Data Center yang lebih baik demi kepentingan
                seluruh Anggota.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start text-justify">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-3">
                    <FiRefreshCw className="text-xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">
                      Peningkatan Trafik IIX
                    </h4>
                    <p className="text-sm font-normal text-justify text-justify">
                      Mendorong peningkatan lalu lintas interkoneksi di berbagai
                      wilayah
                    </p>
                  </div>
                </div>
                <div className="flex items-start text-justify">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-3">
                    <HiOutlineScale className="text-xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">
                      Efisiensi Jaringan
                    </h4>
                    <p className="text-sm font-normal text-justify">
                      Mendukung efisiensi dan kualitas layanan internet bagi
                      pengguna akhir
                    </p>
                  </div>
                </div>
                <div className="flex items-start text-justify">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-3">
                    <FiShield className="text-xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">
                      Standar Terjamin
                    </h4>
                    <p className="text-sm font-normal text-justify">
                      Memastikan mitra Data Center memenuhi kualifikasi teknis
                      dan operasional yang tinggi
                    </p>
                  </div>
                </div>
                <div className="flex items-start text-justify">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-3">
                    <FiGlobe className="text-xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">
                      Kolaborasi Strategis
                    </h4>
                    <p className="text-sm font-normal text-justify">
                      Membangun kemitraan dengan penyedia Data Center terkemuka
                      untuk infrastruktur nasional yang kuat
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </section>
      {/* Sejarah dan Tujuan */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <Chip color="primary" variant="flat" className="mb-4">
              <span className="font-medium">Peluang Kemitraan</span>
            </Chip>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Menjadi Mitra APJII Data Center
            </h2>
            <Divider className="max-w-xs mx-auto my-4" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn}>
              <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden shadow-md h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/30 z-0" />
                <CardBody className="relative z-10 p-8">
                  <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
                    <HiOutlineServer className="mr-2 text-blue-600 dark:text-blue-400" />
                    Syarat Utama Menjadi Mitra
                  </h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-4 text-base font-normal">
                    <li className="flex items-start text-justify">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      </div>
                      <p className="text-justify">
                        Merupakan Mitra Node IIX yang telah terdaftar
                      </p>
                    </li>
                    <li className="flex items-start text-justify ">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      </div>
                      <p className="text-justify">
                        Memiliki izin penyelenggaraan telekomunikasi yang resmi
                        dan berlaku
                      </p>
                    </li>
                    <li className="flex items-start text-justify">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      </div>
                      <p className="text-justify">
                        Mengikuti standar kualifikasi TIA-942 untuk Data Center
                      </p>
                    </li>
                    <li className="flex items-start text-justify">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3 mt-1">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      </div>
                      <p className="text-justify">
                        Memenuhi standar ISO 27001 dan ISO 9001
                      </p>
                    </li>
                  </ul>
                  <div className="mt-6 text-center">
                    <Link
                      href="/customer/become-provider"
                      className={buttonStyles({
                        radius: "lg",
                        variant: "solid",
                        size: "md",
                        className:
                          "bg-blue-600 text-white hover:bg-blue-700 font-medium",
                      })}
                    >
                      Pelajari Selengkapnya
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden shadow-md h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/30 z-0" />
                <CardBody className="relative z-10 p-8">
                  <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
                    <FiUsers className="mr-2 text-blue-600 dark:text-blue-400" />
                    Layanan untuk Anggota APJII
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-base font-normal">
                    Anggota APJII kini dapat memanfaatkan layanan colocation di
                    Data Center mitra kami yang telah terverifikasi.
                  </p>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-base">
                    Alur Pengajuan Layanan:
                  </h4>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-3 text-base font-normal">
                    <li className="flex items-start ">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          1
                        </span>
                      </div>
                      <p className="text-justify">
                        Pengajuan: Anggota mengajukan permohonan layanan melalui
                        Portal APJII DC
                      </p>
                    </li>
                    <li className="flex items-start ">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          2
                        </span>
                      </div>
                      <p className="text-justify">
                        Proses: APJII akan memproses permintaan sesuai kapasitas
                        yang tersedia dari Mitra
                      </p>
                    </li>
                    <li className="flex items-start ">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          3
                        </span>
                      </div>
                      <p className="text-justify">
                        Pembayaran: Seluruh pembayaran atas layanan dibayarkan
                        oleh Anggota kepada APJII
                      </p>
                    </li>
                  </ul>
                  <div className="mt-6 text-center">
                    <Link
                      href="/customer/login"
                      className={buttonStyles({
                        radius: "lg",
                        variant: "solid",
                        size: "md",
                        className:
                          "bg-blue-600 text-white hover:bg-blue-700 font-medium",
                      })}
                    >
                      Akses Portal APJII DC
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Layanan dan Anggota with React Icons */}
      {/* <section className="py-16 max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
        >
          <Chip color="primary" variant="flat" className="mb-4">
            Layanan Kami
          </Chip>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Layanan dan Anggota
          </h2>
          <Divider className="max-w-xs mx-auto my-4" />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          {[
            {
              title: "Indonesia Internet Exchange (IIX)",
              description:
                "Wadah untuk menyatukan jaringan ISP, memastikan lalu lintas data tetap dalam negeri, mengurangi latency dan biaya transit internasional.",
              icon: <FiRefreshCw className="text-3xl" />,
            },
            {
              title: "Alokasi IP Address",
              description:
                "Mendukung identitas jaringan anggota melalui APJII-NIR, memastikan anggota memiliki identitas jaringan yang sah.",
              icon: <FiGlobe className="text-3xl" />,
            },
            {
              title: "Pelatihan dan Konsultasi",
              description:
                "Platform komunikasi dan konsultasi bagi anggota, dengan pemerintah, maupun dengan asosiasi domestik dan internasional, serta penyelenggaraan seminar dan pelatihan.",
              icon: <BsBookHalf className="text-3xl" />,
            },
          ].map((service, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="border border-blue-100 dark:border-blue-900 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-white dark:bg-gray-900 z-0" />
                <CardBody className="relative z-10 p-8 flex flex-col h-full">
                  <div className="mb-4 text-blue-600 dark:text-blue-400">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {service.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-auto">
                    {service.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section> */}
      {/* Struktur Organisasi */}
      {/* <section className="py-16 bg-blue-50 dark:bg-blue-950 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
          >
            <Chip color="primary" variant="flat" className="mb-4">
              Kepemimpinan
            </Chip>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Struktur Organisasi
            </h2>
            <Divider className="max-w-xs mx-auto my-4" />
          </motion.div>

          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Card className="border border-blue-200 dark:border-blue-800 max-w-3xl mx-auto shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/30 z-0" />
              <CardBody className="relative z-10 p-8">
                <div className="flex justify-center mb-6">
                  <FiUsers className="text-5xl text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  APJII dipimpin oleh Ketua Umum Muhammad Arif (periode
                  2021-2024), yang juga menjabat sebagai Direktur Utama PT
                  Sinergi Inti Andalan Prima Tbk dan Direktur PT Garuda Prima
                  Internetindo (Flynet).
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Struktur pengurus meliputi berbagai bidang seperti Keamanan
                  Siber, Sistem Informasi, dan Hubungan Masyarakat, dengan fokus
                  pada pengembangan internet Indonesia yang berkelanjutan.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section> */}
      {/* Kontribusi */}
      {/* <section className="py-16 max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
        >
          <Chip color="primary" variant="flat" className="mb-4">
            Impact
          </Chip>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Kontribusi terhadap Ekosistem Digital
          </h2>
          <Divider className="max-w-xs mx-auto my-4" />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.div variants={fadeIn}>
            <Card className="border border-blue-100 dark:border-blue-900 overflow-hidden shadow-md h-full">
              <div className="absolute inset-0 bg-white dark:bg-gray-900 z-0" />
              <CardBody className="relative z-10 p-8">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <RiGovernmentLine className="text-2xl text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">
                  Advokasi Kebijakan
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  APJII aktif dalam advokasi kebijakan terkait internet dan
                  telekomunikasi, seperti permintaan relaksasi pembayaran BHP
                  dan USO telekomunikasi untuk mendukung industri dalam situasi
                  khusus.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="border border-blue-100 dark:border-blue-900 overflow-hidden shadow-md h-full">
              <div className="absolute inset-0 bg-white dark:bg-gray-900 z-0" />
              <CardBody className="relative z-10 p-8">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <IoShareSocialOutline className="text-2xl text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">
                  Acara dan Kolaborasi
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Penyelenggaraan acara seperti Indonesia Internet Expo dan
                  Summit, serta kolaborasi dengan berbagai pemangku kepentingan
                  untuk memperkuat ekosistem digital Indonesia melalui kerjasama
                  dengan pemerintah dan pelaku industri.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      </section> */}
      {/* Ringkasan Layanan - Modern Card Grid replacing Table */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
          >
            <Chip color="primary" variant="flat" className="mb-4">
              <span className="font-medium">Layanan Mitra</span>
            </Chip>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Layanan APJII Data Center
            </h2>
            <Divider className="max-w-xs mx-auto my-4" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            {/*
              {
                service: "Infrastruktur Data Center",
                description:
                  "Penyediaan fasilitas data center yang memenuhi standar TIA-942 dan ISO",
                icon: <HiOutlineServer />,
              },
              {
                service: "Konektivitas",
                description:
                  "Layanan koneksi jaringan berkualitas tinggi dengan redundansi",
                icon: <FiRefreshCw />,
              },
              {
                service: "Colocation",
                description:
                  "Layanan colocation server dan perangkat untuk anggota APJII",
                icon: <HiOutlineDatabase />,
              },
              {
                service: "Dukungan Teknis",
                description:
                  "Layanan dukungan teknis 24/7 untuk memastikan ketersediaan layanan",
                icon: <BsChatDots />,
              },
              {
                service: "Keamanan Fasilitas",
                description:
                  "Sistem keamanan fisik dan digital untuk melindungi aset pelanggan",
                icon: <FiShield />,
              },
              {
                service: "Monitoring & Reporting",
                description:
                  "Pemantauan performa dan pelaporan layanan secara berkala",
                icon: <BsFileEarmarkText />,
              },
            */}
            {(
              [
                {
                  service: "Infrastruktur Data Center",
                  description:
                    "Penyediaan fasilitas data center yang memenuhi standar TIA-942 dan ISO",
                  icon: <HiOutlineServer />,
                },
                {
                  service: "Konektivitas",
                  description:
                    "Layanan koneksi jaringan berkualitas tinggi dengan redundansi",
                  icon: <FiRefreshCw />,
                },
                {
                  service: "Colocation",
                  description:
                    "Layanan colocation server dan perangkat untuk anggota APJII",
                  icon: <HiOutlineDatabase />,
                },
                {
                  service: "Dukungan Teknis",
                  description:
                    "Layanan dukungan teknis 24/7 untuk memastikan ketersediaan layanan",
                  icon: <BsChatDots />,
                },
                {
                  service: "Keamanan Fasilitas",
                  description:
                    "Sistem keamanan fisik dan digital untuk melindungi aset pelanggan",
                  icon: <FiShield />,
                },
                {
                  service: "Monitoring & Reporting",
                  description:
                    "Pemantauan performa dan pelaporan layanan secara berkala",
                  icon: <BsFileEarmarkText />,
                },
              ] as const
            ).map((item, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="border border-blue-200 dark:border-blue-800 shadow-md overflow-hidden h-full">
                  <div className="flex">
                    <div className="flex-none w-16 bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white">
                      <div className="text-2xl">{item.icon}</div>
                    </div>
                    <div className="flex-grow">
                      <CardBody className="p-4">
                        <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                          {item.service}
                        </h3>
                        <p className="text-sm font-norma text-justify text-gray-700 dark:text-gray-300">
                          {item.description}
                        </p>
                      </CardBody>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 text-black">
        <motion.div
          className="max-w-4xl mx-auto text-center px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2
            variants={fadeIn}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
          >
            Bergabunglah dengan APJII
          </motion.h2>

          <motion.p
            variants={fadeIn}
            className="mb-8 text-base md:text-lg font-normal text-gray-800"
          >
            Dapatkan manfaat keanggotaan dan berkontribusilah dalam pengembangan
            internet Indonesia
          </motion.p>

          <motion.div variants={fadeIn}>
            <Link
              href="https://apjii.or.id"
              target="_blank"
              className={buttonStyles({
                radius: "lg",
                variant: "shadow",
                size: "lg",
                className:
                  "bg-white text-blue-700 hover:bg-blue-50 font-medium px-8",
              })}
            >
              Hubungi Kami
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
