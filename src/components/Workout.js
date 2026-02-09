import React, { useEffect, useState } from "react";
import "./styles/Workout.css";

export default function Workout() {
  const [user, setUser] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setHeight(storedUser.height_cm || "");
      setWeight(storedUser.weight_kg || "");
      setGoal(storedUser.goal || "");
    }
  }, []);

  if (!user) {
    return (
      <div className="workout-container">
        <h1>Loading your fitness profile…</h1>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          height_cm: height,
          weight_kg: weight,
          goal: goal,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Update failed");
        return;
      }

      const updatedUser = {
        ...user,
        height_cm: height,
        weight_kg: weight,
        goal: goal,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage("✅ Profile updated successfully");
    } catch {
      setMessage("⚠️ Server error. Please try again.");
    }
  };

  return (
    <div className="workout-container">
      {/* HERO */}
      <div className="workout-hero">
        <div className="hero-title-badge">
          <h1>Edit Your Fitness Profile</h1>
        </div>

        <div className="hero-subtext">
          <p>
            Keep your stats updated so FitWise can generate smarter workouts,
            better progress tracking, and personalized recommendations.
          </p>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <div className="workout-highlights">
        <div className="highlight-card">
          <span>🏋️</span>
          <h3>Personalized Training</h3>
          <p>Your workouts adapt based on your height, weight, and goals.</p>
        </div>

        <div className="highlight-card">
          <span>📈</span>
          <h3>Accurate Progress</h3>
          <p>Updated data helps track improvements more precisely.</p>
        </div>

        <div className="highlight-card">
          <span>⚡</span>
          <h3>Smarter AI</h3>
          <p>The more accurate your profile, the better the AI performs.</p>
        </div>
      </div>

      {/* FORM */}
      <form className="user-info" onSubmit={handleUpdate}>
        <h2 className="user-info-title">Your Details</h2>

        <div className="user-fields">
          <label>
            Height (cm)
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </label>

          <label>
            Weight (kg)
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </label>

          <label>
            Fitness Goal
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            >
              <option value="">Select goal</option>
              <option value="weight loss">Weight Loss</option>
              <option value="muscle gain">Muscle Gain</option>
              <option value="general fitness">General Fitness</option>
            </select>
          </label>
        </div>

        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}

      {/* FOOTER */}
      <div className="workout-footer">
        <div className="footer-motivation-badge">
          <p>💪 Small updates lead to big results. Stay consistent, stay strong.</p>
        </div>
      </div>
    </div>
  );
}
