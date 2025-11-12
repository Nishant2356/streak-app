"use client";

import { useState } from "react";

type Toast = {
  id: number;
  title?: string;
  description?: string;
  className?: string;
};

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, className }: Omit<Toast, "id">) => {
    const id = ++toastId;
    const newToast = { id, title, description, className };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { toast, toasts };
}
