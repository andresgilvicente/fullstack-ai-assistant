"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { logout as logoutRequest } from "../services/api";

export default function Header() {
  const router = useRouter();
  const { token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);
  const isLogged = mounted && !!token;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch (e) {
        console.error("Logout failed", e);
      }
    }
    localStorage.removeItem("refreshToken");
    logout();
    router.push("/login");
  };

  return (
    <header className="layout-header">
      <h2><Link href={isLogged ? "/dashboard" : "/"}>Agil But Fragile - LLM</Link></h2>
      <nav>
        <button onClick={toggleTheme} type="button">
          {mounted && theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </button>
        {isLogged ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Perfil</Link>
            <button onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <Link href="/login">Entrar</Link>
            <Link href="/register">Registro</Link>
          </>
        )}
      </nav>
    </header>
  );
}
