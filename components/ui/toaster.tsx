"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Toast context for imperative use ── */

type ToastData = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
};

type ToastCtx = {
  toast: (data: Omit<ToastData, "id">) => void;
};

const ToastContext = React.createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <Toaster />");
  return ctx;
}

/* ── Variant styles ── */

const variantStyles: Record<string, string> = {
  default: "border-border bg-card text-card-foreground",
  success: "border-accent/30 bg-accent/10 text-accent",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
};

/* ── Single Toast ── */

function ToastItem({ data, onClose }: { data: ToastData; onClose: () => void }) {
  return (
    <ToastPrimitive.Root
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg transition-all",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
        "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full",
        variantStyles[data.variant ?? "default"]
      )}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <div className="flex-1">
        {data.title && (
          <ToastPrimitive.Title className="text-sm font-semibold">
            {data.title}
          </ToastPrimitive.Title>
        )}
        {data.description && (
          <ToastPrimitive.Description className="mt-0.5 text-sm opacity-80">
            {data.description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-50 transition-opacity hover:opacity-100"
        aria-label="Close"
      >
        <X className="h-3.5 w-3.5" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

/* ── Provider + Viewport ── */

let toastId = 0;

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((data: Omit<ToastData, "id">) => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { ...data, id }]);
    // Auto-remove after 5s as fallback
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}

        {toasts.map((t) => (
          <ToastItem key={t.id} data={t} onClose={() => removeToast(t.id)} />
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
