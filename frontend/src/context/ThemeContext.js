"use client";

import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

/**
 * Provides the current colour theme ("light" or "dark") and a toggle. The
 * theme is applied as a `data-theme` attribute on <html>, which the CSS
 * variables in globals.css react to, and is persisted in localStorage.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
