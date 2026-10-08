export const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:8000/api";

/**
 * Single entry point to the backend.
 *
 * Attaches the stored access token as a Bearer header, redirects to the login
 * page when the session is no longer valid and throws `{ status, data }` for
 * any non-2xx response so that callers can decide how to react.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 && endpoint !== "/auth/login/") {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }

  // Some endpoints (DELETE, logout) answer without a JSON body.
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
};

/**
 * Extract a human-readable message from an error thrown by `apiFetch`.
 * Falls back to `fallback` when the backend did not provide one.
 */
export const getErrorMessage = (error, fallback) => {
  const data = error?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;

  const first = Object.values(data)[0];
  const message = Array.isArray(first) ? first[0] : first;
  return typeof message === "string" ? message : fallback;
};

// Authentication
export const login = (username, password) =>
  apiFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
export const register = (userData) =>
  apiFetch("/users/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
export const logout = (refreshToken) =>
  apiFetch("/users/logout/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });

// User profile
export const getProfile = () => apiFetch("/users/profile/");
export const updateProfile = (data) =>
  apiFetch("/users/profile/", { method: "PUT", body: JSON.stringify(data) });
export const changePassword = (data) =>
  apiFetch("/users/profile/password/", { method: "PUT", body: JSON.stringify(data) });

// Usage quota
export const getUsage = () => apiFetch("/usage/");

// Chats
export const getChats = () => apiFetch("/chats/");
export const createChat = (data) =>
  apiFetch("/chats/", { method: "POST", body: JSON.stringify(data) });
export const getChat = (id) => apiFetch(`/chats/${id}/`);
export const deleteChat = (id) => apiFetch(`/chats/${id}/`, { method: "DELETE" });
export const sendMessage = (id, message) =>
  apiFetch(`/chats/${id}/`, { method: "POST", body: JSON.stringify({ content: message }) });
