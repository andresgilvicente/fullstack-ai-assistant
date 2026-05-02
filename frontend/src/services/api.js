export const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:8000/api";

export const apiFetch = async (endpoint, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 && endpoint !== "/auth/login/") {
        // Basic handle token expiration: clear and redirect
        if (typeof window !== 'undefined') {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }
    }

    // Parse JSON conditionally
    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        // some endpoints like logout return 204 No Content
    }

    if (!response.ok) {
        throw { status: response.status, data };
    }

    return data;
};

// Auth services
export const login = (username, password) => apiFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password })
});
export const register = (userData) => apiFetch("/users/register/", {
    method: "POST",
    body: JSON.stringify(userData)
});
export const logout = (refreshToken) => apiFetch("/users/logout/", { method: "POST", body: JSON.stringify({ refresh: refreshToken }) });

// User services
export const getProfile = () => apiFetch("/users/profile/");
export const updateProfile = (data) => apiFetch("/users/profile/", { method: "PUT", body: JSON.stringify(data) });
export const changePassword = (data) => apiFetch("/users/profile/password/", { method: "PUT", body: JSON.stringify(data) });

// Usage services
export const getUsage = () => apiFetch("/usage/");

// Chats services
export const getChats = () => apiFetch("/chats/");
export const createChat = (data) => apiFetch("/chats/", { method: "POST", body: JSON.stringify(data) });
export const getChat = (id) => apiFetch(`/chats/${id}/`);
export const deleteChat = (id) => apiFetch(`/chats/${id}/`, { method: "DELETE" });
export const sendMessage = (id, message) => apiFetch(`/chats/${id}/`, { method: "POST", body: JSON.stringify({ content: message }) });
