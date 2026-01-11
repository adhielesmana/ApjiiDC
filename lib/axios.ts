import axios from "axios";
import { store } from "@/lib/store/store";
import { logout } from "@/lib/store/auth/authSlice";

// Create axios instance with configuration optimized for file uploads
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds timeout
  maxBodyLength: 5 * 1024 * 1024, // 5MB max request size
  maxContentLength: 5 * 1024 * 1024, // 5MB max response size
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Dispatch logout to clean Redux state and localStorage
      store.dispatch(logout());
      
      // Force redirect to login page if needed
      if (typeof window !== 'undefined') {
        const requiresAuth = 
          window.location.pathname.startsWith('/admin') || 
          window.location.pathname.startsWith('/provider') ||
          window.location.pathname.startsWith('/customer/orders') ||
          window.location.pathname === '/customer/become-provider';
          
        if (requiresAuth) {
          window.location.href = '/login';
        }
      }
    }

    // Provide clearer error messages for common HTTP errors
    if (error.response?.status === 413) {
      error.message =
        "File terlalu besar. Gunakan file dengan ukuran yang lebih kecil.";
    } else if (error.code === "ECONNABORTED") {
      error.message =
        "Koneksi timeout. Periksa koneksi internet Anda dan coba lagi.";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
