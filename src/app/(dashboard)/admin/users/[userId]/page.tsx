"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useChats,
  Sidebar,
  DashboardNavbar,
} from "@/features/chat";
import { useAdminUserChats } from "@/features/admin";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function AdminUserChatsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const {
    chats: myChats,
    loading: loadingMyChats,
    sending: creatingChat,
    createChat,
    renameChat,
    deleteChat,
  } = useChats();

  const { chats: userChats, loading: loadingUserChats } =
    useAdminUserChats(userId);

  const handleDeleteChat = (id: string) => deleteChat(id);

  return (
    <div className="flex h-screen min-h-0 w-full items-stretch overflow-hidden">
      <Sidebar
        chats={myChats}
        onCreateChat={createChat}
        onRenameChat={renameChat}
        onDeleteChat={handleDeleteChat}
        canDeleteChat={() => true}
        isLoading={loadingMyChats}
        isCreating={creatingChat}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            <div className="max-w-2xl">
              <Link
                href="/chat"
                className="mb-4 inline-flex items-center gap-1 text-sm text-gh-accent hover:underline"
              >
                ← Back
              </Link>
              <h1 className="mb-4 text-lg font-semibold text-gh-fg">
                User&apos;s chats
              </h1>
              {loadingUserChats ? (
                <p className="text-gh-fg-muted">Loading…</p>
              ) : userChats.length === 0 ? (
                <p className="text-gh-fg-muted">No chats yet.</p>
              ) : (
                <ul className="space-y-2">
                  {userChats.map((chat) => (
                    <li key={chat.id}>
                      <Link
                        href={`/admin/users/${userId}/chats/${chat.id}`}
                        className="block rounded-lg border border-gh-border bg-gh-bg-subtle px-4 py-3 text-gh-fg hover:border-gh-border-muted"
                      >
                        <span className="block font-medium">
                          {chat.title?.trim() || "New chat"}
                        </span>
                        <span className="mt-1 block text-sm text-gh-fg-muted">
                          {formatDate(chat.updated_at)} · {chat.message_count}{" "}
                          messages
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
