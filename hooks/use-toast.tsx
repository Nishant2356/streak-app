"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
	id: number;
	title?: string;
	description?: string;
	className?: string;
};

type ToastContextValue = {
	toasts: Toast[];
	toast: (input: Omit<Toast, "id">) => void;
	remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const remove = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback(({ title, description, className }: Omit<Toast, "id">) => {
		const id = ++toastId;
		const newToast = { id, title, description, className };
		setToasts((prev) => [...prev, newToast]);

		// Auto-remove after 3 seconds
		window.setTimeout(() => {
			remove(id);
		}, 3000);
	}, [remove]);

	const value = useMemo(
		() => ({
			toasts,
			toast,
			remove,
		}),
		[toasts, toast, remove]
	);

	return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast must be used within <ToastProvider>");
	}
	return ctx;
}

