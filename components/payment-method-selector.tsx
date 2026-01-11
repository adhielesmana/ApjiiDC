"use client";

import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";

export type PaymentMethodType = "bank_transfer" | "qris";

export interface PaymentMethod {
  value: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    description: "Pilih dari berbagai metode transfer bank",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7L2 17C2 18.1046 2.89543 19 4 19L20 19C21.1046 19 22 18.1046 22 17L22 7L12 2Z" />
        <path d="M12 12L12 19" />
        <path d="M2 7L12 12L22 7" />
        <path d="M6 10L6 16" />
        <path d="M18 10L18 16" />
      </svg>
    ),
  },
  {
    value: "qris",
    label: "QRIS (Quick Response Code)",
    description: "Scan QR Code untuk melakukan pembayaran",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M17 17H21V21" />
      </svg>
    ),
  },
];

const BANK_OPTIONS = [
  {
    value: "bca",
    label: "BCA (Bank Central Asia)",
    accountNumber: "1234567890",
    accountName: "PT APJII Data Center",
  },
  {
    value: "mandiri",
    label: "Bank Mandiri",
    accountNumber: "1234567890",
    accountName: "PT APJII Data Center",
  },
  {
    value: "bri",
    label: "BRI (Bank Rakyat Indonesia)",
    accountNumber: "1234567890",
    accountName: "PT APJII Data Center",
  },
  {
    value: "btn",
    label: "BTN (Bank Tabungan Negara)",
    accountNumber: "1234567890",
    accountName: "PT APJII Data Center",
  },
  {
    value: "cimb",
    label: "CIMB Niaga",
    accountNumber: "1234567890",
    accountName: "PT APJII Data Center",
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType | null;
  onMethodChange: (method: PaymentMethodType) => void;
  selectedBank?: string | null;
  onBankChange?: (bank: string) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  selectedBank,
  onBankChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          Pilih Metode Pembayaran
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <Card
              key={method.value}
              isPressable
              isHoverable
              className={`transition-all cursor-pointer ${
                selectedMethod === method.value
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border border-gray-200 hover:border-blue-300"
              }`}
              onPress={() => onMethodChange(method.value)}
            >
              <CardBody className="flex-row items-center gap-3 py-3 px-4">
                <div
                  className={`p-2 rounded-lg ${
                    selectedMethod === method.value
                      ? "bg-blue-200 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === method.value
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedMethod === method.value && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                    </svg>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Bank Selection for Bank Transfer */}
      {selectedMethod === "bank_transfer" && (
        <>
          <Divider />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">
              Pilih Bank Tujuan
            </label>
            <Select
              label="Pilih bank..."
              selectedKeys={selectedBank ? [selectedBank] : []}
              onChange={(e) => onBankChange?.(e.target.value)}
              classNames={{
                trigger: "h-12",
              }}
            >
              {BANK_OPTIONS.map((bank) => (
                <SelectItem key={bank.value}>{bank.label}</SelectItem>
              ))}
            </Select>

            {/* Display Bank Details */}
            {selectedBank && (
              <>
                <Divider className="my-4" />
                {(() => {
                  const selectedBankData = BANK_OPTIONS.find(
                    (b) => b.value === selectedBank
                  );
                  return (
                    <Card className="bg-blue-50 border border-blue-200">
                      <CardBody className="space-y-3 py-4 px-4">
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Nama Bank
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedBankData?.label}
                          </p>
                        </div>
                        <Divider />
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Nomor Rekening
                          </p>
                          <p className="font-mono text-lg font-bold text-blue-700">
                            {selectedBankData?.accountNumber}
                          </p>
                        </div>
                        <Divider />
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Atas Nama
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedBankData?.accountName}
                          </p>
                        </div>
                        <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-300">
                          <p className="text-xs text-blue-900">
                            <strong>Catatan:</strong> Pastikan informasi akun
                            sudah benar sebelum melakukan transfer. Pembayaran
                            akan diverifikasi secara otomatis setelah diterima.
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })()}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
