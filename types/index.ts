/** Backend API types aligned with FastAPI schemas */

export type AIModel = "fast" | "balanced" | "smart";

export interface Chat {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface Message {
  id: number;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

export interface ChatMessageResponse {
  reply: string;
  chat_id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
