/**
 * API client for AI Chat backend (FastAPI).
 * Base URL is read from NEXT_PUBLIC_API_URL (default http://localhost:8000).
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

async function request<T>(
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

/** Auth */
export const authApi = {
  register: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/** Chats */
export const chatsApi = {
  list: (token: string) =>
    request<{ chats: import("@/types").Chat[]; total: number }>("/chats", {
      token,
      cache: "no-store",
    }),

  create: (token: string, title?: string) =>
    request<import("@/types").Chat>("/chats", {
      method: "POST",
      token,
      body: JSON.stringify({ title: title ?? null }),
    }),

  get: (token: string, chatId: string) =>
    request<import("@/types").Chat>(`/chats/${chatId}`, { token }),

  getMessages: (token: string, chatId: string) =>
    request<import("@/types").Message[]>(`/chats/${chatId}/messages`, {
      token,
    }),

  update: (token: string, chatId: string, title: string) =>
    request<import("@/types").Chat>(`/chats/${chatId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ title }),
    }),

  delete: (token: string, chatId: string) =>
    request<void>(`/chats/${chatId}`, { method: "DELETE", token }),
};

/** Send message to AI */
export function sendMessage(
  token: string,
  payload: {
    chat_id: string;
    message: string;
    model?: import("@/types").AIModel;
  }
) {
  return request<import("@/types").ChatMessageResponse>("/chat", {
    method: "POST",
    token,
    body: JSON.stringify({
      chat_id: payload.chat_id,
      message: payload.message,
      model: payload.model ?? "fast",
    }),
  });
}
