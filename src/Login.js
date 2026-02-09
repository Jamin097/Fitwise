// src/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loginMode, setLoginMode] = useState("user"); // user | admin | db
  const navigate = useNavigate();

  // Hardcoded credentials
  const ADMIN = { email: "admin@fitwise.com", password: "admin123" };
  const DB_MANAGER = { email: "dbmanager@gmail.com", password: "db123" };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------
    // 🔑 ADMIN LOGIN (HARDCODED)
    // -----------------------------
    if (loginMode === "admin") {
      if (form.email === ADMIN.email && form.password === ADMIN.password) {
        localStorage.setItem("isAdmin", "true");
        setUser("Super Admin");
        setMessage("✅ Admin logged in!");
        navigate("/admin");
      } else {
        setMessage("❌ Invalid admin credentials!");
      }
      return;
    }

    // -----------------------------
    // 🛠 DB MANAGER LOGIN
    // -----------------------------
    if (loginMode === "db") {
      if (form.email === DB_MANAGER.email && form.password === DB_MANAGER.password) {
        localStorage.removeItem("isAdmin");
        localStorage.setItem("isDBManager", "true");
        setUser("DB Manager");
        setMessage("✅ DB Manager logged in!");
        navigate("/db-manager");
      } else {
        setMessage("❌ Invalid DB Manager credentials!");
      }
      return;
    }

    // -----------------------------
    // 👤 USER LOGIN (FROM BACKEND)
    // -----------------------------
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "❌ Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      setUser(data.name);
      setMessage("✅ Logged in successfully!");
      setTimeout(() => navigate("/"), 1000);

    } catch (err) {
      console.error("User login fetch error:", err);
      setMessage("⚠️ Server error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>
          {loginMode === "user" && "User Login"}
          {loginMode === "admin" && "Admin Login"}
          {loginMode === "db" && "DB Manager Login"}
        </h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" className="auth-btn">Login</button>
        </form>

        {message && (
          <p style={{ color: message.includes("❌") ? "red" : "lime" }}>
            {message}
          </p>
        )}

        {/* 🔁 MODE SWITCHES */}
        {loginMode !== "user" && (
          <p
            className="switch-auth"
            style={{ cursor: "pointer" }}
            onClick={() => { setLoginMode("user"); setMessage(""); }}
          >
            Login as User
          </p>
        )}

        {loginMode !== "admin" && (
          <p
            className="switch-auth"
            style={{ cursor: "pointer" }}
            onClick={() => { setLoginMode("admin"); setMessage(""); }}
          >
            Login as Admin
          </p>
        )}

        {loginMode === "admin" && (
          <p
            className="switch-auth"
            style={{ cursor: "pointer" }}
            onClick={() => { setLoginMode("db"); setMessage(""); }}
          >
            Login as DB Manager
          </p>
        )}

        {loginMode === "user" && (
          <p className="switch-auth">
            Don’t have an account? <Link to="/signup">Signup</Link>
          </p>
        )}
      </div>
    </div>
  );
}
