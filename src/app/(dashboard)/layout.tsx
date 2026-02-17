"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth";
import { SidebarProvider } from "@/core/context/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gh-fg-muted">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gh-fg-muted">
          Session invalid.{" "}
          <Link href="/login" className="gh-link">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return <SidebarProvider>{children}</SidebarProvider>;
}
