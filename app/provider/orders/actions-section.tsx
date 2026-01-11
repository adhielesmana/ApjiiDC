import { Button } from "@heroui/button";
import { useState } from "react";

interface ActionsSectionProps {
  orderId: string;
  contractId: string;
  showActivation: boolean;
  onActivate: (orderId: string) => void;
  activatingOrder: string | null;
  onCancelActivation: () => void;
  onSubmitActivation: (contractId: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  orderStatus: string; // Added orderStatus prop
}

export function ActionsSection({
  orderId,
  contractId,
  showActivation,
  onActivate,
  activatingOrder,
  onCancelActivation,
  onSubmitActivation,
  selectedFile,
  setSelectedFile,
  orderStatus,
}: ActionsSectionProps) {
  const detailsUrl = `/provider/orders/detail/${contractId}`;

  // Debug log to verify the conditions for showing the Activate button
  console.log(
    `ActionsSection - Order ${orderId} - Status: ${orderStatus}, showActivation: ${showActivation}`
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Combined Detail Button with Icon - Always visible */}
      <Button
        size="sm"
        color="default"
        variant="bordered"
        className="w-full"
        startContent={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        }
        onPress={() => (window.location.href = detailsUrl)}
      >
        View Details
      </Button>

      {/* Activate Order button - shown only for provisioned orders */}
      {orderStatus === "provisioned" && activatingOrder !== orderId && (
        <Button
          size="sm"
          color="primary"
          className="w-full"
          onPress={() => onActivate(orderId)}
        >
          Activate Order
        </Button>
      )}

      {/* BAA Upload Form - shown when activating */}
      {orderStatus === "provisioned" && activatingOrder === orderId && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-xs">
          <p className="mb-2 font-medium text-blue-700">
            Upload BAA document to activate this order:
          </p>
          <input
            type="file"
            className="block w-full text-xs text-gray-500
            file:mr-4 file:py-1.5 file:px-3
            file:rounded file:border-0
            file:text-xs file:font-medium
            file:bg-blue-100 file:text-blue-700
            hover:file:bg-blue-200"
            onChange={(e) =>
              setSelectedFile(e.target.files ? e.target.files[0] : null)
            }
          />
          <div className="flex justify-end mt-3 gap-2">
            <Button
              size="sm"
              variant="flat"
              className="text-xs"
              onPress={onCancelActivation}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              color="primary"
              className="text-xs"
              onPress={() => onSubmitActivation(contractId)}
              isDisabled={!selectedFile}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
