"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register, getErrorMessage } from "../../services/api";

const PASSWORD_HINT =
  "The password must be at least 8 characters long and include a number, an uppercase letter and a lowercase letter.";

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

  // One handler for every input, keyed by the input's `name` attribute.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Client-side checks give fast feedback; the backend enforces the same rules.
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Invalid email format.";
    }

    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPolicy.test(formData.password)) {
      return PASSWORD_HINT;
    }

    if (formData.password !== formData.confirm_password) {
      return "The passwords do not match.";
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
      await register({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password2: formData.confirm_password,
      });

      router.push("/login");
    } catch (err) {
      console.error("Registration failed", err);
      setError(getErrorMessage(err, "Could not create the account. Please try again."));
    }
  };

  return (
    <div className="card auth-card">
      <h1 className="auth-title">Create account</h1>
      {error && <p className="error-text mb-1">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">First name</label>
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
          <label htmlFor="last_name">Last name</label>
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
          <label htmlFor="username">Username</label>
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
          <label htmlFor="email">Email</label>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <small className="help-text">{PASSWORD_HINT}</small>
        </div>
        <div className="form-group">
          <label htmlFor="confirm_password">Confirm password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn w-100 mt-1">
          Register
        </button>
      </form>
    </div>
  );
}
