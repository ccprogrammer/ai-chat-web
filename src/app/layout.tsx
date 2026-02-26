import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { ToastProvider } from "@/core/context/toast-context";
import { ThemeProvider } from "@/core/components/theme-provider";
import { SessionExpiredPopup } from "@/core/components/session-expired-popup";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with AI — multiple conversations, persistent history.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
            <ToastProvider>
              {children}
              <SessionExpiredPopup />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
