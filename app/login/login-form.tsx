"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { AuthService } from "@/services/auth.service";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/store/auth/authSlice";
import { Checkbox } from "@heroui/checkbox";

import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Alert } from "@heroui/alert";
import { ThemeSwitch } from "@/components/theme-switch";

export default function LoginForm() {
  const [usernameOrEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Construct the OAUTH_URL inside the component
  const OAUTH_CLIENT_ID =
    process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ||
    "7f5b1a35-db96-41d4-a70b-97ecd8d319b0";
  const OAUTH_REDIRECT_URL =
    process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL ||
    "https://mitradc.apjii.or.id/oauth-redirect";
  const OAUTH_STATE = "23123123123";
  const OAUTH_SCOPE = "read_profile";
  const OAUTH_URL = `https://oauth.apjii.or.id/oauth?client_id=${OAUTH_CLIENT_ID}&redirect_url=${encodeURIComponent(
    OAUTH_REDIRECT_URL || ""
  )}&scope=${OAUTH_SCOPE}&state=${OAUTH_STATE}`;

  // Get the redirect path from the URL
  const redirectPath = searchParams.get("from") || "/customer";

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError("Email/username dan password harus diisi");
      return;
    }

    try {
      setLoading(true);
      const res = await AuthService.login(usernameOrEmail, password, remember);

      if (res.data.success) {
        dispatch(
          setCredentials({
            token: res.data.token,
            user: res.data.user,
          })
        );
        // Redirect to the original URL the user was trying to access
        router.push(redirectPath);
      }
    } catch (err: any) {
      console.error("Login form error:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal melakukan login";
      setError(errorMessage);

      // Clear password field on error
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 relative overflow-hidden">
      {/* Enhanced Tech-themed Geometric Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Circuit Board Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTI1IDAgTDI1IDEwMCBNNTAgMCBMNTAgMTAwIE03NSAwIEw3NSAxMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4wNCIvPjxwYXRoIGQ9Ik0wIDI1IEwxMDAgMjUgTTAgNTAgTDEwMCA1MCBNMCA3NSBMMTA3NSA3NSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA0Ii8+PC9zdmc+')] opacity-70 dark:opacity-40"></div>

        {/* Tech Hexagon Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTMwLDUyLjVMNTIuNSw2MEw3NSw1Mi41TDc1LDM3LjVMNTIuNSwzMEwzMCwzNy41WiIgc3Ryb2tlPSIjMDAwMGZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEwNSw5MEwxMjcuNSw5Ny41TDE1MCw5MEwxNTAsNzVMMTI3LjUsNjcuNUwxMDUsNzVaIiBzdHJva2U9IiMwMDAwZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTgwLDUyLjVMMjAyLjUsNjBMMjI1LDUyLjVMMjI1LDM3LjVMMjAyLjUsMzBMMTgwLDM3LjVaIiBzdHJva2U9IiMwMDAwZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMzAsNjdMMTIwLDMyIiBzdHJva2U9IiMwMDg4ZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiLz48L3N2Zz4=')] opacity-80 dark:opacity-50"></div>

        {/* Colored Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 to-cyan-500/5 dark:from-blue-800/20 dark:to-cyan-800/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-500/10 to-sky-500/5 dark:from-indigo-900/20 dark:to-sky-900/5 rounded-full blur-3xl"></div>

        {/* Circuit Board Nodes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Digital Processing Centers */}
          <div className="absolute top-[15%] left-[20%]">
            <div className="w-16 h-16 rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-100/30 to-cyan-100/20 dark:from-blue-900/30 dark:to-cyan-900/20 backdrop-blur-sm"></div>
            <div className="absolute top-4 left-4 w-8 h-8 rounded-md border border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-200/40 to-cyan-200/30 dark:from-blue-800/40 dark:to-cyan-800/30"></div>
            <div className="absolute top-2 left-2 w-4 h-4 rounded-sm border border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-300/50 to-cyan-300/40 dark:from-blue-700/50 dark:to-cyan-700/40"></div>
          </div>

          <div className="absolute top-[65%] right-[25%]">
            <div className="w-12 h-12 rounded-full border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-100/30 to-sky-100/20 dark:from-indigo-900/30 dark:to-sky-900/20 backdrop-blur-sm"></div>
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full border border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-200/40 to-sky-200/30 dark:from-indigo-800/40 dark:to-sky-800/30"></div>
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full border border-indigo-400 dark:border-indigo-600 bg-gradient-to-br from-indigo-300/50 to-sky-300/40 dark:from-indigo-700/50 dark:to-sky-700/40"></div>
          </div>
        </div>

        {/* Technology Flow Lines */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Horizontal Data Streams */}
          <div className="absolute h-[1px] w-full top-[15%] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          <div className="absolute h-[1px] w-full top-[35%] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
          <div className="absolute h-[1px] w-full top-[65%] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          <div className="absolute h-[1px] w-full top-[85%] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"></div>

          {/* Vertical Data Streams */}
          <div className="absolute w-[1px] h-full left-[20%] bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"></div>
          <div className="absolute w-[1px] h-full left-[40%] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent"></div>
          <div className="absolute w-[1px] h-full left-[60%] bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
          <div className="absolute w-[1px] h-full left-[80%] bg-gradient-to-b from-transparent via-sky-500/40 to-transparent"></div>
        </div>

        {/* Tech Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-500 dark:to-cyan-500"
                style={{
                  top: `${15 + (i % 4) * 20}%`,
                  left: `${20 + Math.floor(i / 4) * 20}%`,
                  opacity: 0.4 + (i % 3) * 0.2,
                  boxShadow: "0 0 8px rgba(56, 189, 248, 0.5)",
                  animation: `pulse ${2 + (i % 3)}s infinite alternate ease-in-out`,
                }}
              ></div>
            ))}
        </div>

        {/* Dynamic Data Flow Lines with Animations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-[2px] w-full top-[10%] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse"></div>
          <div
            className="absolute h-[1px] w-full top-[30%] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute h-[2px] w-full top-[50%] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute h-[1px] w-full top-[70%] bg-gradient-to-r from-transparent via-sky-500/20 to-transparent animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      </div>

      <Card className="max-w-md w-full shadow-xl border-divider bg-background/70 dark:bg-background/50 backdrop-blur-md z-10">
        <CardHeader className="flex flex-col gap-1 items-center pb-0 relative">
          <div className="absolute right-2 top-2 p-2 rounded-full hover:bg-default-100">
            {/* <ThemeSwitch /> */}
          </div>
          <div className="mb-6 mt-3">
            <Image
              src="/images/logo.png"
              alt="Company Logo"
              width={300}
              height={300}
              priority
              className="object-contain"
            />
          </div>
          <p className="text-sm text-default-500">Sign in to continue</p>
        </CardHeader>

        <CardBody>
          {error && (
            <div className="mb-4">
              <Alert title={error} color="danger" />
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Email or Username"
              value={usernameOrEmail}
              onChange={(e) => setEmail(e.target.value)}
              startContent={
                <EnvelopeIcon className="w-5 h-5 text-default-400" />
              }
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-default-100/50 backdrop-blur-md hover:bg-default-200/50",
              }}
            />
            <Input
              type={isVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={
                <LockClosedIcon className="w-5 h-5 text-default-400" />
              }
              endContent={
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="focus:outline-none"
                >
                  {isVisible ? (
                    <EyeSlashIcon className="w-5 h-5 text-default-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-default-400" />
                  )}
                </button>
              }
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-default-100/50 backdrop-blur-md hover:bg-default-200/50",
              }}
            />
            <div className="flex justify-between">
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              >
                <span className="text-sm text-default-600">Remember me</span>
              </Checkbox>
              <Link className="text-sm text-primary">Forgot password?</Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r to-blue-600 from-cyan-500 text-white font-medium"
              radius="sm"
              isLoading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
            <Divider className="my-4" />
            <Button
              as="a"
              href={OAUTH_URL}
              className="w-full bg-black text-white font-medium flex items-center justify-center gap-2"
            >
              <Image
                src="/images/logo-apjii.png"
                alt="MyAPJII Logo"
                width={24}
                height={24}
                className="object-contain"
              />
              Login dengan MyAPJII
            </Button>
            <p className="text-center text-sm text-default-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium">
                Register
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>

      {/* Add style for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          100% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
