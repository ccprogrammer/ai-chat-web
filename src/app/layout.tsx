import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { ToastProvider } from "@/core/context/toast-context";
import { ThemeProvider } from "@/core/components/theme-provider";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with AI — multiple conversations, persistent history.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gh-bg text-gh-fg">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
