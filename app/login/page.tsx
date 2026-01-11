"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import LoginForm from "./login-form";
import type { RootState } from "@/lib/store/store";

export default function LoginPage() {
  return <LoginForm />;
}
