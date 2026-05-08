"use client";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { login } from "../../services/api";
import styles from "./page.module.css";

export default function Login() {
  // en esta pagina controlamos el acceso a la aplicacion
  // si nos piden cambiar el flujo de inicio de sesion este es el primer sitio
  const router = useRouter();

  // reutilizamos la funcion login del contexto para guardar la sesion global
  const { login: loginContext } = useContext(AuthContext);

  // estados locales del formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  // aqui paramos el submit normal para controlar nosotros la peticion desde react
  e.preventDefault();
  console.log("Submitting login request to /api/auth/login/ with:", { username, password });
    setError("");

    // validacion minima de campos antes de ir al backend
    if (!username || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    try {
      // llamamos al backend desde services/api.js
      const data = await login(username, password);
      console.log("Login successful:", data);

      // guardamos el access token y el usuario en el contexto global
      // si quisieramos guardar mas datos de sesion se cambiaria aqui y en authcontext
      loginContext(data.access, { username });

      // despues de logarnos el flujo normal de la practica nos lleva al dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error details:", err);
      // si el backend rechaza el login damos un mensaje simple para el usuario
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="card auth-card">
      <h1 className="auth-title">Iniciar Sesión</h1>
      {/* si hubo error lo mostramos encima del formulario */}
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
      {/* dejamos una salida rapida al registro por si el usuario no tiene cuenta */}
<p className="mt-1 text-center">
  ¿No tienes cuenta? <a href="/register" className="primary-link">Regístrate aquí</a>
</p>
    </div>
  );
}
