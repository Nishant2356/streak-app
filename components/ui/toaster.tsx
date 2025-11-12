"use client";

import { ToastProvider, ToastViewport } from "./toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(({ id, title, description, className }) => (
          <div
            key={id}
            className={`pointer-events-auto p-4 rounded-xl shadow-md border ${className || "bg-zinc-800 border-zinc-700 text-white"}`}
          >
            {title && <div className="font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-80 mt-1">{description}</div>}
          </div>
        ))}
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
