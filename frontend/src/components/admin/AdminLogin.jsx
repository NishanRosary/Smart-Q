import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import "../../styles/admin.css";
import "../../styles/global.css";
import { loginAdmin, setAuthToken } from "../../services/api";

const AdminLogin = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await loginAdmin(
        formData.email,
        formData.password
      );

      // 🔥 STORE TOKEN IN LOCALSTORAGE
      localStorage.setItem("token", data.accessToken);

      // 🔥 SET AXIOS DEFAULT HEADER
      setAuthToken(data.accessToken);

      // Navigate to dashboard
      onNavigate("admin-dashboard");

    } catch (error) {
      console.error("Login failed:", error);
      const msg = error.response?.data?.message || "Login failed. Ensure Server is running";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
        padding: "2rem"
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "3rem 2.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.75rem",
              color: "var(--color-gray-900)",
              marginBottom: "0.5rem",
              fontWeight: 800
            }}
          >
            Admin Portal
          </h2>
          <p
            style={{
              color: "var(--color-gray-500)",
              fontSize: "0.9375rem"
            }}
          >
            Restricted access for authorized personnel
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter Admin Email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              required
            />
          </div>

          {errorMessage && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "1rem",
              padding: "0.875rem",
              backgroundColor: "var(--color-primary)",
              fontSize: "1rem"
            }}
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--color-gray-200)"
          }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("landing");
            }}
            style={{
              fontSize: "0.875rem",
              color: "var(--color-gray-500)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <ArrowLeft size={16} /> Return to Public Site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
