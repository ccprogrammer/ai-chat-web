"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useAdminUsers } from "../hooks/use-admin-users";

export function SidebarUsers() {
  const pathname = usePathname();
  const { refetchMe, email: currentEmail } = useAuth();
  const { users, loading, updateRole } = useAdminUsers();

  const handleMakeAdmin = async (
    e: React.MouseEvent,
    userId: string,
    currentRole: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      typeof window === "undefined" ||
      window.confirm(
        `Set role to "${newRole}"?`
      )
    ) {
      await updateRole(userId, newRole);
      await refetchMe();
    }
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
                    onClick={(e) => handleMakeAdmin(e, user.id, user.role)}
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
    </div>
  );
}
