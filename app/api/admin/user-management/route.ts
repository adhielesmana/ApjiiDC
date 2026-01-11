import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const roleType = searchParams.get("roleType");
    const role = searchParams.get("role");
    // Add includeProviderStatus parameter to get provider status with user data
    const includeProviderStatus = true;
      
    // Construct query parameters if they exist
    const queryParams = new URLSearchParams();
    if (roleType) queryParams.append("roleType", roleType);
    if (role) queryParams.append("role", role);
    queryParams.append("includeProviderStatus", includeProviderStatus.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `${BACKEND_URL}/admin/user${queryString ? `?${queryString}` : ""}`;const response = await axios.get(endpoint, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });    // Check if we have users with provider roles that need status information
    if (response.data.status === "ok" && response.data.data) {
      // Get all provider admin users with provider IDs
      const providerAdminUsers = response.data.data.filter(
        (user: any) => user.roleType === "provider" && user.role === "admin" && user.provider
      );
      
      // If we have provider admin users, fetch all provider statuses in one request
      if (providerAdminUsers.length > 0) {
        try {
          // Get all provider IDs
          const providerIds = providerAdminUsers.map((user: any) => user.provider);
          
          // Fetch all providers in a single request (if API supports this)
          const providersResponse = await axios.get(`${BACKEND_URL}/catalogue/provider`, {
            params: {
              ids: providerIds.join(','), // Many APIs support comma-separated IDs
              // If your API doesn't support this, you might need to use another approach
              limit: providerIds.length, // Get enough results to include all providers
            },
            headers: {
              Authorization: token.value.startsWith("Bearer ")
                ? token.value
                : `Bearer ${token.value}`,
            },
          });
          
          if (providersResponse.data.status === "ok" && providersResponse.data.data) {
            // Create a map of provider IDs to their status
            const providerStatusMap = new Map();
            providersResponse.data.data.forEach((provider: any) => {
              providerStatusMap.set(provider._id, provider._isActive ? "active" : "inactive");
            });
            
            // Update each user with their provider's status
            response.data.data = response.data.data.map((user: any) => {
              if (user.provider && providerStatusMap.has(user.provider)) {
                return {
                  ...user,
                  providerStatus: providerStatusMap.get(user.provider)
                };
              }
              return user;
            });
          }
        } catch (error) {
          console.error("Error fetching provider statuses:", error);
        }
      }
    }

    return NextResponse.json(response.data);} catch (error: any) {
    return NextResponse.json(
      { 
        status: "error", 
        message: error.response?.data?.message || "Failed to fetch users" 
      },
      { status: error.response?.status || 500 }
    );
  }
}