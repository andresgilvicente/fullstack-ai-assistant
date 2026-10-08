"use client";
import { createContext, useState } from "react";

export const AuthContext = createContext();

/**
 * Holds the authentication state (access token and user) and persists it in
 * localStorage so that the session survives page reloads.
 */
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    // localStorage does not exist during server-side rendering.
    if (typeof window === "undefined") {
      return { token: null, user: null };
    }

    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    return { token, user: user ? JSON.parse(user) : null };
  });

  // Start a session, or refresh the stored user after a profile update.
  // The refresh token is only stored when one is provided.
  const login = (token, user, refreshToken) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    setAuthState({ token, user });
  };

  // Clear the local session. Invalidating the refresh token on the backend is
  // done separately by the header before calling this.
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setAuthState({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
