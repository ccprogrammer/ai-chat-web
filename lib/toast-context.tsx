"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type Toast = { id: number; message: string };

type ToastContextValue = {
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_MS = 6000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    const t = timeoutRef.current[id];
    if (t) clearTimeout(t);
    delete timeoutRef.current[id];
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback(
    (message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, message }]);
      timeoutRef.current[id] = setTimeout(() => dismiss(id), DISMISS_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showError }}>
      {children}
      <div
        className="pointer-events-none fixed right-0 top-0 z-50 flex max-w-full flex-col gap-2 p-3 sm:right-4 sm:top-4 sm:p-4"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto min-w-0 max-w-sm rounded-lg border border-gh-border bg-gh-bg px-4 py-3 text-sm text-gh-fg shadow-lg ring-1 ring-gh-shadow"
            role="alert"
          >
            <p className="font-medium text-gh-danger">Error</p>
            <p className="mt-1 text-gh-fg-muted">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showError: (_message: string) => {} };
  return ctx;
}
