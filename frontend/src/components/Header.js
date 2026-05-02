"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "../services/api";

export default function Header() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem("accessToken"));
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch (e) {
        console.error("Logout failed", e);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLogged(false);
    router.push("/login");
  };

  return (
    <header className="layout-header">
      <h2><Link href={isLogged ? "/dashboard" : "/"}>Mi App Chat</Link></h2>
      <nav>
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
