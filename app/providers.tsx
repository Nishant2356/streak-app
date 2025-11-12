"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider as AppToastProvider } from "@/hooks/use-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppToastProvider>{children}</AppToastProvider>
    </SessionProvider>
  );
}
