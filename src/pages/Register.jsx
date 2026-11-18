
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import AuthBackground from "../components/AuthBackground";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function getPasswordStrength(password) {
    if (!password) return 0;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  }

  const strength = getPasswordStrength(formData.password);

  const strengthLabels = [
    "",
    "Very weak",
    "Weak",
    "Fair",
    "Strong",
    "Very strong",
  ];

  const strengthColors = [
    "transparent",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#10b981",
  ];

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password.length > 72) {
      setError("Password cannot exceed 72 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully! Please sign in.",
          email: formData.email.trim(),
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <AuthBackground />

      <motion.section
        className="auth-card register-card"
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="auth-heading">
          <span className="auth-eyebrow">
            YOUR JOURNEY STARTS HERE
          </span>

          <h2>Create your account</h2>

          <p>
            Join LinkLite and turn long URLs into
            simple, shareable links.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <motion.div
            className="auth-field"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="register-name">Full name</label>

            <div className="auth-input-wrap">
              <span className="auth-input-icon">♙</span>

              <input
                id="register-name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>
          </motion.div>

          <motion.div
            className="auth-field"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="register-email">Email address</label>

            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉</span>

              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                maxLength={150}
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
            <label htmlFor="register-password">Password</label>

            <div className="auth-input-wrap">
              <span className="auth-input-icon">♙</span>

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                maxLength={72}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {formData.password && (
              <div className="password-strength-wrap">
                <div className="password-strength">
                  <motion.span
                    animate={{
                      width: `${(strength / 5) * 100}%`,
                      backgroundColor: strengthColors[strength],
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <span className="strength-label">
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            className="auth-field"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="confirm-password">
              Confirm password
            </label>

            <div className="auth-input-wrap">
              <span className="auth-input-icon">♙</span>

              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
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
            transition={{ delay: 0.6 }}
          >
            {loading ? (
              <>
                <span className="auth-spinner" />
                Creating account...
              </>
            ) : (
              <>
                Create my account
                <span>→</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-divider">
          <span>START SHORTENING SMARTER</span>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>

        <p className="auth-security">
          <span>✦</span> Your account is protected by LinkLite
        </p>
      </motion.section>
    </main>
  );
}
