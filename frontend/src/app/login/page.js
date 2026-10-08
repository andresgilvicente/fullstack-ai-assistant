"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { login } from "../../services/api";

export default function Login() {
  const router = useRouter();
  const { login: loginContext } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const data = await login(username, password);
      loginContext(data.access, { username }, data.refresh);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      setError("Incorrect username or password.");
    }
  };

  return (
    <div className="card auth-card">
      <h1 className="auth-title">Sign in</h1>
      {error && <p className="error-text mb-1">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn w-100 mt-1">
          Sign in
        </button>
      </form>
      <p className="mt-1 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="primary-link">
          Register
        </Link>
      </p>
    </div>
  );
}
