"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { logout as logoutRequest } from "../services/api";

export default function Header() {
  const router = useRouter();

  // aqui sacamos del contexto si hay sesion y la funcion local de logout
  const { token, logout } = useContext(AuthContext);

  // aqui sacamos del contexto de tema el estado actual y el boton para alternarlo
  const { theme, toggleTheme } = useContext(ThemeContext);

  // consideramos al usuario logado si existe token en el contexto
  const isLogged = !!token;

  const handleLogout = async () => {
    // si tuvieramos refreshtoken guardado intentamos invalidarlo en backend
    // si algun dia nos piden arreglar o mejorar el logout este metodo es clave
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch (e) {
        console.error("Logout failed", e);
      }
    }

    // luego borramos cualquier resto local de sesion y mandamos al login
    localStorage.removeItem("refreshToken");
    logout();
    router.push("/login");
  };

  return (
    <header className="layout-header">
      {/* el titulo nos sirve tambien como enlace rapido a la zona principal */}
      <h2><Link href={isLogged ? "/dashboard" : "/"}>Agil But Fragile - LLM</Link></h2>
      <nav>
        {/* este boton cambia el tema global usando themecontext */}
        <button onClick={toggleTheme} type="button">
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </button>
        {isLogged ? (
          <>
            {/* si hay sesion enseñamos enlaces privados */}
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Perfil</Link>
            <button onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            {/* si no hay sesion solo dejamos entrar o registrarse */}
            <Link href="/login">Entrar</Link>
            <Link href="/register">Registro</Link>
          </>
        )}
      </nav>
    </header>
  );
}
