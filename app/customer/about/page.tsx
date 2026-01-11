"use client";

import { title, subtitle } from "@/components/primitives";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import {
  FiServer,
  FiCpu,
  FiShield,
  FiRefreshCw,
  FiHardDrive,
  FiDatabase,
  FiMapPin,
  FiGlobe,
  FiFileText,
} from "react-icons/fi";
import {
  HiOutlineLightningBolt,
  HiOutlineScale,
  HiOutlineShieldCheck,
  HiOutlineServer,
} from "react-icons/hi";
import { BsFileEarmarkText } from "react-icons/bs";
import Link from "next/link";
import { useS3Image } from "@/hooks/useS3Image";

interface Provider {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  location?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AboutPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/customer/catalog/provider");
      if (response.data.status === "ok") {
        setProviders(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch partners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="bg-[#155183] text-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-sm uppercase tracking-wider text-blue-100 mb-2">
              Program APJII Data Center
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Tentang Data Center
            </h1>
            <p className="text-xl text-blue-100">
              Kolaborasi Strategis untuk Infrastruktur Internet Nasional
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-10 left-[10%] w-56 h-56 rounded-full bg-blue-400/10"></div>
        </div>

        {/* Wave effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0"></div>
      </section>

      {/* What is Data Center Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <Chip color="primary" variant="flat" className="mb-4">
              Pengenalan
            </Chip>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Tentang Program APJII Data Center
            </h2>
            <Divider className="max-w-xs mx-auto my-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/about-us.jpg"
                  alt="Data Center"
                  className="w-full h-auto object-cover"
                  width={600}
                  height={400}
                />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-gray-700 dark:text-gray-300 space-y-4 text-justify"
            >
              <p className="leading-relaxed">
                Program APJII Data Center adalah program kolaborasi antara APJII
                dengan perusahaan penyedia layanan Data Center yang dilaksanakan
                sebagai bentuk pelaksanaan program kerja Bidang IIX dan Data
                Center APJII. Program ini ditetapkan melalui Surat Keputusan
                Ketua Umum APJII Nomor 47 Tahun 2025.
              </p>
              <p className="leading-relaxed">
                Dalam rangka meningkatkan pengelolaan layanan Indonesia Internet
                Exchange (IIX) dan Data Center, Badan Pengurus Pusat APJII
                memandang perlu adanya sebuah program kolaborasi untuk
                kepentingan Anggota.
              </p>
              <p className="leading-relaxed">
                Selamat datang di Program APJII Data Center, sebuah inisiatif
                kolaborasi antara Asosiasi Penyelenggara Jasa Internet Indonesia
                (APJII) dengan perusahaan penyedia layanan Data Center terkemuka
                di Indonesia.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tujuan Section */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <Chip color="primary" variant="flat" className="mb-4">
              Visi & Misi
            </Chip>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Tujuan Program
            </h2>
            <Divider className="max-w-xs mx-auto my-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="space-y-4"
            >
              <motion.div variants={fadeIn}>
                <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden shadow-md h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/30 z-0" />
                  <CardBody className="relative z-10 p-8">
                    <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
                      <FiCpu className="mr-2 text-blue-600 dark:text-blue-400" />
                      Tujuan Utama Program
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                          <HiOutlineLightningBolt className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <p>
                          Mendukung pertumbuhan dan pemerataan infrastruktur
                          internet nasional
                        </p>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                          <FiRefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <p>
                          Memperkuat konektivitas antar anggota melalui
                          Indonesia Internet Exchange (IIX)
                        </p>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                          <FiGlobe className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <p>
                          Mendorong peningkatan trafik IIX di berbagai wilayah
                        </p>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                          <HiOutlineScale className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <p>
                          Mendukung efisiensi jaringan dan peningkatan kualitas
                          layanan internet secara keseluruhan
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="space-y-4"
            >
              <motion.div variants={fadeIn}>
                <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden shadow-md h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/30 z-0" />
                  <CardBody className="relative z-10 p-8">
                    <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
                      <FiFileText className="mr-2 text-blue-600 dark:text-blue-400" />
                      Definisi Kunci
                    </h3>
                    <ul className="space-y-3">
                      <li className="pb-3 border-b text-justify border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-blue-700  dark:text-blue-300">
                          Program APJII Data Center:
                        </span>{" "}
                        Program kolaborasi antara APJII dan perusahaan penyedia
                        layanan Data Center
                      </li>

                      <li className="py-3 text-justify border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-blue-700  dark:text-blue-300">
                          Mitra APJII Data Center (Mitra APJII DC):
                        </span>{" "}
                        Perusahaan penyedia layanan Data Center yang memiliki
                        izin telekomunikasi resmi dan masih berlaku
                      </li>

                      <li className="py-3 text-justify border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-blue-700  dark:text-blue-300">
                          Indonesia Internet Exchange (IIX):
                        </span>{" "}
                        Jaringan interkoneksi internet yang dimiliki dan
                        dikelola oleh APJII
                      </li>

                      <li className="py-3 text-justify border-b border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-blue-700  dark:text-blue-300">
                          Node IIX:
                        </span>{" "}
                        Simpul perpanjangan IIX-APJII yang menghubungkan
                        konektivitas antar IIX
                      </li>

                      <li className="pt-3 text-justify">
                        <span className="font-semibold text-blue-700  dark:text-blue-300">
                          Standar TIA-942:
                        </span>{" "}
                        Standar internasional yang menetapkan persyaratan dan
                        pedoman untuk desain dan instalasi datacenter dengan
                        klasifikasi tier reliability dari Tier 1 (dasar) hingga
                        Tier 4 (fault tolerant)
                      </li>
                    </ul>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Landasan Hukum */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <Chip color="primary" variant="flat" className="mb-4">
              Legal
            </Chip>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Landasan Hukum
            </h2>
            <Divider className="max-w-xs mx-auto my-4" />
            <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Program APJII Data Center didasarkan pada beberapa landasan hukum
              dan regulasi yang menjamin legalitas dan keabsahan pelaksanaannya.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div variants={fadeIn}>
              <Card className="border border-blue-100 dark:border-blue-900 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-70 z-0" />
                <CardBody className="relative z-10 p-8 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-4">
                      <BsFileEarmarkText className="text-2xl text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Anggaran Dasar APJII
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Akta Nomor 05 tanggal 26 September 2023
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="border border-blue-100 dark:border-blue-900 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-70 z-0" />
                <CardBody className="relative z-10 p-8 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mr-4">
                      <BsFileEarmarkText className="text-2xl text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Anggaran Rumah Tangga APJII
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Akta Nomor 06 tanggal 26 September 2023
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="border border-blue-100 dark:border-blue-900 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-70 z-0" />
                <CardBody className="relative z-10 p-8 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full mr-4">
                      <BsFileEarmarkText className="text-2xl text-purple-600 dark:text-purple-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Peraturan APJII
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Peraturan Asosiasi Penyelenggara Jasa Internet Indonesia
                    Nomor 5 Tahun 2024 tentang Penggunaan Fasilitas APJII
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="border border-blue-100 dark:border-blue-900 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-70 z-0" />
                <CardBody className="relative z-10 p-8 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-4">
                      <BsFileEarmarkText className="text-2xl text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Surat Keputusan Ketua Umum
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Surat Keputusan Ketua Umum Nomor 29 Tahun 2022 tentang
                    Petunjuk Teknis Pembentukan Node IIX
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section - Updated to show only logo and name */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <Chip color="primary" variant="flat" className="mb-4">
              Mitra
            </Chip>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Data Center yang Tersedia
            </h2>
            <Divider className="max-w-xs mx-auto my-4" />
            <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Jelajahi pilihan penyedia data center kami, masing-masing
              menawarkan infrastruktur dan layanan khusus untuk memenuhi
              kebutuhan bisnis Anda.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center ">
              <Spinner size="lg" color="primary" />
            </div>
          ) : providers.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="flex flex-wrap justify-center gap-6"
            >
              {providers.map((provider) => (
                <motion.div
                  key={provider._id}
                  variants={fadeIn}
                  className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(19.5%-16px)]"
                >
                  <ProviderCard provider={provider} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <FiDatabase className="text-4xl text-blue-500 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                No data center partners available at the moment. Please check
                back later.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Provider Card Component
function ProviderCard({ provider }: { provider: Provider }) {
  const { imageUrl, isLoading, error } = useS3Image(provider.logo);

  return (
    <Link href={`/customer/provider/${provider._id}`} className="block h-full">
      <Card className="border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:translate-y-[-5px] cursor-pointer">
        <CardBody className="px-2">
          <div className="w-full aspect-[4/3] relative rounded overflow-hidden bg-white flex items-center justify-center">
            {isLoading ? (
              <Spinner size="md" color="primary" />
            ) : error || !imageUrl ? (
              <HiOutlineServer className="text-5xl text-blue-600 dark:text-blue-300" />
            ) : (
              <Image
                src={imageUrl}
                alt={`${provider.name} Logo`}
                className="object-contain p-2"
                sizes="100%"
              />
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
