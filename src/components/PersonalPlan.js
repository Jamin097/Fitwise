// PersonalPlan.js
import React, { useState } from "react";
import "./PersonalPlan.css";

export default function PersonalPlan() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "male",
    weight: "",
    height: "",
    goal: "weight loss",
    activity_level: "lightly active",
    experience: "beginner",
    diet_pref: "vegetarian",
    days_per_week: 4,
    preferred_time: "morning",
    health_conditions: ""
  });

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name || !form.age || !form.weight || !form.height) {
      setError("Please fill name, age, weight and height.");
      return false;
    }
    if (form.age <= 12) {
      setError("This tool is meant for teen/adult users (13+).");
      return false;
    }
    setError("");
    return true;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setPlan(null);

    // Build payload; convert days_per_week to integer
    const payload = {
      ...form,
      days_per_week: parseInt(form.days_per_week, 10),
      health_conditions: form.health_conditions ? form.health_conditions.split(",").map(s => s.trim()) : []
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/generate-plan", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      if (data.status !== "success") {
        setError("Failed to generate plan.");
      } else {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the backend. Is PersonalPlan.py running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personal-plan-container">
      <h2>Personal Plan Generator</h2>

      <form className="personal-plan-form" onSubmit={submit}>
        <div className="row">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
        </div>

        <div className="row">
          <select name="sex" value={form.sex} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input type="number" name="height" placeholder="Height (cm)" value={form.height} onChange={handleChange} required />
        </div>

        <div className="row">
          <input type="number" name="weight" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} required />
          <select name="goal" value={form.goal} onChange={handleChange}>
            <option value="weight loss">Weight Loss</option>
            <option value="muscle gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
            <option value="flexibility">Flexibility</option>
            <option value="general fitness">General Fitness</option>
          </select>
        </div>

        <div className="row">
          <select name="activity_level" value={form.activity_level} onChange={handleChange}>
            <option value="sedentary">Sedentary</option>
            <option value="lightly active">Lightly active</option>
            <option value="moderately active">Moderately active</option>
            <option value="very active">Very active</option>
            <option value="extra active">Extra active</option>
          </select>

          <select name="experience" value={form.experience} onChange={handleChange}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="row">
          <select name="diet_pref" value={form.diet_pref} onChange={handleChange}>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-vegetarian</option>
          </select>

          <input type="number" name="days_per_week" min="1" max="7" value={form.days_per_week} onChange={handleChange}  placeholder="Days per week"/>
        </div>

        <div className="row">
          <select name="preferred_time" value={form.preferred_time} onChange={handleChange}>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>

          <input name="health_conditions" placeholder="Health conditions (comma separated)" value={form.health_conditions} onChange={handleChange} />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary-btn">Generate Plan</button>
      </form>

      {loading && <p className="loading">Generating plan — this may take a few seconds...</p>}

      {plan && (
        <div className="plan-result">
          <h3>{plan.name} — {plan.goal.toUpperCase()}</h3>
          <p className="small">
            Age: {plan.age} • Sex: {plan.sex} • Weight: {plan.weight_kg} kg • Height: {plan.height_cm} cm • BMI: {plan.BMI ?? "N/A"}
          </p>

          <div className="summary-grid">
            <div className="card">
              <h4>Calories</h4>
              <p>TDEE: {plan.TDEE_kcal ?? "N/A"} kcal/day</p>
              <p>Target: {plan.calorie_target_kcal} kcal/day</p>
            </div>

            <div className="card">
              <h4>Schedule</h4>
              <p>Days/week: {plan.days_per_week}</p>
              <p>Preferred time: {plan.preferred_time}</p>
            </div>

            <div className="card">
              <h4>Habits</h4>
              <ul>{plan.habits.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </div>
          </div>

          <h4>Weekly Workouts</h4>
          <div className="week-grid">
            {plan.weekly_workouts.map((d, i) => (
              <div className="day-card" key={i}>
                <strong>{new Date(plan.weekly_meals[i].date).toLocaleDateString()}</strong>
                <p className="muted">{d.type === "workout" ? "Workout" : "Recovery"}</p>
                <p>{d.name}</p>
                <p className="muted">Duration: {d.duration_min} min • Intensity: {d.intensity}</p>
              </div>
            ))}
          </div>

          <h4>Daily Meals (sample)</h4>
          <div className="meals-grid">
            {plan.weekly_meals.map((day, idx) => (
              <div className="meal-card" key={idx}>
                <strong>{new Date(day.date).toLocaleDateString()}</strong>
                <ul>
                  {day.meals.map((m, i) => (
                    <li key={i}><span className="when">{m.when}:</span> {m.item} <span className="cal">({m.cal} kcal)</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h4>Progress Guidelines</h4>
          <ul className="guidelines">
            {Object.entries(plan.weekly_progress_guidelines).map(([k, v]) => <li key={k}>{v}</li>)}
          </ul>

          <p className="small muted">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
