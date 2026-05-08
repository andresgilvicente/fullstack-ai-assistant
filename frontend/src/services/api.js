export const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:8000/api";

export const apiFetch = async (endpoint, options = {}) => {
    // esta funcion es la puerta de entrada unica al backend
    // si algo falla con headers tokens urls o errores casi siempre miraremos aqui
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

    // aqui montamos las cabeceras comunes y si hay token lo mandamos como bearer
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    // aqui construimos la url final uniendo la base /api con el endpoint concreto
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 && endpoint !== "/auth/login/") {
        // si el backend nos dice que la sesion ya no vale limpiamos y forzamos login
        // si quisieramos implementar refresh automatico tendriamos que ampliar esta parte
        if (typeof window !== 'undefined') {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }
    }

    // intentamos leer json solo si la respuesta lo trae
    // algunos endpoints como delete o logout pueden venir sin cuerpo
    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        // si no hay json no pasa nada y dejamos data a null
    }

    if (!response.ok) {
        // lanzamos un objeto simple con status y data para que las paginas decidan que hacer
        throw { status: response.status, data };
    }

    // si todo fue bien devolvemos lo que haya contestado el backend
    return data;
};

// a partir de aqui dejamos funciones pequeñas por caso de uso
// asi las paginas no montan a mano urls ni metodos http cada vez

// auth services
export const login = (username, password) => apiFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password })
});
export const register = (userData) => apiFetch("/users/register/", {
    method: "POST",
    body: JSON.stringify(userData)
});
export const logout = (refreshToken) => apiFetch("/users/logout/", { method: "POST", body: JSON.stringify({ refresh: refreshToken }) });

// user services
// si nos piden tocar perfil o password seguramente reutilizaremos estas tres
export const getProfile = () => apiFetch("/users/profile/");
export const updateProfile = (data) => apiFetch("/users/profile/", { method: "PUT", body: JSON.stringify(data) });
export const changePassword = (data) => apiFetch("/users/profile/password/", { method: "PUT", body: JSON.stringify(data) });

// usage services
// esto alimenta sobre todo el contador de mensajes restantes del dashboard
export const getUsage = () => apiFetch("/usage/");

// chats services
// aqui esta casi todo lo importante del flujo principal de la practica 3
export const getChats = () => apiFetch("/chats/");
export const createChat = (data) => apiFetch("/chats/", { method: "POST", body: JSON.stringify(data) });
export const getChat = (id) => apiFetch(`/chats/${id}/`);
export const deleteChat = (id) => apiFetch(`/chats/${id}/`, { method: "DELETE" });
export const sendMessage = (id, message) => apiFetch(`/chats/${id}/`, { method: "POST", body: JSON.stringify({ content: message }) });
