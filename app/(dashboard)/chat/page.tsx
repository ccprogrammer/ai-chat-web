"use client";

import { useRouter } from "next/navigation";
import { useChats } from "@/lib/hooks/use-chats";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { Sidebar } from "@/components/chat/sidebar";
import { Composer } from "@/components/chat/composer";

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
  const {
    chats,
    loading,
    sending,
    createChat,
    createChatWithFirstMessage,
    renameChat,
    deleteChat,
  } = useChats();

  const handleCreateChat = () => {
    if (chats.length === 0) return;
    const emptyNewChat = chats.find(
      (c) =>
        c.message_count === 0 &&
        (!c.title ||
          c.title.trim() === "" ||
          c.title.trim().toLowerCase() === "new chat")
    );
    if (emptyNewChat) {
      router.push(`/chat/${emptyNewChat.id}`);
      return;
    }
    createChat();
  };

  const handleDeleteChat = (id: string) => deleteChat(id);

  return (
    <div className="flex h-screen min-h-0 w-full items-stretch overflow-hidden">
      <Sidebar
        chats={chats}
        onCreateChat={handleCreateChat}
        onRenameChat={renameChat}
        onDeleteChat={handleDeleteChat}
        canDeleteChat={() => true}
        isLoading={loading}
        createChatDisabled={chats.length === 0}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
                <Composer
                  onSend={createChatWithFirstMessage}
                  disabled={sending}
                  embedded
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
