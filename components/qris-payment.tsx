"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardBody } from "@heroui/card";
import { QRCodeSVG } from "qrcode.react";

interface QRISPaymentProps {
  invoiceId: string;
  amount: number;
  timeoutDuration?: number; // in seconds, default 600 (10 minutes)
  onTimeout?: () => void;
}

export function QRISPayment({
  invoiceId,
  amount,
  timeoutDuration = 600,
  onTimeout,
}: QRISPaymentProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeoutDuration);
  const [isExpired, setIsExpired] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Generate random QRIS link untuk QR code
  const qrisLink = `https://qris.apjii.id/pay/${invoiceId}/${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          onTimeout?.();
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired, onTimeout]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (timeRemaining / timeoutDuration) * 100;

  return (
    <div className="space-y-4">
      <Card className={isExpired ? "bg-red-50 border-red-200" : "bg-blue-50"}>
        <CardBody className="space-y-4 p-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div
              ref={qrCodeRef}
              className={`p-4 rounded-lg ${
                isExpired ? "bg-red-100" : "bg-white"
              } border-2 ${isExpired ? "border-red-300" : "border-blue-200"}`}
            >
              {!isExpired ? (
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <QRCodeSVG
                    value={qrisLink}
                    size={256}
                    level="H"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-red-100 rounded-lg border-2 border-red-300">
                  <div className="text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-12 h-12 text-red-500 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-red-600 font-semibold">
                      QR Code Expired
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-2 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Invoice ID:</span>
              <span className="font-mono font-semibold text-gray-900">
                {invoiceId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="font-bold text-lg text-blue-700">
                Rp {amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Timer Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                QR Code Validity
              </span>
              <span
                className={`text-2xl font-bold font-mono ${
                  isExpired
                    ? "text-red-600"
                    : timeRemaining < 60
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            {/* Custom Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isExpired
                    ? "bg-red-500"
                    : timeRemaining < 60
                      ? "bg-orange-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {isExpired
                ? "QR Code telah kadaluarsa. Silakan muat ulang untuk mendapatkan QR Code baru."
                : "QR Code akan kadaluarsa dalam waktu yang ditunjukkan di atas"}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm text-blue-900">
              Cara Pembayaran via QRIS:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Buka aplikasi mobile banking atau e-wallet Anda</li>
              <li>Pilih menu "Scan QR" atau "Bayar dengan QRIS"</li>
              <li>Arahkan kamera ke QR Code di atas</li>
              <li>Verifikasi jumlah pembayaran dan lanjutkan</li>
              <li>Pembayaran akan diverifikasi secara otomatis</li>
            </ol>
          </div>

          {/* After Payment Instructions */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <p className="text-xs text-amber-900">
              <strong>Catatan:</strong> Setelah pembayaran berhasil, status
              order Anda akan diperbarui secara otomatis dalam beberapa saat.
              Jika belum terupdate, silakan refresh halaman.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
