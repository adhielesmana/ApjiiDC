// app/providers.tsx
"use client";

import { ReactNode } from "react";
import { RootProvider } from "@/components/providers/root-provider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <RootProvider>{children}</RootProvider>;
}
