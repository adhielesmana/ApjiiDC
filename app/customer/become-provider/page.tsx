"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { Select, SelectItem } from "@heroui/select";
import axios from "axios";
import { useAuthData } from "@/hooks/useAuthData";
import { AuthService } from "@/services/auth.service";
import Image from "next/image";

// Define interfaces for location data
interface Province {
  id_provinsi: string;
  nama_provinsi: string;
}

interface Regency {
  id_kabupaten: string;
  nama_kabupaten: string;
}

interface District {
  id_kecamatan: string;
  nama_kecamatan: string;
}

interface Village {
  id_kelurahan: string;
  nama_kelurahan: string;
}

interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

export default function BecomeProviderPage() {
  const router = useRouter();
  const { user } = useAuthData();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact: {
      email: user?.email || "",
      phone: "",
    },
    city: "",
    province: "",
    pos: "",
    address: "",
    logo: "",
    addressDetail: {
      province: "",
      provinceName: "",
      regency: "",
      regencyName: "",
      district: "",
      districtName: "",
      village: "",
      villageName: "",
      detail: "",
    },
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Only check token in client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("token", localStorage.getItem("token"));
    }
  }, []);

  // Fetch provinces
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await axios.get("/api/wilayah?type=provinces");
      console.log("Provinces API response:", response.data);

      // Ensure we have an array
      if (Array.isArray(response.data)) {
        setProvinces(response.data);
      } else {
        console.error("Provinces data is not an array:", response.data);
        addToast({
          title: "Error",
          color: "danger",
          description: "Invalid province data format",
        });
        setProvinces([]);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to retrieve province data",
      });
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch regencies based on selected province
  const fetchRegencies = async (provinceId: string) => {
    if (!provinceId) return;
    setLoadingRegencies(true);
    try {
      const response = await axios.get(
        `/api/wilayah?type=regencies&provinceCode=${provinceId}`
      );
      console.log("Regencies API response:", response.data);

      // Ensure we have an array
      if (Array.isArray(response.data)) {
        setRegencies(response.data);
      } else {
        console.error("Regencies data is not an array:", response.data);
        addToast({
          title: "Error",
          color: "danger",
          description: "Invalid city/regency data format",
        });
        setRegencies([]);
      }

      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        addressDetail: {
          ...prev.addressDetail,
          regency: "",
          regencyName: "",
          district: "",
          districtName: "",
          village: "",
          villageName: "",
        },
      }));
      setDistricts([]);
      setVillages([]);
    } catch (error) {
      console.error("Error fetching regencies:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to retrieve city/regency data",
      });
    } finally {
      setLoadingRegencies(false);
    }
  };

  // Fetch districts based on selected regency
  const fetchDistricts = async (provinceId: string, regencyId: string) => {
    if (!provinceId || !regencyId) return;
    setLoadingDistricts(true);
    try {
      const response = await axios.get(
        `/api/wilayah?type=districts&provinceCode=${provinceId}&regencyCode=${regencyId}`
      );
      console.log("Districts API response:", response.data);

      // Ensure we have an array
      if (Array.isArray(response.data)) {
        setDistricts(response.data);
      } else {
        console.error("Districts data is not an array:", response.data);
        addToast({
          title: "Error",
          color: "danger",
          description: "Invalid district data format",
        });
        setDistricts([]);
      }

      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        addressDetail: {
          ...prev.addressDetail,
          district: "",
          districtName: "",
          village: "",
          villageName: "",
        },
      }));
      setVillages([]);
    } catch (error) {
      console.error("Error fetching districts:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to retrieve district data",
      });
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch villages based on selected district
  const fetchVillages = async (
    provinceId: string,
    regencyId: string,
    districtId: string
  ) => {
    if (!provinceId || !regencyId || !districtId) return;
    setLoadingVillages(true);
    try {
      const response = await axios.get(
        `/api/wilayah?type=villages&provinceCode=${provinceId}&regencyCode=${regencyId}&districtCode=${districtId}`
      );
      console.log("Villages API response:", response.data);

      // Ensure we have an array
      if (Array.isArray(response.data)) {
        setVillages(response.data);
      } else {
        console.error("Villages data is not an array:", response.data);
        addToast({
          title: "Error",
          color: "danger",
          description: "Invalid village/subdistrict data format",
        });
        setVillages([]);
      }

      // Reset dependent field
      setFormData((prev) => ({
        ...prev,
        addressDetail: {
          ...prev.addressDetail,
          village: "",
          villageName: "",
        },
      }));
    } catch (error) {
      console.error("Error fetching villages:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to retrieve village/subdistrict data",
      });
    } finally {
      setLoadingVillages(false);
    }
  };

  // Format the address from components before submission
  const formatAddress = () => {
    const { provinceName, regencyName, districtName, villageName, detail } =
      formData.addressDetail;
    return `${detail}, ${villageName}, ${districtName}, ${regencyName}, ${provinceName}`;
  };
  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      addToast({
        title: "Error",
        color: "danger",
        description: "File must be an image (JPG, PNG, etc.)",
      });
      return;
    }

    // Check file size (limit to 1MB to be safe with server limits)
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    if (file.size > MAX_FILE_SIZE) {
      addToast({
        title: "Error",
        color: "danger",
        description: `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB. Selected file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });
      return;
    }

    setLogoFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    addToast({
      title: "Logo Selected",
      color: "success",
      description: `File ${file.name} (${(file.size / 1024).toFixed(2)}KB) successfully selected`,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({}); // Reset errors

    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error("Partner name is required");
      }

      if (!isValidEmail(formData.contact.email)) {
        throw new Error("Invalid email format");
      }

      // if (!isValidPhone(formData.contact.phone)) {
      //   throw new Error(
      //     "Invalid phone number format (use format: 08xx or +62xx)"
      //   );
      // }

      // Create FormData object for multipart/form-data submission
      const formDataObj = new FormData();

      // Add all form fields - using bracket notation instead of dot notation
      formDataObj.append("name", formData.name);
      formDataObj.append("description", formData.description);

      // IMPORTANT: Use bracket notation for contact fields
      formDataObj.append("contact[email]", formData.contact.email.trim());
      formDataObj.append(
        "contact[phone]",
        formData.contact.phone.trim().replace(/\s+/g, "")
      );

      formDataObj.append("city", formData.addressDetail.regencyName);
      formDataObj.append("province", formData.addressDetail.provinceName);
      formDataObj.append("pos", formData.pos);
      formDataObj.append("address", formatAddress());

      // Add logo file if exists
      if (logoFile) {
        formDataObj.append("logo", logoFile);
      }

      const authHeader = AuthService.getAuthHeader();
      const headers = {
        ...authHeader,
        // Don't set Content-Type here, it will be set automatically with the boundary
      };

      // Add toast to inform user the upload is in progress
      if (logoFile) {
        addToast({
          title: "Uploading Data",
          color: "default",
          description: `Uploading logo (${(logoFile.size / 1024).toFixed(2)}KB), please wait...`,
        });
      }

      const response = await axios.post(
        "/api/customer/become-provider",
        formDataObj,
        {
          headers,
          onUploadProgress: (progressEvent) => {
            // Calculate and show upload progress if needed
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload Progress: ${percentCompleted}%`);
            }
          },
        }
      );

      addToast({
        title: "Success",
        color: "success",
        description: "Partner registration submitted successfully",
      });
      router.push("/customer");
    } catch (error: any) {
      console.error("Error creating partner:", error);

      // Handle 413 Payload Too Large specifically
      if (error.response?.status === 413) {
        addToast({
          title: "Error - File Too Large",
          color: "danger",
          description:
            error.response?.data?.message ||
            "Logo file size is too large. Please use a file smaller than 1MB.",
        });
        setLoading(false);
        return;
      }

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors: ValidationError[] = error.response.data.errors;
        const newFieldErrors: Record<string, string> = {};

        errors.forEach((error) => {
          newFieldErrors[error.path] = error.msg;
        });

        setFieldErrors(newFieldErrors);

        addToast({
          title: "Validation Failed",
          color: "danger",
          description: "Please review and correct the form fields",
        });
      } else {
        let errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Partner registration failed";

        // Display additional details if available
        if (error.response?.data?.details) {
          errorMessage += `: ${error.response.data.details}`;
        }

        // If the error seems related to special characters in name
        if (
          errorMessage.toLowerCase().includes("name") ||
          errorMessage.toLowerCase().includes("karakter") ||
          errorMessage.toLowerCase().includes("nama")
        ) {
          errorMessage = `There is an issue with the partner name "${formData.name}". Please try a simpler name without special characters.`;
        }

        addToast({
          title: "Failed",
          color: "danger",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    // Clear error when user types
    if (fieldErrors["name"]) {
      setFieldErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  // Add a generic handler for contact fields
  const handleContactChange = (field: "email" | "phone", value: string) => {
    setFormData({
      ...formData,
      contact: { ...formData.contact, [field]: value },
    });
    // Clear error when user types
    if (fieldErrors[`contact.${field}`]) {
      setFieldErrors((prev) => ({ ...prev, [`contact.${field}`]: "" }));
    }
  };

  // Add a handler for description
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, description: value });
    // Clear error when user types
    if (fieldErrors["description"]) {
      setFieldErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  // Add a handler for pos code
  const handlePosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, pos: value });
    // Clear error when user types
    if (fieldErrors["pos"]) {
      setFieldErrors((prev) => ({ ...prev, pos: "" }));
    }
  };

  // Modify address detail handler
  const handleAddressDetailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      addressDetail: {
        ...formData.addressDetail,
        detail: e.target.value,
      },
    });
    // Clear error when user types
    if (fieldErrors["address"]) {
      setFieldErrors((prev) => ({ ...prev, address: "" }));
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const selectedProvince = provinces.find(
      (p) => p.id_provinsi === provinceId
    );
    setFormData({
      ...formData,
      addressDetail: {
        ...formData.addressDetail,
        province: provinceId,
        provinceName: selectedProvince?.nama_provinsi || "",
      },
    });
    fetchRegencies(provinceId);
  };

  const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regencyId = e.target.value;
    const selectedRegency = regencies.find((r) => r.id_kabupaten === regencyId);
    setFormData({
      ...formData,
      addressDetail: {
        ...formData.addressDetail,
        regency: regencyId,
        regencyName: selectedRegency?.nama_kabupaten || "",
      },
    });
    fetchDistricts(formData.addressDetail.province, regencyId);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const selectedDistrict = districts.find(
      (d) => d.id_kecamatan === districtId
    );
    setFormData({
      ...formData,
      addressDetail: {
        ...formData.addressDetail,
        district: districtId,
        districtName: selectedDistrict?.nama_kecamatan || "",
      },
    });
    fetchVillages(
      formData.addressDetail.province,
      formData.addressDetail.regency,
      districtId
    );
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const villageId = e.target.value;
    const selectedVillage = villages.find((v) => v.id_kelurahan === villageId);
    setFormData({
      ...formData,
      addressDetail: {
        ...formData.addressDetail,
        village: villageId,
        villageName: selectedVillage?.nama_kelurahan || "",
      },
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^(?:\+62|08)[0-9]{9,13}$/;
    return phoneRegex.test(phone);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg overflow-hidden mb-8 max-w-4xl mx-auto">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Register as a Partner</h1>
          <p className="opacity-90">
            Complete the information below to register as a partner. All
            submissions will be reviewed by our team.
          </p>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b px-6 py-5">
          <h2 className="text-xl font-semibold">Partner Information</h2>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Partner Name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  size="lg"
                  isInvalid={Boolean(fieldErrors["name"])}
                  errorMessage={fieldErrors["name"]}
                  classNames={{
                    input: "text-lg",
                    label: "text-base font-medium",
                  }}
                  description="Use a simple name without special characters such as quotation marks (') if issues occur"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-base font-medium mb-2">
                  Partner Logo
                </label>
                <div className="flex flex-col space-y-4">
                  {logoPreview && (
                    <div className="relative w-32 h-32 mx-auto border rounded-lg overflow-hidden bg-gray-100 shadow-md">
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-3 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100 
                      cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Upload partner logo (JPG/PNG format, max 2MB)
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  required
                  minRows={3}
                  isInvalid={Boolean(fieldErrors["description"])}
                  errorMessage={fieldErrors["description"]}
                  classNames={{
                    label: "text-base font-medium",
                  }}
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleContactChange("email", e.target.value)}
                required
                isInvalid={Boolean(fieldErrors["contact.email"])}
                errorMessage={fieldErrors["contact.email"]}
                description="Format: name@domain.com"
                classNames={{
                  label: "text-base font-medium",
                }}
              />

              <Input
                label="Phone Number"
                value={formData.contact.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                required
                isInvalid={Boolean(fieldErrors["contact.phone"])}
                errorMessage={fieldErrors["contact.phone"]}
                description="Format: 08xxxxxxxxxx or +62xxxxxxxxxx"
                placeholder="08xxxxxxxxxx"
                classNames={{
                  label: "text-base font-medium",
                }}
              />
            </div>

            <div className="border-t border-gray-200 pt-6 pb-2">
              <h3 className="text-lg font-medium mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Province Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Province{loadingProvinces && " (Loading...)"}
                  </label>
                  <Select
                    className="w-full"
                    value={formData.addressDetail.province}
                    onChange={handleProvinceChange}
                    isDisabled={loadingProvinces}
                    placeholder="Select Province"
                    required
                    size="lg"
                  >
                    {provinces.map((province) => (
                      <SelectItem
                        key={province.id_provinsi}
                        id={province.id_provinsi}
                      >
                        {province.nama_provinsi}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Regency Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City/Regency{loadingRegencies && " (Loading...)"}
                  </label>
                  <Select
                    className="w-full"
                    value={formData.addressDetail.regency}
                    onChange={handleRegencyChange}
                    isDisabled={
                      !formData.addressDetail.province || loadingRegencies
                    }
                    placeholder="Select City/Regency"
                    required
                    size="lg"
                  >
                    {regencies.map((regency) => (
                      <SelectItem
                        key={regency.id_kabupaten}
                        id={regency.id_kabupaten}
                      >
                        {regency.nama_kabupaten}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* District Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    District{loadingDistricts && " (Loading...)"}
                  </label>
                  <Select
                    className="w-full"
                    value={formData.addressDetail.district}
                    onChange={handleDistrictChange}
                    isDisabled={
                      !formData.addressDetail.regency || loadingDistricts
                    }
                    placeholder="Select District"
                    required
                    size="lg"
                  >
                    {districts.map((district) => (
                      <SelectItem
                        key={district.id_kecamatan}
                        id={district.id_kecamatan}
                      >
                        {district.nama_kecamatan}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Village Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Village/Subdistrict{loadingVillages && " (Loading...)"}
                  </label>
                  <Select
                    className="w-full"
                    value={formData.addressDetail.village}
                    onChange={handleVillageChange}
                    isDisabled={
                      !formData.addressDetail.district || loadingVillages
                    }
                    placeholder="Select Village/Subdistrict"
                    required
                    size="lg"
                  >
                    {villages.map((village) => (
                      <SelectItem
                        key={village.id_kelurahan}
                        id={village.id_kelurahan}
                      >
                        {village.nama_kelurahan}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <Input
                  label="Postal Code"
                  value={formData.pos}
                  onChange={handlePosChange}
                  required
                  isInvalid={Boolean(fieldErrors["pos"])}
                  errorMessage={fieldErrors["pos"]}
                  maxLength={5}
                  pattern="\d{5}"
                  placeholder="Example: 12345"
                  classNames={{
                    label: "text-base font-medium",
                  }}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Street Address (Street Name, Number, Building)"
                    value={formData.addressDetail.detail}
                    onChange={handleAddressDetailChange}
                    required
                    size="lg"
                    isInvalid={Boolean(fieldErrors["address"])}
                    errorMessage={fieldErrors["address"]}
                    classNames={{
                      label: "text-base font-medium",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                color="primary"
                className="w-full py-6 text-lg font-semibold rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                isLoading={loading}
              >
                {loading ? "Processing..." : "Register as Partner"}
              </Button>

              <div className="mt-4 text-center">
                <Button
                  color="default"
                  variant="light"
                  className="text-sm"
                  onClick={() => router.push("/customer")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
