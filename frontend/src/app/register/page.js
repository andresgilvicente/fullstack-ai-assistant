"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { register } from "../../services/api";

export default function Register() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return "Formato de email no válido.";
        }
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPolicy.test(formData.password)) {
            return "La contraseña debe tener al menos 8 caracteres, un número, una mayúscula y una minúscula.";
        }
        if (formData.password !== formData.confirm_password) {
            return "Las contraseñas no coinciden.";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            console.log("Submitting request to /api/users/register/ with data:", formData);
            await register({
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password2: formData.confirm_password,
            });
            router.push("/login");
        } catch (err) {
            console.error(err);
            setError("Error al registrar. Por favor, intente nuevamente.");
        }
    };

    return (
        <div className="card auth-card">
            <h1 className="auth-title">Crear Cuenta</h1>
            {error && <p className="error-text mb-1">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="first_name">Nombre:</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="last_name">Apellidos:</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Usuario:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <small className="help-text">
                        La contraseña debe tener al menos 8 caracteres, un número, una mayúscula y una minúscula.
                    </small>
                </div>
                <div className="form-group">
                    <label htmlFor="confirm_password">Confirmar Contraseña:</label>
                    <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn w-100 mt-1">Registrarse</button>
            </form>
        </div>
    );
}