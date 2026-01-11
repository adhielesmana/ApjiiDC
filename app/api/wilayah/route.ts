import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://sipedas.pertanian.go.id/api/wilayah";
const DEFAULT_YEAR = "2025"; // Using default year 2025 as per example

// Helper function to handle API requests
async function fetchFromSipedas(
  endpoint: string,
  params: Record<string, string>
) {
  try {
    const url = `${BASE_URL}/${endpoint}`;
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching from Sipedas API (${endpoint}):`,
      error.message
    );
    throw error;
  }
}

// Transform object response to array format
function objectToArray(
  data: Record<string, string>,
  endpoint: string,
  type: string
) {
  if (!data || typeof data !== "object") {
    console.warn("API returned invalid data format:", data);
    return [];
  }

  return Object.entries(data).map(([id, name]) => {
    switch (true) {
      case /provinces|list_pro/.test(String(id)):
        return { id_provinsi: id, nama_provinsi: name };
      case /regencies|list_kab/.test(String(id)):
        return { id_kabupaten: id, nama_kabupaten: name };
      case /districts|list_kec/.test(String(id)):
        return { id_kecamatan: id, nama_kecamatan: name };
      case /villages|list_des/.test(String(id)):
        return { id_kelurahan: id, nama_kelurahan: name };
      default:
        switch (true) {
          case endpoint === "list_pro" || type === "provinces":
            return { id_provinsi: id, nama_provinsi: name };
          case endpoint === "list_kab" || type === "regencies":
            return { id_kabupaten: id, nama_kabupaten: name };
          case endpoint === "list_kec" || type === "districts":
            return { id_kecamatan: id, nama_kecamatan: name };
          case endpoint === "list_des" || type === "villages":
            return { id_kelurahan: id, nama_kelurahan: name };
          default:
            return { id, name };
        }
    }
  });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");
  const year = searchParams.get("year") || DEFAULT_YEAR;

  try {
    let data;
    let endpoint = "";

    switch (type) {
      case "provinces":
        endpoint = "list_pro";
        data = await fetchFromSipedas(endpoint, { thn: year });

        // Transform object response to array format for provinces
        if (!Array.isArray(data)) {
          console.log("Converting provinces object to array:", data);
          // Format: { "11": "ACEH", "12": "SUMATERA UTARA", ... }
          const transformedData = Object.entries(data).map(([id, name]) => ({
            id_provinsi: id,
            nama_provinsi: name,
          }));
          data = transformedData;
        }
        break;

      case "regencies":
        endpoint = "list_kab";
        const provinceCode = searchParams.get("provinceCode");
        if (!provinceCode) {
          return NextResponse.json(
            { error: "Province code is required" },
            { status: 400 }
          );
        }
        data = await fetchFromSipedas(endpoint, {
          thn: year,
          lvl: "11", // Province level
          pro: provinceCode,
        });

        // Transform object response to array format for regencies
        if (!Array.isArray(data)) {
          console.log("Converting regencies object to array:", data);
          const transformedData = Object.entries(data).map(([id, name]) => ({
            id_kabupaten: id,
            nama_kabupaten: name,
          }));
          data = transformedData;
        }
        break;

      case "districts":
        endpoint = "list_kec";
        const regencyProvinceCode = searchParams.get("provinceCode");
        const regencyCode = searchParams.get("regencyCode");
        if (!regencyProvinceCode || !regencyCode) {
          return NextResponse.json(
            { error: "Province code and regency code are required" },
            { status: 400 }
          );
        }
        data = await fetchFromSipedas(endpoint, {
          thn: year,
          lvl: "12", // Regency level
          pro: regencyProvinceCode,
          kab: regencyCode,
        });

        // Transform object response to array format for districts
        if (!Array.isArray(data)) {
          console.log("Converting districts object to array:", data);
          const transformedData = Object.entries(data).map(([id, name]) => ({
            id_kecamatan: id,
            nama_kecamatan: name,
          }));
          data = transformedData;
        }
        break;

      case "villages":
        endpoint = "list_des";
        const districtProvinceCode = searchParams.get("provinceCode");
        const districtRegencyCode = searchParams.get("regencyCode");
        const districtCode = searchParams.get("districtCode");
        if (!districtProvinceCode || !districtRegencyCode || !districtCode) {
          return NextResponse.json(
            { error: "Province, regency and district codes are required" },
            { status: 400 }
          );
        }
        data = await fetchFromSipedas(endpoint, {
          thn: year,
          lvl: "13", // District level
          pro: districtProvinceCode,
          kab: districtRegencyCode,
          kec: districtCode,
        });

        // Transform object response to array format for villages
        if (!Array.isArray(data)) {
          console.log("Converting villages object to array:", data);
          const transformedData = Object.entries(data).map(([id, name]) => ({
            id_kelurahan: id,
            nama_kelurahan: name,
          }));
          data = transformedData;
        }
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid type. Use 'provinces', 'regencies', 'districts', or 'villages'",
          },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API error details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
