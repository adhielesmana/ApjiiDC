"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (code) {
      // Kirim code ke API Next.js
      axios
        .post("/api/auth/oauth", { code, state })
        .then((res) => {
          if (res.data.success) {
            // Redirect ke halaman customer/dashboard atau sesuai kebutuhan
            router.replace("/customer");
          } else {
            alert(res.data.message || "Gagal login MyAPJII");
            router.replace("/login");
          }
        })
        .catch(() => {
          alert("Gagal login  MyAPJII");
          router.replace("/login");
        });
    } else {
      router.replace("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-950 dark:from-gray-950 dark:to-black text-white">
      {/* Simplified Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Colored Background Elements - Simplified */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-cyan-500/5 dark:from-blue-800/20 dark:to-cyan-800/5 rounded-full blur-3xl opacity-70 animate-fade-in"></div>
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-sky-500/5 dark:from-indigo-900/20 dark:to-sky-900/5 rounded-full blur-3xl opacity-70 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="flex flex-col items-center justify-center z-10 text-white">
        <div className="spinner mb-4"></div>
        <div className="text-lg font-semibold text-center">
          Menyelesaikan login MyAPJII...
        </div>
      </div>

      {/* Add style for spin and fade-in animations */}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #3498db; /* Blue spinner */
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.7;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
