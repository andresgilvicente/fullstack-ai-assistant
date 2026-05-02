"use client";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { login } from "../../services/api";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const { login: loginContext } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Submitting login request to /api/auth/login/ with:", { username, password });
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    try {
      const data = await login(username, password);
      console.log("Login successful:", data);
      loginContext(data.access, { username });
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error details:", err);
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="card auth-card">
      <h1 className="auth-title">Iniciar Sesión</h1>
      {error && <p className="error-text mb-1">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn w-100 mt-1">Iniciar Sesión</button>
      </form>
<p className="mt-1 text-center">
  ¿No tienes cuenta? <a href="/register" className="primary-link">Regístrate aquí</a>
</p>
    </div>
  );
}