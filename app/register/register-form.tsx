"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { Checkbox } from "@heroui/checkbox";
import { Alert } from "@heroui/alert";

import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { ThemeSwitch } from "@/components/theme-switch";
import { Building } from "lucide-react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/auth/register", {
        username,
        email,
        company,
        password,
        fullName,
        phone,
      });
      if (res.status === 200) {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
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

        {/* Colored Background Elements - Using purple hues to match register form theme */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/20 to-blue-500/5 dark:from-purple-800/20 dark:to-blue-800/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-500/10 to-sky-500/5 dark:from-indigo-900/20 dark:to-sky-900/5 rounded-full blur-3xl"></div>

        {/* Circuit Board Nodes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Digital Processing Centers */}
          <div className="absolute top-[15%] left-[20%]">
            <div className="w-16 h-16 rounded-lg border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-100/30 to-blue-100/20 dark:from-purple-900/30 dark:to-blue-900/20 backdrop-blur-sm"></div>
            <div className="absolute top-4 left-4 w-8 h-8 rounded-md border border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-200/40 to-blue-200/30 dark:from-purple-800/40 dark:to-blue-800/30"></div>
            <div className="absolute top-2 left-2 w-4 h-4 rounded-sm border border-purple-400 dark:border-purple-600 bg-gradient-to-br from-purple-300/50 to-blue-300/40 dark:from-purple-700/50 dark:to-blue-700/40"></div>
          </div>

          <div className="absolute top-[65%] right-[25%]">
            <div className="w-12 h-12 rounded-full border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-100/30 to-blue-100/20 dark:from-indigo-900/30 dark:to-blue-900/20 backdrop-blur-sm"></div>
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full border border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-200/40 to-blue-200/30 dark:from-indigo-800/40 dark:to-blue-800/30"></div>
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full border border-indigo-400 dark:border-indigo-600 bg-gradient-to-br from-indigo-300/50 to-blue-300/40 dark:from-indigo-700/50 dark:to-blue-700/40"></div>
          </div>
        </div>

        {/* Technology Flow Lines */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Horizontal Data Streams */}
          <div className="absolute h-[1px] w-full top-[15%] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="absolute h-[1px] w-full top-[35%] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
          <div className="absolute h-[1px] w-full top-[65%] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          <div className="absolute h-[1px] w-full top-[85%] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>

          {/* Vertical Data Streams */}
          <div className="absolute w-[1px] h-full left-[20%] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>
          <div className="absolute w-[1px] h-full left-[40%] bg-gradient-to-b from-transparent via-blue-500/40 to-transparent"></div>
          <div className="absolute w-[1px] h-full left-[60%] bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
          <div className="absolute w-[1px] h-full left-[80%] bg-gradient-to-b from-transparent via-violet-500/40 to-transparent"></div>
        </div>

        {/* Tech Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-500 dark:to-blue-500"
                style={{
                  top: `${15 + (i % 4) * 20}%`,
                  left: `${20 + Math.floor(i / 4) * 20}%`,
                  opacity: 0.4 + (i % 3) * 0.2,
                  boxShadow: "0 0 8px rgba(124, 58, 237, 0.5)",
                  animation: `pulse ${2 + (i % 3)}s infinite alternate ease-in-out`,
                }}
              ></div>
            ))}
        </div>

        {/* Dynamic Data Flow Lines with Animations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-[2px] w-full top-[10%] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-pulse"></div>
          <div
            className="absolute h-[1px] w-full top-[30%] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute h-[2px] w-full top-[50%] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute h-[1px] w-full top-[70%] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      </div>

      <Card className="max-w-md w-full shadow-xl border-divider bg-background/70 dark:bg-background/50 backdrop-blur-md z-10">
        <CardHeader className="flex flex-col gap-1 items-center pb-0 relative">
          <div className="absolute right-2 top-2 p-2 rounded-full hover:bg-default-100">
            {/* <ThemeSwitch /> */}
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-sm text-default-500">Sign up to get started</p>
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
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              startContent={<UserIcon className="w-5 h-5 text-default-400" />}
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-default-100/50 backdrop-blur-md hover:bg-default-200/50",
              }}
            />
            <Input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              startContent={<Building className="w-5 h-5 text-default-400" />}
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-default-100/50 backdrop-blur-md hover:bg-default-200/50",
              }}
            />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              startContent={<UserIcon className="w-5 h-5 text-default-400" />}
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-default-100/50 backdrop-blur-md hover:bg-default-200/50",
              }}
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
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
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              startContent={<PhoneIcon className="w-5 h-5 text-default-400" />}
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-default-100/50 backdrop-blur-md hover:bg-default-200/50",
              }}
            />
            <Input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={
                <LockClosedIcon className="w-5 h-5 text-default-400" />
              }
              endContent={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none"
                >
                  {isPasswordVisible ? (
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
            <Input
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              startContent={
                <LockClosedIcon className="w-5 h-5 text-default-400" />
              }
              endContent={
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="focus:outline-none"
                >
                  {isConfirmPasswordVisible ? (
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
            <Checkbox
              classNames={{
                label: "text-default-600",
                wrapper: "text-sm",
              }}
            >
              I agree to the{" "}
              <Link
                href="#"
                size="sm"
                className="text-primary hover:opacity-80"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                size="sm"
                className="text-primary hover:opacity-80"
              >
                Privacy Policy
              </Link>
            </Checkbox>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
              radius="sm"
              isLoading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
            <Divider className="my-4" />
            <p className="text-center text-sm text-default-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium">
                Sign In
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
