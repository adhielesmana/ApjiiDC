import Link from "next/link";
import {
  FiHome,
  FiPhone,
  FiMail,
  FiMap,
  FiExternalLink,
  FiUsers,
  FiFileText,
  FiList,
  FiBook,
} from "react-icons/fi";
import { button as buttonStyles } from "@heroui/theme";

const Footer = () => {
  return (
    <footer className="bg-[#155183] text-white">
      <div className="container mx-auto px-4">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About APJII */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center">
                <FiUsers className="mr-2" /> About APJII
              </h5>
              <ul className="space-y-2">
                {[
                  {
                    href: "https://apjii.or.id/pengurus/sekretariat",
                    label: "APJII Secretariat",
                  },
                  {
                    href: "https://apjii.or.id/pengurus/pengawas",
                    label: "Supervisors",
                  },
                  {
                    href: "https://apjii.or.id/pengurus/pengurus",
                    label: "Management",
                  },
                  {
                    href: "https://apjii.or.id/pengurus/pelaksana-harian",
                    label: "Daily Executive Board",
                  },
                  {
                    href: "https://apjii.or.id/pengurus/latar-belakang",
                    label: "Background",
                  },
                  { href: "https://apjii.or.id/faq", label: "FAQ" },
                ].map((item, index) => (
                  <li key={index} className="group">
                    <Link
                      href={item.href}
                      className="hover:text-blue-200 transition-colors flex items-center"
                    >
                      <span className="w-1 h-1 bg-blue-300 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>{" "}
            {/* Services */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center">
                <FiList className="mr-2" /> Services
              </h5>
              <ul className="space-y-2">
                {[
                  {
                    href: "https://idnic.net/",
                    label: "IDNIC",
                    external: true,
                  },
                  {
                    href: "https://domain.net.id/",
                    label: "IDNIC Indonesia Top Level Domain (ID TLD)",
                    external: true,
                  },
                  {
                    href: "https://iix.net.id/",
                    label: "Indonesia Internet Exchange (IIX)",
                    external: true,
                  },
                  {
                    href: "https://apjii.or.id/layanan/partner",
                    label: "Partner",
                  },
                ].map((item, index) => (
                  <li key={index} className="group">
                    <Link
                      href={item.href}
                      className="hover:text-blue-200 transition-colors flex items-center"
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                    >
                      <span className="w-1 h-1 bg-blue-300 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                      {item.label}
                      {item.external && (
                        <FiExternalLink className="ml-1 text-xs" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>{" "}
            {/* Data Warehouse */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center">
                <FiBook className="mr-2" /> Data Warehouse
              </h5>
              <ul className="space-y-2">
                {[
                  {
                    href: "https://apjii.or.id/gudang-data/standar",
                    label: "Standards and Terms",
                  },
                  {
                    href: "https://apjii.or.id/gudang-data/regulasi",
                    label: "Regulations",
                  },
                  {
                    href: "https://apjii.or.id/gudang-data/hasil-survei",
                    label: "Survey Results",
                  },
                ].map((item, index) => (
                  <li key={index} className="group">
                    <Link
                      href={item.href}
                      className="hover:text-blue-200 transition-colors flex items-center"
                    >
                      <span className="w-1 h-1 bg-blue-300 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>{" "}
            {/* Headquarters */}
            <div>
              <h5 className="font-bold text-lg mb-4 flex items-center">
                <FiHome className="mr-2" /> Headquarters
              </h5>
              <address className="not-italic text-blue-100 mb-6 space-y-3">
                <div className="flex">
                  <FiMap className="flex-shrink-0 mt-1 mr-2" />
                  <span>
                    APJII (Indonesian Internet Service Providers Association)
                    <br />
                    Cyber Building - Jl. Kuningan Barat Raya No. 8, RT.1/RW.3
                    <br />
                    Kuningan Barat, Mampang Prapatan District
                    <br />
                    South Jakarta City, DKI Jakarta 12710
                  </span>
                </div>
                <div className="flex items-center">
                  <FiMail className="mr-2" />
                  <a
                    href="mailto:tiket@apjii.or.id"
                    className="hover:text-white"
                  >
                    tiket@apjii.or.id
                  </a>
                </div>
              </address>
              <Link
                href="https://apjii.or.id/contact"
                target="_blank"
                className={buttonStyles({
                  variant: "solid",
                  radius: "lg",
                  className:
                    "bg-white text-blue-700 hover:bg-blue-50 w-full justify-center",
                })}
              >
                <FiPhone className="mr-2" /> Contact Us
              </Link>
            </div>
          </div>
        </div>{" "}
        {/* Copyright */}
        <div className="py-4 border-t border-blue-500/30 text-center text-blue-200 text-sm">
          <p>
            © {new Date().getFullYear()} APJII - Indonesian Internet Service
            Providers Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
