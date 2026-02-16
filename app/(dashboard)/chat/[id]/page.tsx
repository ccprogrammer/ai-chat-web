"use client";

import { useParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { useChats } from "@/lib/hooks/use-chats";
import { useChatMessages } from "@/lib/hooks/use-chat-messages";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";

export default function ChatThreadPage() {
  const params = useParams();
  const id = params.id as string;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    loading: loadingChats,
    refetch: refetchChats,
    createChat,
    renameChat,
    deleteChat,
  } = useChats(id);

  const {
    messages,
    loading: loadingMessages,
    sending,
    sendMessage,
  } = useChatMessages(id);

  const handleSend = async (message: string) => {
    const res = await sendMessage(message);
    if (res) refetchChats();
  };

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [messages.length, loadingMessages, sending]);

  const hasEmptyNewChat = chats.some(
    (c) =>
      c.message_count === 0 &&
      (!c.title ||
        c.title.trim() === "" ||
        c.title.trim().toLowerCase() === "new chat")
  );

  const isEmpty = messages.length === 0 && !loadingMessages;

  return (
    <div className="flex h-screen min-h-0 w-full items-stretch overflow-hidden">
      <Sidebar
        chats={chats}
        onCreateChat={() => !hasEmptyNewChat && createChat()}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        canDeleteChat={() => true}
        isLoading={loadingChats}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
              <div className="flex w-full max-w-2xl flex-col items-center gap-6 sm:gap-8">
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  <SparkleIcon className="h-12 w-12 text-gh-accent sm:h-14 sm:w-14" />
                  <div>
                    <h2 className="text-lg font-semibold text-gh-fg sm:text-xl">
                      Hi there
                    </h2>
                    <p className="mt-2 text-xl font-medium text-gh-fg sm:text-2xl md:text-3xl">
                      Where should we start?
                    </p>
                  </div>
                </div>
                <div className="w-full max-w-3xl px-2 sm:px-0">
                  <Composer onSend={handleSend} disabled={sending} embedded />
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              <MessageList
                messages={messages}
                isLoading={loadingMessages && messages.length === 0}
                isThinking={sending}
              />
              {!loadingMessages && (
                <div className="sticky bottom-0 flex-shrink-0 bg-transparent px-2 pt-2 sm:px-4">
                  <div className="mx-auto max-w-2xl">
                    <Composer onSend={handleSend} disabled={sending} />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M19 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4z" opacity={0.85} />
      <path d="M5 19l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z" opacity={0.7} />
    </svg>
  );
}
