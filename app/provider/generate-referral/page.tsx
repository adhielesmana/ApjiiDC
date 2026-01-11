"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { Tooltip } from "@heroui/tooltip";
import { Spinner } from "@heroui/spinner";
import axios from "axios";
import { format, isAfter } from "date-fns";
import { id } from "date-fns/locale";

interface Referral {
  _id: string;
  referal: string;
  provider: string;
  ttl: string;
  active: boolean;
}

export default function GenerateReferralPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Add state for confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    referralId: string;
    referralCode: string;
  }>({
    isOpen: false,
    referralId: "",
    referralCode: "",
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/provider/referral/list");

      if (response.data.status === "ok" && Array.isArray(response.data.data)) {
        setReferrals(response.data.data);
      } else {
        setError("Format respons dari server tidak sesuai");
      }
    } catch (error: any) {
      console.error("Error fetching referrals:", error);

      // Check for unauthorized or token expired
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = "/login";
        return;
      }

      // Check for the specific PJ-only error
      if (
        error.response?.data?.error ===
          "Maaf, fitur ini hanya tersedia untuk Penanggung Jawab" ||
        error.response?.data?.message === "This routes is pj-only"
      ) {
        setError("Maaf, fitur ini hanya tersedia untuk Penanggung Jawab");
      } else {
        setError(
          error.response?.data?.error ||
            "Gagal mengambil data referral, silahkan coba lagi"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const generateReferral = async () => {
    setGenerating(true);
    try {
      const response = await axios.get("/api/provider/referral/new");

      if (response.data.status === "ok" && response.data.data) {
        addToast({
          title: "Berhasil",
          color: "success",
          description: `Kode referral baru berhasil dibuat: ${response.data.data.referal}`,
        });

        // Add the new referral to the list
        setReferrals([response.data.data, ...referrals]);
      } else {
        throw new Error("Format respons dari server tidak sesuai");
      }
    } catch (error: any) {
      console.error("Error generating referral:", error);

      // Check for unauthorized or token expired
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = "/login";
        return;
      }

      addToast({
        title: "Gagal",
        color: "danger",
        description:
          error.response?.data?.error ||
          "Gagal membuat kode referral baru, silahkan coba lagi",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Show confirmation modal function
  const showDeleteConfirmation = (referral: Referral) => {
    setConfirmModal({
      isOpen: true,
      referralId: referral.referal, // Use referal code instead of _id
      referralCode: referral.referal,
    });
  };

  // Close confirmation modal
  const closeDeleteConfirmation = () => {
    setConfirmModal({ isOpen: false, referralId: "", referralCode: "" });
  };

  // Modified delete referral function to use the referral code for deletion
  const deleteReferral = async (code: string) => {
    setDeleting(code);
    try {
      const response = await axios.delete(
        `/api/provider/referral/delete/${code}`
      );

      if (response.data.status === "ok") {
        addToast({
          title: "Berhasil",
          color: "success",
          description: "Kode referral berhasil dihapus",
        });

        // Remove the deleted referral from the list using the referral code
        setReferrals(referrals.filter((ref) => ref.referal !== code));
      } else {
        throw new Error("Format respons dari server tidak sesuai");
      }
    } catch (error: any) {
      console.error("Error deleting referral:", error);

      // Check for unauthorized or token expired
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = "/login";
        return;
      }

      addToast({
        title: "Gagal",
        color: "danger",
        description:
          error.response?.data?.error ||
          "Gagal menghapus kode referral, silahkan coba lagi",
      });
    } finally {
      setDeleting(null);
      closeDeleteConfirmation(); // Close the modal when done
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        addToast({
          title: "Berhasil Disalin",
          color: "success",
          description: `Kode referral ${code} berhasil disalin ke clipboard`,
        });
      },
      (err) => {
        console.error("Tidak dapat menyalin teks: ", err);
        addToast({
          title: "Gagal Menyalin",
          color: "danger",
          description: "Gagal menyalin kode referral",
        });
      }
    );
  };

  const isExpired = (ttl: string) => {
    return !isAfter(new Date(ttl), new Date());
  };

  return (
    <div className="space-y-6 ">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Kelola Agent</h1>
          <p className="opacity-90 max-w-2xl">
            Buat dan kelola kode referral untuk mengundang pelanggan bergabung
            dengan layanan Anda. Setiap kode referral valid hingga tanggal
            kedaluwarsa yang ditentukan.
          </p>

          <Button
            color="default"
            className="mt-6 bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={generateReferral}
            isLoading={generating}
            startContent={
              !generating && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )
            }
          >
            {generating ? "Membuat Kode..." : "Buat Kode Referral Baru"}
          </Button>
        </div>
      </div>

      {/* Referral List Section */}
      <Card className="shadow-lg border-0 overflow-hidden rounded-xl">
        <CardHeader className="bg-gray-50 border-b px-6 py-5">
          <h2 className="text-xl font-semibold">Daftar Kode Agent</h2>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
              <span className="ml-2 text-gray-600">Memuat data agent...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 px-6">
              {error ===
              "Maaf, fitur ini hanya tersedia untuk Penanggung Jawab" ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-blue-50 rounded-full p-4 inline-block mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    Akses Terbatas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Fitur pembuatan kode agent hanya tersedia untuk akun dengan
                    hak akses Penanggung Jawab. Silahkan hubungi administrator
                    jika Anda memerlukan akses.
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="bg-blue-50 rounded-full p-4 inline-block mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Belum Ada Kode Referral
              </h3>
              <p className="text-gray-500 mb-4">
                Anda belum memiliki kode referral. Klik tombol di atas untuk
                membuat kode baru.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Kode Referral
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Berlaku Sampai
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrals.map((referral) => {
                    const expired = isExpired(referral.ttl);
                    return (
                      <tr key={referral._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                />
                              </svg>
                            </div>
                            <span className="font-medium text-gray-900">
                              {referral.referal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(referral.ttl), "d MMMM yyyy", {
                              locale: id,
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(referral.ttl), "HH:mm", {
                              locale: id,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {referral.active && !expired ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span>Aktif</span>
                              <span className="ml-1.5 h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            </div>
                          ) : expired ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <span>Kedaluwarsa</span>
                              <span className="ml-1.5 h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <span>Tidak Aktif</span>
                              <span className="ml-1.5 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Tooltip content="Salin kode referral">
                            <Button
                              isIconOnly
                              variant="light"
                              color="primary"
                              onClick={() => copyToClipboard(referral.referal)}
                              disabled={!referral.active || expired}
                              className="mr-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                              </svg>
                            </Button>
                          </Tooltip>{" "}
                          <Tooltip content="Hapus kode referral">
                            <Button
                              isIconOnly
                              variant="solid"
                              color="danger"
                              onClick={() => showDeleteConfirmation(referral)}
                              className="ml-2 delete-button"
                              size="sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Button>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 shadow-md border-0 rounded-xl overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50">
        <CardBody className="p-6">
          <div className="flex items-start">
            <div className="mr-4 text-amber-500 bg-amber-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-amber-800 mb-2">
                Informasi Tentang Kode Referral
              </h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Kode referral memiliki masa berlaku selama 1 tahun sejak
                  dibuat.
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Setiap kode dapat digunakan untuk mengundang pelanggan
                  bergabung dengan layanan Anda.
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pelanggan perlu memasukkan kode ini saat mendaftar di halaman
                  "Join Provider".
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in overflow-hidden">
            <div className="bg-red-50 p-5 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800">
                Konfirmasi Hapus
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Apakah Anda yakin ingin menghapus kode referral{" "}
                <span className="font-semibold">
                  {confirmModal.referralCode}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-4 flex gap-3 justify-end">
                <Button
                  color="default"
                  variant="light"
                  onClick={closeDeleteConfirmation}
                >
                  Batal
                </Button>
                <Button
                  color="danger"
                  variant="solid"
                  onClick={() => deleteReferral(confirmModal.referralId)}
                  isLoading={deleting === confirmModal.referralId}
                >
                  {deleting === confirmModal.referralId
                    ? "Menghapus..."
                    : "Hapus"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
