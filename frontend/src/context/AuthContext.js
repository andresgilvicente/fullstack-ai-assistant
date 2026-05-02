"use client";
import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(() => {
        if (typeof window === "undefined") {
            return { token: null, user: null };
        }

        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");

        return {
            token,
            user: user ? JSON.parse(user) : null,
        };
    });

    const login = (token, user) => {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthState({ token, user });
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setAuthState({ token: null, user: null });
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
