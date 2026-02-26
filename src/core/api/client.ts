/**
 * Core API client: HTTP primitives shared by all features.
 * Handles base URL, auth headers, 401 session-expired event, logging.
 */

import { TOKEN_KEY, EMAIL_KEY, ROLE_KEY } from "@/core/constants/storage";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const SESSION_EXPIRED_EVENT = "session-expired";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const url = `${getBaseUrl()}${path}`;
  const method = (init.method || "GET").toUpperCase();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log("[API] Request:", method, path);
  const res = await fetch(url, { ...init, headers });
  const raw = await res.text();
  let body: unknown;
  const ct = res.headers.get("content-type");
  if (ct?.includes("application/json") && raw.length > 0) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }
  } else {
    body = raw || undefined;
  }

  console.log("[API] Response:", res.status, path, body);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(ROLE_KEY);
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    const msg =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : res.statusText;
    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}
