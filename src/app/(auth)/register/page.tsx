"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthForm } from "@/features/auth";

export default function RegisterPage() {
  const router = useRouter();
  const form = useAuthForm("register");

  if (form.isAuthenticated) {
    router.replace("/chat");
    return null;
  }

  return (
    <div className="gh-card p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-semibold text-gh-fg">Create account</h1>
      <form onSubmit={form.handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gh-fg"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => form.setEmail(e.target.value)}
            className="gh-input"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gh-fg"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => form.setPassword(e.target.value)}
            className="gh-input"
            required
            minLength={6}
          />
        </div>
        {form.error && (
          <p className="text-sm text-gh-danger" role="alert">
            {form.error}
          </p>
        )}
        <button
          type="submit"
          className="gh-btn gh-btn-primary w-full"
          disabled={form.loading}
        >
          {form.loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gh-fg-muted">
        Already have an account?{" "}
        <Link href="/login" className="gh-link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
