"use client";

import { ToastProvider, ToastViewport } from "./toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, className }) => (
        <div
          key={id}
          className={`p-4 rounded-xl shadow-md border ${className || "bg-zinc-800 border-zinc-700 text-white"} my-2`}
        >
          {title && <div className="font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-80 mt-1">{description}</div>}
        </div>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
