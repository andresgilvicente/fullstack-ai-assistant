"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { register } from "../../services/api";

export default function Register() {
    // esta pagina crea usuarios nuevos consumiendo el endpoint de registro
    const router = useRouter();

    // guardamos todos los campos del formulario en un solo estado
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
        // reutilizamos una sola funcion para todos los inputs usando su atributo name
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        // validamos el email en frontend para dar respuesta rapida antes de llamar al backend
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return "Formato de email no válido.";
        }

        // validamos tambien la password segun lo que queriamos pedir en la practica
        // si nos cambian esta politica tocariamos esta regex y seguramente tambien el backend
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPolicy.test(formData.password)) {
            return "La contraseña debe tener al menos 8 caracteres, un número, una mayúscula y una minúscula.";
        }

        // comprobamos que ambas contraseñas sean iguales
        if (formData.password !== formData.confirm_password) {
            return "Las contraseñas no coinciden.";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // antes de enviar nada dejamos pasar solo formularios validos
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            console.log("Submitting request to /api/users/register/ with data:", formData);
            // adaptamos los nombres del formulario a lo que espera el backend
            await register({
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password2: formData.confirm_password,
            });

            // si el registro sale bien el siguiente paso natural es ir al login
            router.push("/login");
        } catch (err) {
            console.error(err);
            // aqui podriamos mostrar errores mas finos del backend si nos lo pidieran
        }
    };

    return (
        <div className="card auth-card">
            <h1 className="auth-title">Crear Cuenta</h1>
            {/* mostramos el primer error detectado en frontend */}
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
