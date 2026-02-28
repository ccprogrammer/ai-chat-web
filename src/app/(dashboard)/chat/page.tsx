"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/core/api";
import {
  useChats,
  DashboardNavbar,
  Sidebar,
  Composer,
  MessageList,
} from "@/features/chat";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M19 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4z" opacity={0.85} />
      <path d="M5 19l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z" opacity={0.7} />
    </svg>
  );
}

export default function ChatIndexPage() {
  const router = useRouter();
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const {
    chats,
    loading,
    sending,
    sendMessageFromNewChat,
    renameChat,
    deleteChat,
  } = useChats();

  const handleDeleteChat = (id: string) => deleteChat(id);

  const handleSend = async (message: string) => {
    setPendingMessage(message);
    try {
      await sendMessageFromNewChat(message);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setPendingMessage(null);
    }
  };

  const optimisticMessages = pendingMessage
    ? [
        {
          id: -1,
          chat_id: "",
          role: "user" as const,
          content: pendingMessage,
          created_at: new Date().toISOString(),
        },
      ]
    : [];

  return (
    <div className="flex h-mobile-screen w-full min-w-0 flex-col items-stretch overflow-hidden md:flex-row">
      <Sidebar
        chats={chats}
        onNewChat={() => router.push("/chat")}
        onRenameChat={renameChat}
        onDeleteChat={handleDeleteChat}
        canDeleteChat={() => true}
        isLoading={loading}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {pendingMessage ? (
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-24 md:pt-14 md:px-12 lg:px-16 xl:px-24">
                <MessageList
                  messages={optimisticMessages}
                  isThinking={sending}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-transparent px-2 pt-2 pb-[env(safe-area-inset-bottom)] sm:px-4 sm:pb-0">
                <div className="mx-auto w-full max-w-2xl">
                  <Composer
                    onSend={handleSend}
                    disabled={sending}
                    isSending={sending}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-3 py-4 sm:py-8 sm:px-4 sm:py-12">
              <div className="flex w-full max-w-2xl flex-col items-center gap-4 sm:gap-6 md:gap-8">
                <div className="flex flex-col items-center gap-2 text-center sm:gap-3 md:gap-4">
                  <SparkleIcon className="h-10 w-10 text-gh-accent sm:h-12 sm:w-12 md:h-14 md:w-14" />
                  <div>
                    <h2 className="text-base font-semibold text-gh-fg sm:text-lg md:text-xl">
                      Hi there
                    </h2>
                    <p className="mt-1 text-base font-medium text-gh-fg sm:mt-2 sm:text-xl md:text-2xl">
                      Where should we start?
                    </p>
                  </div>
                </div>
                <div className="w-full max-w-3xl px-2 sm:px-0">
                  <Composer
                    onSend={handleSend}
                    disabled={sending}
                    isSending={sending}
                    embedded
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
