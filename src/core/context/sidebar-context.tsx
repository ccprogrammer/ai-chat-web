"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);
  const close = useCallback(() => setCollapsed(true), []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setCollapsed(true);
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
