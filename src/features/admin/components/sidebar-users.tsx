"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { useAdminUsers } from "../hooks/use-admin-users";

export function SidebarUsers() {
  const pathname = usePathname();
  const { refetchMe, email: currentEmail } = useAuth();
  const { users, loading, updateRole } = useAdminUsers();
  const [confirming, setConfirming] = useState<{
    userId: string;
    currentRole: string;
    userEmail: string;
  } | null>(null);

  const handleMakeAdminClick = (
    e: React.MouseEvent,
    userId: string,
    currentRole: string,
    userEmail: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming({ userId, currentRole, userEmail });
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    const newRole = confirming.currentRole === "admin" ? "user" : "admin";
    await updateRole(confirming.userId, newRole);
    await refetchMe();
    setConfirming(null);
  };

  const handleCancel = () => {
    setConfirming(null);
  };

  return (
    <div className="mt-4 pt-4">
      <div className="mb-2 px-2 text-xs font-medium text-gh-fg-muted">
        Users
      </div>
      {loading ? (
        <p className="px-2 py-2 text-sm text-gh-fg-muted">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="px-2 py-2 text-sm text-gh-fg-muted">No users yet.</p>
      ) : (
        <ul className="space-y-0.5">
          {users
            .filter((user) => user.email !== currentEmail)
            .map((user) => {
            const href = `/admin/users/${user.id}`;
            const isActive = pathname === href;
            const role = user.role === "admin" ? "admin" : "user";

            return (
              <li key={user.id}>
                <Link
                  href={href}
                  className={`group flex items-center justify-between gap-1 rounded-lg px-3 py-2 text-sm text-gh-fg hover:bg-gh-border-muted ${
                    isActive ? "bg-gh-border-muted font-medium" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate" title={user.email}>
                    {user.email}
                  </span>
                  <span className="shrink-0 text-xs text-gh-fg-muted">
                    {role}
                  </span>
                  <button
                    type="button"
                    onClick={(e) =>
                      handleMakeAdminClick(e, user.id, user.role, user.email)
                    }
                    className="shrink-0 rounded px-1.5 py-0.5 text-xs text-gh-accent hover:bg-gh-border-muted"
                    title={role === "admin" ? "Demote to user" : "Make admin"}
                  >
                    {role === "admin" ? "Demote" : "Make admin"}
                  </button>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {confirming &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-confirm-title"
            onClick={handleCancel}
          >
            <div
              className="w-full max-w-sm rounded-lg border border-gh-border bg-gh-bg p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="role-confirm-title"
                className="text-sm font-medium text-gh-fg"
              >
                {confirming.currentRole === "admin"
                  ? "Demote to user"
                  : "Make admin"}
              </h2>
              <p className="mt-2 text-sm text-gh-fg-muted">
                Set{" "}
                <strong className="text-gh-fg">{confirming.userEmail}</strong> to{" "}
                {confirming.currentRole === "admin" ? "user" : "admin"}?
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="gh-btn px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="gh-btn gh-btn-primary px-3 py-1.5 text-sm"
                >
                  {confirming.currentRole === "admin"
                    ? "Demote"
                    : "Make admin"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
