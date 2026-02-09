import React, { useState } from "react";
import "./AboutUs.css";

export default function AboutUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.feedback) {
      setMessage("⚠️ All fields are required.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage("✅ Feedback submitted successfully!");
        setFormData({ name: "", email: "", feedback: "" });
      } else {
        setMessage("⚠️ Failed to submit feedback");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error submitting feedback");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="aboutus-container">
      <div className="aboutus-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>About FitWise</h1>
            <p className="hero-subtitle">
              FitWise helps you track progress, stay disciplined, and build a
              healthier lifestyle with clarity and consistency.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💪</div>
            <h3>Smart Tracking</h3>
            <p>Monitor workouts, body stats, and growth effortlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Focused</h3>
            <p>See real results through structured and meaningful data.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Discipline First</h3>
            <p>Designed for people who value consistency over shortcuts.</p>
          </div>
        </section>

        {/* Feedback */}
        <section className="feedback-section">
          <h2>We Value Your Feedback</h2>
          <p className="section-subtitle">
            Help us improve FitWise by sharing your thoughts.
          </p>

          {message && <p className="submit-message">{message}</p>}

          <form className="feedback-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
            />
            <textarea
              rows="4"
              name="feedback"
              placeholder="Your Feedback"
              value={formData.feedback}
              onChange={handleChange}
            ></textarea>
            <button type="submit" className="submit-btn">
              Submit Feedback
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
