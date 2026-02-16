"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useChats,
  Sidebar,
  DashboardNavbar,
  MessageList,
} from "@/features/chat";
import { useAdminChatMessages } from "@/features/admin";

export default function AdminChatMessagesPage() {
  const params = useParams();
  const chatId = params.chatId as string;

  const {
    chats,
    loading,
    createChat,
    renameChat,
    deleteChat,
  } = useChats();

  const { messages, loading: loadingMessages } =
    useAdminChatMessages(chatId);

  const handleDeleteChat = (id: string) => deleteChat(id);

  return (
    <div className="flex h-screen min-h-0 w-full items-stretch overflow-hidden">
      <Sidebar
        chats={chats}
        onCreateChat={createChat}
        onRenameChat={renameChat}
        onDeleteChat={handleDeleteChat}
        canDeleteChat={() => true}
        isLoading={loading}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="p-4">
              <Link
                href="/chat"
                className="mb-4 inline-flex items-center gap-1 text-sm text-gh-accent hover:underline"
              >
                ← Back to my chats
              </Link>
            </div>
            <MessageList
              messages={messages}
              isLoading={loadingMessages && messages.length === 0}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
