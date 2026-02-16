"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth";
import { SidebarProvider } from "@/core/context/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gh-fg-muted">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <SidebarProvider>{children}</SidebarProvider>;
}
