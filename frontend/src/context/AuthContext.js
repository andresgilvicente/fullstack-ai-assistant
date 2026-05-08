"use client";
import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // aqui centralizamos el estado de autenticacion para no repetir la misma
    // logica de sesion en cada pagina
    const [authState, setAuthState] = useState(() => {
        if (typeof window === "undefined") {
            // durante el render del servidor no podemos leer localstorage
            return { token: null, user: null };
        }

        // recuperamos lo que hubieramos guardado al hacer login
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");

        return {
            token,
            // si el usuario estaba guardado como json lo reconstruimos
            user: user ? JSON.parse(user) : null,
        };
    });

    const login = (token, user) => {
        // este metodo lo usan sobre todo login y profile
        // login lo usa para arrancar la sesion y profile para refrescar el
        // nombre de usuario en memoria despues de editarlo
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthState({ token, user });
    };

    const logout = () => {
        // aqui limpiamos la sesion local
        // el intento de invalidar el refresh token contra el backend se hace
        // aparte desde header.js
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setAuthState({ token: null, user: null });
    };

    return (
        // aqui dejamos token user login y logout disponibles para cualquier hijo
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
