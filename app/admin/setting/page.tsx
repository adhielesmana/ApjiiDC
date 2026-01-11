"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Skeleton } from "@heroui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@heroui/alert";
import { AlertCircle, Check, Info } from "lucide-react";
import { addToast } from "@heroui/toast";

interface Settings {
  _id: string;
  isMaintenance: boolean;
  ppn: number;
  __v: number;
}

export default function AdminSettingPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [savingPpn, setSavingPpn] = useState(false);
  const [ppnValue, setPpnValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/setting");

      if (response.data.status === "ok") {
        setSettings(response.data.data);
        setPpnValue(response.data.data.ppn.toString());
      } else {
        setError(response.data.message || "Failed to fetch settings");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch settings");
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to fetch settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenance = async (value: boolean) => {
    try {
      setSavingMaintenance(true);
      setError(null);

      const response = await axios.post("/api/admin/setting", {
        maintenance: value,
      });

      if (response.data.status === "ok") {
        if (settings) {
          setSettings({
            ...settings,
            isMaintenance: value,
          });
        }
        addToast({
          title: "Success",
          color: "success",
          description: `Maintenance mode ${value ? "enabled" : "disabled"}`,
        });
      } else {
        setError(response.data.message || "Failed to update maintenance mode");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to update maintenance mode"
      );
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to update maintenance mode",
      });
    } finally {
      setSavingMaintenance(false);
    }
  };

  const updatePpn = async () => {
    // Validate PPN input
    const ppnNumber = parseFloat(ppnValue);
    if (isNaN(ppnNumber) || ppnNumber < 0) {
      addToast({
        title: "Invalid Input",
        color: "danger",
        description: "PPN must be a positive number",
      });
      return;
    }

    try {
      setSavingPpn(true);
      setError(null);

      const response = await axios.post("/api/admin/setting", {
        ppn: ppnNumber,
      });

      if (response.data.status === "ok") {
        if (settings) {
          setSettings({
            ...settings,
            ppn: ppnNumber,
          });
        }
        addToast({
          title: "Success",
          color: "success",
          description: "PPN updated successfully",
        });
      } else {
        setError(response.data.message || "Failed to update PPN");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update PPN");
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to update PPN",
      });
    } finally {
      setSavingPpn(false);
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for header */}
        <div className="rounded-2xl overflow-hidden">
          <Skeleton className="h-40 w-full" />
        </div>

        {/* Skeleton for card grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Maintenance Mode Card Skeleton */}
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 py-3">
              <Skeleton className="h-6 w-3/4 rounded mb-2" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </CardHeader>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40 rounded" />
                  <Skeleton className="h-4 w-60 rounded" />
                </div>
                <Skeleton className="h-8 w-12 rounded-full" />
              </div>
            </CardBody>
          </Card>

          {/* PPN Settings Card Skeleton */}
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 py-3">
              <Skeleton className="h-6 w-3/4 rounded mb-2" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40 rounded" />
                  <div className="flex gap-2 items-center">
                    <Skeleton className="h-10 w-24 rounded" />
                    <Skeleton className="h-10 w-16 rounded" />
                  </div>
                </div>

                <div className="rounded-md p-3 bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-6 w-12 rounded" />
                  </div>
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">System Settings</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            Manage application-wide system settings and configurations
          </div>
        </div>
      </div>{" "}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {" "}
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 py-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              Maintenance Mode
              <span
                className="cursor-help text-muted-foreground"
                title="When enabled, the application will be put into maintenance mode and users won't be able to access it."
              >
                <Info className="h-4 w-4" />
              </span>
            </h3>
            <p className="text-sm text-gray-500">
              Enable or disable system maintenance mode
            </p>
          </CardHeader>

          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              {" "}
              <div>
                <div className="mb-2">
                  <Chip
                    color={settings?.isMaintenance ? "danger" : "success"}
                    variant="flat"
                  >
                    {settings?.isMaintenance
                      ? "MAINTENANCE MODE ENABLED"
                      : "SYSTEM ONLINE"}
                  </Chip>
                </div>{" "}
                <p className="text-sm text-gray-500 mt-1">
                  {settings?.isMaintenance
                    ? "System is in maintenance mode. Users cannot access the application."
                    : "System is operating normally and accessible to all users."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {" "}
                {savingMaintenance ? (
                  <Skeleton className="h-4 w-4 rounded-full" />
                ) : null}{" "}
                <Switch
                  id="maintenance-mode"
                  isSelected={settings?.isMaintenance || false}
                  onValueChange={updateMaintenance}
                  disabled={savingMaintenance}
                />
              </div>
            </div>
          </CardBody>
        </Card>{" "}
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 py-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              PPN (Tax) Settings
              <span
                className="cursor-help text-muted-foreground"
                title="Set the PPN (Pajak Pertambahan Nilai) percentage that will be applied to orders."
              >
                <Info className="h-4 w-4" />
              </span>
            </h3>
            <p className="text-sm text-gray-500">
              Configure the tax percentage applied to transactions
            </p>
          </CardHeader>

          <CardBody className="p-6">
            <div className="space-y-4">
              {" "}
              <div>
                <Chip color="primary" variant="flat" className="mb-2">
                  PPN Percentage (%)
                </Chip>
                <div className="flex gap-2 items-center mt-1.5">
                  {" "}
                  <Input
                    id="ppn-value"
                    type="number"
                    min="0"
                    step="0.1"
                    value={ppnValue}
                    onValueChange={(value) => setPpnValue(value)}
                    className="max-w-[120px]"
                    disabled={savingPpn}
                  />
                  <span>%</span>{" "}
                  <Button
                    onPress={updatePpn}
                    disabled={
                      savingPpn || ppnValue === settings?.ppn.toString()
                    }
                    size="sm"
                    className="ml-2"
                    color="primary"
                  >
                    {" "}
                    {savingPpn ? (
                      <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </div>{" "}
              <div className="bg-blue-50 rounded-md p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span>Current PPN rate:</span>
                  <Chip color="primary" variant="flat" size="sm">
                    {settings?.ppn}%
                  </Chip>
                </div>
                <p className="text-xs text-gray-500">
                  This rate will be applied to all new orders in the system.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
