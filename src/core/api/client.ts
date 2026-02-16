/**
 * Core API client: HTTP primitives shared by all features.
 * Handles base URL, auth headers, 401 redirect, logging.
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  let body: unknown;
  const ct = res.headers.get("content-type");
  if (ct?.includes("application/json")) {
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
  } else {
    body = await res.text();
  }

  console.log("[API] Response:", res.status, path, body);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("ai_chat_token");
      localStorage.removeItem("ai_chat_email");
      localStorage.removeItem("ai_chat_role");
      window.location.href = "/login";
    }
    const msg =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : res.statusText;
    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}
