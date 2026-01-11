// app/layout.tsx
import { ReactNode } from "react";
import "@/styles/globals.css";
import { fontSans } from "@/config/fonts";
import clsx from "clsx";
import Providers from "./providers";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "APJII DC",
  description: "APJII Data Center Management System",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
