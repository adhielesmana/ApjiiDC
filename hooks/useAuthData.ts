import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "@/lib/store/store";
import { User } from "@/types/auth";

export const useAuthData = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        if (!user || !token) {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Auth data check error:", error);
      }
      setLoading(false);
    };

    checkAuth();
  }, [user, token]);

  const isAdmin = user?.roleType === "admin";
  const isAdminStaff = user?.roleType === "admin" && user?.role === "staff";
  const isSuperadmin = user?.roleType === "admin" && user?.role === "admin";
  const isProvider = user?.roleType === "provider";
  const isUser = user?.roleType === "user";

  return {
    user,
    loading,
    isAdmin,
    isProvider,
    isUser,
    isAdminStaff,
    isSuperadmin,
    isAuthenticated: !!user,
  };
};
