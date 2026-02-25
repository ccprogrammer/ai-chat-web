"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useEffect } from "react";
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
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const pendingSentRef = useRef(false);
  useEffect(() => {
    const pending = searchParams.get("send");
    if (!id || !pending || pendingSentRef.current) return;
    pendingSentRef.current = true;
    router.replace(`/chat/${id}`, { scroll: false });
    (async () => {
      const res = await sendMessage(pending);
      if (res) refetchChats();
    })();
  }, [id, searchParams, router, sendMessage, refetchChats]);

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
    <div className="flex h-mobile-screen w-full min-w-0 items-stretch overflow-hidden">
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
                <div className="sticky bottom-0 flex-shrink-0 bg-transparent px-2 pt-2 pb-[env(safe-area-inset-bottom)] sm:px-4 sm:pb-0">
                  <div className="mx-auto max-w-2xl">
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
