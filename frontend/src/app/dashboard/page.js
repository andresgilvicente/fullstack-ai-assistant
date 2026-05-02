"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsage, getChats, createChat, deleteChat } from "../../services/api";

export default function Dashboard() {
    const router = useRouter();
    const [chats, setChats] = useState([]);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if accessToken exists in localStorage
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found. Redirecting to login.");
            return router.push("/login");
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usageData, chatsData] = await Promise.all([
                getUsage(),
                getChats()
            ]);
            setUsage(usageData);
            setChats(chatsData);
            setLoading(false);
        } catch (e) {
            console.error(e);
            if (e.response?.status === 401) {
                console.error("Authentication error, redirecting to login.");
                return router.push("/login");
            } else {
                console.error("Data fetch error: ", e);
            }
        }
    };

    const handleCreateChat = async () => {
        try {
            const newChat = await createChat({ title: "" });
            router.push(`/chat/${newChat.id}`);
        } catch (e) {
            console.error("Error creating chat", e);
            alert("Error al crear un nuevo chat.");
        }
    };

    const handleDeleteChat = async (id) => {
        if (!confirm("¿Seguro que quieres borrar este chat?")) return;
        try {
            await deleteChat(id);
            setChats(chats.filter(c => c.id !== id));
        } catch (e) {
            console.error("Error deleting chat", e);
            alert("Error al borrar el chat.");
        }
    };

    if (loading) return <p>Cargando panel...</p>;

    return (
        <div>
            <div className="card mb-2">
                <h2>Tus Tokens</h2>
                {usage ? (
                    <p className="dashboard-usage-text">
                        Mensajes Restantes: <strong>{usage.messages_limit - usage.messages_used}</strong> / {usage.messages_limit}
                    </p>
                ) : (
                    <p>No se pudo cargar el uso.</p>
                )}
            </div>

            <div className="dashboard-header">
                <h2>Tus Chats</h2>
                <button onClick={() => router.push('/profile')} className="btn btn-secondary">
                    Ir al Perfil
                </button>
                <button onClick={handleCreateChat} className="btn">
                    + Crear nuevo chat
                </button>
            </div>

            {chats.length === 0 ? (
                <p>No tienes chats aún. ¡Crea uno para empezar!</p>
            ) : (
                <div className="chat-list">
                    {chats.map(chat => (
                        <div key={chat.id} className="chat-list-item">
                            <div>
                                {/* Cambiamos chat.name por chat.title */}
                                <strong>{chat.title || `Chat #${chat.id}`}</strong>

                                <p className="chat-date">

                                    Creado: {chat.created_at ? new Date(chat.created_at).toLocaleString() : "Fecha no disponible"}
                                </p>
                            </div>
                            <div className="chat-actions">
                                <Link href={`/chat/${chat.id}`} className="btn btn-sm">
                                    Abrir
                                </Link>
                                <button
                                    onClick={() => handleDeleteChat(chat.id)}
                                    className="btn btn-danger btn-sm"
                                >
                                    Borrar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}