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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchChat();
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const fetchChat = async () => {
    try {
      const data = await getChat(id);
      setChat(data);
      setMessages(data.messages || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError("Error al cargar el chat o el chat no existe.");
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      const response = await sendMessage(id, userMessage);
      const data = await getChat(id);
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
      alert("Error enviando el mensaje. Revisa si te quedan tokens o si el servidor está activo.");
      setMessages((prev) => prev.slice(0, -1)); // optimistic UI revert
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Cargando el chat...</p>;
  if (error) return (
    <div className="card">
      <h2 className="text-danger">Error</h2>
      <p>{error}</p>
      <button onClick={() => router.push("/dashboard")} className="btn mt-1">Volver al dashboard</button>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="chat-top-bar">
        <h3>{chat?.name || `Chat #${id}`}</h3>
        <button onClick={() => router.push("/dashboard")} className="btn btn-sm">Atrás</button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role === "user" ? "user" : "llm"}`}>
            <strong>{msg.role === "user" ? "Tú: " : "LLM: "}</strong>
            <p className="msg-text">{msg.content}</p>
          </div>
        ))}
        {sending && (
          <div className="message llm">
            <strong>LLM:</strong>
            <p className="msg-pending">Pensando...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          disabled={sending}
        />
        <button type="submit" className="btn" disabled={!inputValue.trim() || sending}>
          Enviar
        </button>
      </form>
    </div>
  );
}
