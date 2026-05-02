"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { getUsage, updateProfile, changePassword } from "../../services/api";

export default function ProfilePage() {
    const router = useRouter();
    const { user, login, token } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: user?.username || "",
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [usage, setUsage] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePasswords = () => {
        if (formData.new_password !== formData.confirm_password) {
            return "Las nuevas contraseñas no coinciden.";
        }
        return null;
    };

    const handleNameSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const updatedUser = await updateProfile({ username: formData.username });
            login(token, updatedUser);
            setMessage(`Usuario actualizado correctamente a: ${updatedUser.username}`);
        } catch (err) {
            console.error("Error actualizando el nombre de usuario:", err);
            const usernameError = err?.data?.username?.[0];
            setError(usernameError || "No se pudo actualizar el nombre de usuario. Intente nuevamente.");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const validationError = validatePasswords();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await changePassword({
                old_password: formData.current_password,
                password: formData.new_password,
                password2: formData.confirm_password,
            });
            setMessage("Contraseña actualizada correctamente.");
            setFormData((prev) => ({ ...prev, current_password: "", new_password: "", confirm_password: "" }));
        } catch (err) {
            console.error("Error actualizando la contraseña:", err);
            setError("No se pudo actualizar la contraseña. Intente nuevamente.");
        }
    };

    return (
        <div className="card auth-card">
            <h1 className="auth-title">Perfil de Usuario</h1>
            {error && <p className="error-text mb-1">{error}</p>}
            {message && <p className="success-text mb-1">{message}</p>}

            <form onSubmit={handleNameSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Nombre de Usuario:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn w-100 mt-1">Actualizar Nombre</button>
            </form>

            <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                    <label htmlFor="current_password">Contraseña Actual:</label>
                    <input
                        type="password"
                        id="current_password"
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="new_password">Nueva Contraseña:</label>
                    <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        required
                    />
                    <small className="help-text">
                        La contraseña debe tener al menos 8 caracteres, incluyendo un número y una letra mayúscula.
                    </small>
                </div>
                <div className="form-group">
                    <label htmlFor="confirm_password">Confirmar Nueva Contraseña:</label>
                    <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn w-100 mt-1">Actualizar Contraseña</button>
            </form>
            <button onClick={() => router.push('/dashboard')} className="btn btn-secondary w-100 mt-1">
                Volver al Dashboard
            </button>
        </div>
    );
}
