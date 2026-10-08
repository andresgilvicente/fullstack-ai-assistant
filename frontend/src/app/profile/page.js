"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { updateProfile, changePassword, getErrorMessage } from "../../services/api";

export default function ProfilePage() {
  const router = useRouter();

  // `login` is reused to refresh the stored user after the username changes.
  const { user, login, token } = useContext(AuthContext);

  // A single state object backs both forms on this page.
  const [formData, setFormData] = useState({
    username: user?.username || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswords = () => {
    if (formData.new_password !== formData.confirm_password) {
      return "The new passwords do not match.";
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
      setMessage(`Username updated to: ${updatedUser.username}`);
    } catch (err) {
      console.error("Failed to update the username", err);
      setError(getErrorMessage(err, "Could not update the username. Please try again."));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

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
      setMessage("Password updated successfully.");

      // Clear only the password fields so the username stays as typed.
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (err) {
      console.error("Failed to update the password", err);
      setError(getErrorMessage(err, "Could not update the password. Please try again."));
    }
  };

  return (
    <div className="card auth-card">
      <h1 className="auth-title">Profile</h1>
      {error && <p className="error-text mb-1">{error}</p>}
      {message && <p className="success-text mb-1">{message}</p>}

      <form onSubmit={handleNameSubmit}>
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
        <button type="submit" className="btn w-100 mt-1">
          Update username
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-2">
        <div className="form-group">
          <label htmlFor="current_password">Current password</label>
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
          <label htmlFor="new_password">New password</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
          />
          <small className="help-text">
            The password must be at least 8 characters long and include a number, an uppercase
            letter and a lowercase letter.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="confirm_password">Confirm new password</label>
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
          Update password
        </button>
      </form>

      <button onClick={() => router.push("/dashboard")} className="btn btn-secondary w-100 mt-1">
        Back to dashboard
      </button>
    </div>
  );
}
