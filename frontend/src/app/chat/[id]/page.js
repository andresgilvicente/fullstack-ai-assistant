"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getChat, sendMessage } from "../../../services/api";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Used to scroll to the latest message.
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const data = await getChat(id);
        setChat(data);
        setMessages(data.messages || []);
      } catch (e) {
        console.error("Failed to load chat", e);
        setError("The chat could not be loaded or does not exist.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadChat();
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || sending) return;

    const userMessage = inputValue;
    setInputValue("");

    // Show the user's message immediately; it is reconciled with the backend below.
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      await sendMessage(id, userMessage);

      // Reload the chat so the view reflects the persisted state.
      const data = await getChat(id);
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Failed to send message", e);
      alert("The message could not be sent. Check your remaining messages or whether the server is running.");
      // Roll back the optimistic message.
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading chat...</p>;

  if (error)
    return (
      <div className="card">
        <h2 className="text-danger">Error</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/dashboard")} className="btn mt-1">
          Back to dashboard
        </button>
      </div>
    );

  return (
    <div className="chat-container">
      <div className="chat-top-bar">
        <h3>{chat?.title || `Chat #${id}`}</h3>
        <button onClick={() => router.push("/dashboard")} className="btn btn-sm">
          Back
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role === "user" ? "user" : "llm"}`}>
            <strong>{msg.role === "user" ? "You" : "Assistant"}</strong>
            <p className="msg-text">{msg.content}</p>
          </div>
        ))}
        {sending && (
          <div className="message llm">
            <strong>Assistant</strong>
            <p className="msg-pending">Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
        />
        <button type="submit" className="btn" disabled={!inputValue.trim() || sending}>
          Send
        </button>
      </form>
    </div>
  );
}
