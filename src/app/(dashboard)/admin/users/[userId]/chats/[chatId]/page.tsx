"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useChats,
  Sidebar,
  DashboardNavbar,
  MessageList,
} from "@/features/chat";
import { useAdminChatMessages } from "@/features/admin";

export default function AdminUserChatMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const chatId = params.chatId as string;

  const {
    chats,
    loading,
    renameChat,
    deleteChat,
  } = useChats();

  const { messages, loading: loadingMessages } =
    useAdminChatMessages(chatId);

  const handleDeleteChat = (id: string) => deleteChat(id);

  return (
    <div className="flex h-screen min-h-0 w-full flex-col items-stretch overflow-hidden md:flex-row">
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
          <div className="flex flex-1 flex-col overflow-y-auto">
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
