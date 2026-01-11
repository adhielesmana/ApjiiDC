import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, logout } from "@/lib/store/auth/authSlice";
import type { RootState } from "@/lib/store/store";
import { User } from "@/types/auth";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        // Verify if token is valid and not expired
        try {
          const decoded: any = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            // Token is expired, clear everything
            dispatch(logout());
            return;
          }

          // Token is valid, restore credentials
          dispatch(
            setCredentials({
              token: storedToken,
              user: JSON.parse(storedUser) as User,
            })
          );
        } catch (error) {
          // If token is invalid (cannot be decoded), clear everything
          console.error("Invalid token:", error);
          dispatch(logout());
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return { user, token };
}
