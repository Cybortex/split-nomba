"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

// ─── Types ───

type ToastVariant = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  removing: boolean;
};

type ToastContextValue = {
  toast: (opts: Omit<ToastOptions, "id">) => string;
  dismiss: (id: string) => void;
};

type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

// ─── Icons ───

const variantIcons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantStyles: Record<ToastVariant, string> = {
  success:
    "border-success/30",
  error:
    "border-error/30",
  warning:
    "border-pending/30",
  info:
    "border-info/30",
};

const variantIconColors: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-error",
  warning: "text-pending",
  info: "text-info",
};

// ─── Context ───

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ───

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const toast = useCallback(
    (opts: ToastOptions): string => {
      const id = `toast-${++counterRef.current}`;
      const toastData: Toast = {
        id,
        message: opts.message,
        variant: opts.variant ?? "info",
        duration: opts.duration ?? 4000,
        removing: false,
      };

      setToasts((prev) => [...prev, toastData]);

      if (toastData.duration > 0) {
        setTimeout(() => removeToast(id), toastData.duration);
      }

      return id;
    },
    [removeToast],
  );

  const contextValue: ToastContextValue = { toast, dismiss: removeToast };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* ── Toast Container ── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((t) => {
          const Icon = variantIcons[t.variant];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-dropdown backdrop-blur-xl bg-surface ${
                variantStyles[t.variant]
              } ${
                t.removing
                  ? "animate-fade-out opacity-0"
                  : "animate-slide-in-right"
              }`}
            >
              <Icon
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${variantIconColors[t.variant]}`}
              />
              <p className="flex-1 text-sm text-secondary leading-relaxed min-w-0">
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 p-0.5 rounded-md text-muted-dark hover:text-primary hover:bg-hover transition-colors duration-200"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ───

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}
