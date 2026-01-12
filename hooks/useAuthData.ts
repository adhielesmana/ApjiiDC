import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { RootState } from "@/lib/store/store";
import { User } from "@/types/auth";
import { setCredentials, setLoading as setAuthLoading } from "@/lib/store/auth/authSlice";
import axios from "axios";

export const useAuthData = () => {
  const dispatch = useDispatch();
  const { user, token, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const hasAttemptedRestore = useRef(false);

  useEffect(() => {
    const restoreAndCheckAuth = async () => {
      if (hasAttemptedRestore.current) {
        setLoading(authLoading);
        return;
      }

      hasAttemptedRestore.current = true;

      if (user && token) {
        setLoading(false);
        dispatch(setAuthLoading(false));
        return;
      }

      try {
        const response = await axios.get("/api/auth/status");
        
        if (response.data.authenticated && response.data.user && response.data.token) {
          dispatch(setCredentials({
            user: response.data.user,
            token: response.data.token,
          }));
        } else {
          dispatch(setAuthLoading(false));
        }
      } catch (error) {
        console.error("Auth restore/check error:", error);
        dispatch(setAuthLoading(false));
      } finally {
        setLoading(false);
      }
    };

    restoreAndCheckAuth();
  }, [dispatch, user, token, authLoading]);

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
