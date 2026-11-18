
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import AuthBackground from "../components/AuthBackground";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Registration success information
  const registrationMessage = location.state?.message;
  const registeredEmail = location.state?.email;

  const [formData, setFormData] = useState({
    email: registeredEmail || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <AuthBackground />

      <motion.section
        className="auth-card"
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="auth-heading">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h2>Sign in to LinkLite</h2>

            <p>
              Your links are waiting. Sign in to continue
              managing your digital world.
            </p>
          </motion.div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {registrationMessage && (
            <motion.div
              className="auth-message auth-success"
              role="status"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {registrationMessage}
            </motion.div>
          )}

          <motion.div
            className="auth-field"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="login-email">Email address</label>

            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉</span>

              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </motion.div>

          <motion.div
            className="auth-field"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="login-password">Password</label>

            <div className="auth-input-wrap">
              <span className="auth-input-icon">♙</span>

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              className="auth-message auth-error"
              role="alert"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            className="auth-submit"
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {loading ? (
              <>
                <span className="auth-spinner" />
                Signing you in...
              </>
            ) : (
              <>
                Sign in to your account
                <span>→</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-divider">
          <span>YOUR LINKS. YOUR SPACE.</span>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create account</Link>
        </p>

        <p className="auth-security">
          <span>✦</span> Secure authentication powered by LinkLite
        </p>
      </motion.section>
    </main>
  );
}
