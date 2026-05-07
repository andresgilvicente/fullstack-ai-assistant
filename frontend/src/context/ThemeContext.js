"use client";

import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // aqui guardamos el tema actual de toda la web para que header paginas
    // y estilos globales tiren todos de lo mismo
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") {
            // en render del servidor no existe localstorage asi que devolvemos
            // un valor seguro por defecto
            return "light";
        }

        // intentamos recuperar la ultima preferencia guardada en el navegador
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
    });

    useEffect(() => {
        // este atributo lo leen luego los estilos de globals.css para cambiar
        // colores sin tocar componente por componente
        document.documentElement.setAttribute("data-theme", theme);

        // ademas lo guardamos para que al recargar no se pierda la eleccion
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        // con esto alternamos entre claro y oscuro desde el header
        // si quisieramos meter un tercer tema la logica cambiaria aqui
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        // aqui dejamos theme y toggletheme disponibles para toda la app
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
