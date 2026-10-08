"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsage, getChats, createChat, deleteChat } from "../../services/api";

export default function Dashboard() {
  const router = useRouter();

  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // A chat matches when the search term appears in its title or in any message.
  const filteredChats = chats.filter((chat) => {
    if (!normalizedSearch) {
      return true;
    }

    const chatName = (chat.title || `Chat #${chat.id}`).toLowerCase();
    const titleMatches = chatName.includes(normalizedSearch);

    const contentMatches = (chat.messages || []).some((message) =>
      (message.content || "").toLowerCase().includes(normalizedSearch)
    );

    return titleMatches || contentMatches;
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return router.push("/login");
      }

      try {
        const [usageData, chatsData] = await Promise.all([getUsage(), getChats()]);
        setUsage(usageData);
        setChats(chatsData);
        setLoading(false);
      } catch (e) {
        console.error("Failed to load the dashboard", e);
        if (e.status === 401) {
          return router.push("/login");
        }
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat({ title: "" });
      router.push(`/chat/${newChat.id}`);
    } catch (e) {
      console.error("Failed to create chat", e);
      alert("Could not create a new chat.");
    }
  };

  const handleDeleteChat = async (id) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      await deleteChat(id);
      setChats(chats.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Failed to delete chat", e);
      alert("Could not delete the chat.");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <div className="card mb-2">
        <h2>Usage</h2>
        {usage ? (
          <p className="dashboard-usage-text">
            Messages remaining: <strong>{usage.messages_limit - usage.messages_used}</strong> /{" "}
            {usage.messages_limit}
          </p>
        ) : (
          <p>Usage information could not be loaded.</p>
        )}
      </div>

      <div className="dashboard-header">
        <h2>Your chats</h2>
        <button onClick={handleCreateChat} className="btn">
          + New chat
        </button>
      </div>

      <div className="form-group mb-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title or content..."
        />
      </div>

      {chats.length === 0 ? (
        <p>You have no chats yet. Create one to get started.</p>
      ) : filteredChats.length === 0 ? (
        <p>No chats match your search.</p>
      ) : (
        <div className="chat-list">
          {filteredChats.map((chat) => (
            <div key={chat.id} className="chat-list-item">
              <div>
                <strong className="chat-title">{chat.title || `Chat #${chat.id}`}</strong>
                <p className="chat-date">
                  Created:{" "}
                  {chat.created_at ? new Date(chat.created_at).toLocaleString() : "Date unavailable"}
                </p>
              </div>
              <div className="chat-actions">
                <Link href={`/chat/${chat.id}`} className="btn btn-sm">
                  Open
                </Link>
                <button onClick={() => handleDeleteChat(chat.id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
