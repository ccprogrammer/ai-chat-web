"use client";

import { useParams, useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import {
  useChats,
  useChatMessages,
  DashboardNavbar,
  Sidebar,
  MessageList,
  Composer,
} from "@/features/chat";

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    loading: loadingChats,
    refetch: refetchChats,
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

  const isEmpty = messages.length === 0 && !loadingMessages;

  return (
    <div className="flex h-mobile-screen w-full min-w-0 flex-col items-stretch overflow-hidden md:flex-row">
      <Sidebar
        chats={chats}
        onNewChat={() => router.push("/chat")}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        canDeleteChat={() => true}
        isLoading={loadingChats}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden md:pt-0">
          {isEmpty ? (
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
                  <Composer onSend={handleSend} disabled={sending} isSending={sending} embedded />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="min-h-0 flex-1 overflow-y-auto pb-24 md:pt-14 md:px-12 lg:px-16 xl:px-24"
              >
                <MessageList
                  messages={messages}
                  isLoading={loadingMessages && messages.length === 0}
                  isThinking={sending}
                />
              </div>
              {!loadingMessages && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-transparent px-2 pt-2 pb-[env(safe-area-inset-bottom)] sm:px-4 sm:pb-0">
                  <div className="mx-auto w-full max-w-2xl">
                    <Composer onSend={handleSend} disabled={sending} isSending={sending} />
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
