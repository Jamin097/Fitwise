import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./signup.css";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    height: "",
    weight: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          age: Number(form.age),
          gender: form.gender,
          height_cm: Number(form.height),
          weight_kg: Number(form.weight)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      setMessage("🎉 Signup successful! Please login now.");
      setTimeout(() => navigate("/login"), 1000);

    } catch (err) {
      console.error("Signup error:", err);
      setMessage("⚠️ Backend error. Check Flask terminal.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Glow effect
  useEffect(() => {
    const card = document.querySelector(".auth-card");
    const container = document.querySelector(".auth-container");

    const handleMouseMove = (e) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      const moveX = ((x / width) - 0.5) * 50;
      const moveY = ((y / height) - 0.5) * 50;

      card.style.boxShadow = `
        ${moveX}px ${moveY}px 30px rgba(0, 0, 0, 0.2),
        0 0 60px rgba(69, 162, 71, 0.9),
        0 0 120px rgba(93, 255, 182, 0.7)
      `;
    };

    const resetGlow = () => {
      card.style.boxShadow = `
        0 8px 25px rgba(0, 0, 0, 0.2),
        0 0 40px rgba(69, 162, 71, 0.8),
        0 0 80px rgba(93, 255, 182, 0.6)
      `;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", resetGlow);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", resetGlow);
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

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

          <input
            type="number"
            placeholder="Age"
            required
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <select
            required
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="number"
            placeholder="Height (cm)"
            required
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            required
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        {message && <p style={{ marginTop: "10px", color: "lime" }}>{message}</p>}

        <p className="switch-auth">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
