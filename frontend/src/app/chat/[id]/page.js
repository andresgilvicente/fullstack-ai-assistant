"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getChat, sendMessage } from "../../../services/api";

export default function ChatPage() {
  // esta pantalla representa un chat concreto y el id sale de la url dinamica /chat/[id]
  const router = useRouter();
  const params = useParams();

  // recuperamos el id del chat desde la ruta
  const id = params.id;

  // chat guarda los metadatos generales y messages el historial visible
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // inputvalue es lo que el usuario esta escribiendo ahora mismo
  const [inputValue, setInputValue] = useState("");

  // loading controla la carga inicial y sending el envio de mensajes
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // error nos sirve para mostrar una pantalla clara si no se pudo abrir el chat
  const [error, setError] = useState("");

  // esta referencia nos deja hacer scroll automatico al ultimo mensaje
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        // traemos del backend tanto el chat como su historial de mensajes
        const data = await getChat(id);
        setChat(data);
        setMessages(data.messages || []);
        setLoading(false);
      } catch (e) {
        console.error(e);
        // este texto es la pantalla de error
        setError("Error al cargar el chat o el chat no existe.");
        setLoading(false);
      }
    };

    // cada vez que cambiamos de id recargamos ese chat concreto
    if (id) {
      loadChat();
    }
  }, [id]);

  useEffect(() => {
    // si cambian los mensajes o estamos esperando respuesta bajamos al final
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();

    // no dejamos enviar ni mensajes vacios ni envios duplicados mientras esperamos
    if (!inputValue.trim() || sending) return;

    // guardamos el texto en una variable antes de limpiar el input
    const userMessage = inputValue;
    setInputValue("");

    // pintamos optimistamente el mensaje del usuario para que la interfaz responda al instante
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      // enviamos el mensaje al backend que a su vez lo manda al modelo
      const response = await sendMessage(id, userMessage);

      // luego recargamos el chat completo para quedarnos con el estado real del backend
      const data = await getChat(id);
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
      alert("Error enviando el mensaje. Revisa si te quedan tokens o si el servidor está activo.");
      // si la operacion falla quitamos el mensaje optimista que habiamos añadido
      setMessages((prev) => prev.slice(0, -1)); // optimistic UI revert
    } finally {
      // pase lo que pase salimos del estado de envio
      setSending(false);
    }
  };

  // carga inicial del chat
  if (loading) return <p>Cargando el chat...</p>;

  // pantalla de error clara si el chat no se pudo recuperar
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
        {/* ojo aqui usamos chat?.name como titulo visible, si quisieramos unificarlo
            con backend seguramente cambiariamos esto a chat?.title */}
        <h3>{chat?.name || `Chat #${id}`}</h3>
        <button onClick={() => router.push("/dashboard")} className="btn btn-sm">Atrás</button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          // la clase cambia segun el rol y eso hace que el css lo pinte a izquierda o derecha
          <div key={idx} className={`message ${msg.role === "user" ? "user" : "llm"}`}>
            <strong>{msg.role === "user" ? "Tú: " : "LLM: "}</strong>
            <p className="msg-text">{msg.content}</p>
          </div>
        ))}
        {sending && (
          // esta es la espera visual mientras el backend sigue procesando la respuesta
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
        {/* el boton se desactiva con mensaje vacio o mientras esperamos respuesta */}
        <button type="submit" className="btn" disabled={!inputValue.trim() || sending}> {/* strim elimina espacios en blanco al principio y final de un string*/}
          Enviar
        </button>
      </form>
    </div>
  );
}
