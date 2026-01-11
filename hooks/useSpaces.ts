import { useState, useCallback } from 'react';
import axios from 'axios';

interface Space {
  _id: string;
  name: string;
  description: string;
  size: string;
  price: number;
  images: string[];
  provider: {
    _id: string;
    name: string;
    contact?: {
      email: string;
      phone: string;
    };
    description?: string;
    province?: string;
    city?: string;
    address?: string;
    logo?: string;
  };
  datacenter: {
    _id: string;
    name: string;
    address: string;
    coordinate?: string;
    description?: string;
  };
  _addedBy: {
    _id: string;
    username: string;
    fullName: string;
    email: string;
  };
  publish: boolean;
  createdAt: string;
  updatedAt: string;
  paymentPlan?: {
    monthly?: number;
    quarterly?: number;
    annually?: number;
  };
}

interface SpaceFilters {
  page?: number;
  limit?: number;
  provider?: string;
  datacenter?: string;
  search?: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsCount: number;
}

export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildApiUrl = useCallback((filters: SpaceFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.provider) params.append("provider", filters.provider);
    if (filters.datacenter) params.append("datacenter", filters.datacenter);
    if (filters.search) params.append("search", filters.search);

    return `/api/admin/space/list?${params.toString()}`;
  }, []);

  const fetchSpaces = useCallback(async (filters: SpaceFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const url = buildApiUrl(filters);
      const response = await axios.get(url);

      if (response.data.status === "ok") {
        const { data, total, pages, page: currentPage, count } = response.data;
        
        setSpaces(Array.isArray(data) ? data : []);
        setPagination({
          currentPage,
          totalPages: pages,
          totalItems: total,
          itemsCount: count,
        });
      } else {
        setError(response.data.message || "Failed to fetch spaces");
        setSpaces([]);
      }
    } catch (err: any) {
      console.error("Error fetching spaces:", err);
      setError(err.response?.data?.message || "Failed to load spaces");
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  }, [buildApiUrl]);

  const togglePublish = useCallback(async (spaceId: string, currentStatus: boolean) => {
    try {
      const response = await axios.post(`/api/admin/space/${spaceId}/toggle-publish`);
      
      if (response.data?.status === "ok") {
        // Update the space in the current list
        setSpaces(prev => 
          prev.map(space => 
            space._id === spaceId 
              ? { ...space, publish: !currentStatus }
              : space
          )
        );
        return { success: true, message: `Space successfully ${currentStatus ? "unpublished" : "published"}` };
      } else {
        return { success: false, message: response.data?.message || "Status could not be changed" };
      }
    } catch (err: any) {
      console.error("Toggle error:", err);
      return { success: false, message: err.response?.data?.message || "Failed to change status" };
    }
  }, []);

  const refreshSpaces = useCallback((filters: SpaceFilters = {}) => {
    return fetchSpaces(filters);
  }, [fetchSpaces]);

  return {
    spaces,
    pagination,
    loading,
    error,
    fetchSpaces,
    togglePublish,
    refreshSpaces,
    buildApiUrl,
  };
};