"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/store/auth/authSlice";

export default function Template({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      dispatch(
        setCredentials({
          token,
          user: JSON.parse(user),
        })
      );
    }
  }, [dispatch]);

  return <>{children}</>;
}
