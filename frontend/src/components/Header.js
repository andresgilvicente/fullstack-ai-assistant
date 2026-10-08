"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { logout as logoutRequest } from "../services/api";

export default function Header() {
  const router = useRouter();
  const { token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isLogged = !!token;

  const handleLogout = async () => {
    // Invalidate the refresh token on the backend; the local session is
    // cleared regardless of whether this request succeeds.
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch (e) {
        console.error("Logout request failed", e);
      }
    }

    logout();
    router.push("/login");
  };

  return (
    <header className="layout-header">
      <h2>
        <Link href={isLogged ? "/dashboard" : "/"}>AI Chat Assistant</Link>
      </h2>
      <nav>
        <button onClick={toggleTheme} type="button">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {isLogged ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <button onClick={handleLogout}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/login">Sign in</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
