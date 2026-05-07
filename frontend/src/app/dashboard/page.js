"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsage, getChats, createChat, deleteChat } from "../../services/api";

export default function Dashboard() {
    // esta pagina es el centro de la practica, carga uso lista chats y permite crear o borrar
    const router = useRouter();

    // chats guarda el historico del usuario
    const [chats, setChats] = useState([]);

    // searchterm alimenta la ampliacion del buscador de chats
    const [searchTerm, setSearchTerm] = useState("");

    // usage trae el contador de mensajes usados y disponibles
    const [usage, setUsage] = useState(null);

    // loading nos deja enseñar una pantalla de espera mientras llegan los datos
    const [loading, setLoading] = useState(true);

    // normalizamos la busqueda para que no importen mayusculas ni espacios sobrantes
    const normalizedSearch = searchTerm.trim().toLowerCase();

    // filtramos chats por titulo o por contenido de mensajes
    // si quisieramos cambiar los criterios del buscador este bloque es el importante
    const filteredChats = chats.filter((chat) => {
        if (!normalizedSearch) {
            return true;
        }

        // si el chat no tiene titulo mostramos un fallback con el id
        const chatName = (chat.title || `Chat #${chat.id}`).toLowerCase();
        const titleMatches = chatName.includes(normalizedSearch);

        // tambien permitimos buscar dentro del contenido del historial
        const contentMatches = (chat.messages || []).some((message) =>
            (message.content || "").toLowerCase().includes(normalizedSearch)
        );

        return titleMatches || contentMatches;
    });

    useEffect(() => {
        const loadDashboard = async () => {
            // protegemos la pagina comprobando si hay sesion guardada
            const token = localStorage.getItem("accessToken");
            if (!token) {
                console.error("No access token found. Redirecting to login.");
                return router.push("/login");
            }

            try {
                // hacemos ambas peticiones en paralelo para que el dashboard cargue antes
                const [usageData, chatsData] = await Promise.all([
                    getUsage(),
                    getChats()
                ]);
                setUsage(usageData);
                setChats(chatsData);
                setLoading(false);
            } catch (e) {
                console.error(e);
                // si la sesion ha caducado o el token no vale devolvemos al login
                if (e.response?.status === 401) {
                    console.error("Authentication error, redirecting to login.");
                    return router.push("/login");
                } else {
                    console.error("Data fetch error: ", e);
                }
            }
        };

        // si hay sesion cargamos a la vez el uso y los chats
        loadDashboard();
    }, [router]);

    const handleCreateChat = async () => {
        try {
            // creamos un chat nuevo y en cuanto el backend nos devuelve su id
            // entramos directamente a su pantalla de conversacion
            const newChat = await createChat({ title: "" });
            router.push(`/chat/${newChat.id}`);
        } catch (e) {
            console.error("Error creating chat", e);
            alert("Error al crear un nuevo chat.");
        }
    };

    const handleDeleteChat = async (id) => {
        // pedimos confirmacion porque borrar un chat afecta al historico del usuario
        if (!confirm("¿Seguro que quieres borrar este chat?")) return;
        try {
            await deleteChat(id);

            // actualizamos la lista local sin recargar toda la pagina
            setChats(chats.filter(c => c.id !== id));
        } catch (e) {
            console.error("Error deleting chat", e);
            alert("Error al borrar el chat.");
        }
    };

    // mientras no tengamos datos mostramos una carga simple
    if (loading) return <p>Cargando panel...</p>;

    return (
        <div>
            <div className="card mb-2">
                <h2>Tus Tokens</h2>
                {usage ? (
                    <p className="dashboard-usage-text">
                        {/* el contador restante sale de restar usados al limite */}
                        Mensajes Restantes: <strong>{usage.messages_limit - usage.messages_used}</strong> / {usage.messages_limit}
                    </p>
                ) : (
                    <p>No se pudo cargar el uso.</p>
                )}
            </div>

            <div className="dashboard-header">
                <h2>Tus Chats</h2>
                <button onClick={handleCreateChat} className="btn">
                    + Crear nuevo chat
                </button>
            </div>

            <div className="form-group mb-1">
                {/* este es el input principal de la ampliacion del buscador */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o contenido..."
                />
            </div>

            {chats.length === 0 ? (
                <p>No tienes chats aún. ¡Crea uno para empezar!</p>
            ) : filteredChats.length === 0 ? (
                <p>No se han encontrado chats para esa búsqueda.</p>
            ) : (
                <div className="chat-list">
                    {filteredChats.map(chat => (
                        <div key={chat.id} className="chat-list-item">
                            <div>
                                {/* si algun dia nos piden renombrar chats o mostrar metadatos esta zona es clave */}
                                <strong className="chat-title">{chat.title || `Chat #${chat.id}`}</strong>

                                <p className="chat-date">

                                    Creado: {chat.created_at ? new Date(chat.created_at).toLocaleString() : "Fecha no disponible"}
                                </p>
                            </div>
                            <div className="chat-actions">
                                <Link href={`/chat/${chat.id}`} className="btn btn-sm">
                                    Abrir
                                </Link>
                                <button
                                    // borrar se resuelve contra el backend y luego actualiza el estado local
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
