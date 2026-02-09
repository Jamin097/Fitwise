import React, { useEffect, useState } from "react";

export default function PersonalPlan() {
  const [user, setUser] = useState(null);
  const [goal, setGoal] = useState("");
  const [planType, setPlanType] = useState("");
  const [planName, setPlanName] = useState("");
  const [message, setMessage] = useState("");




  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchGoal(storedUser.user_id);
    }
  }, []);

  const fetchGoal = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/get-goal/${userId}`);
      const data = await res.json();
      setGoal(data.goal_type);
    } catch {
      setGoal("general fitness");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/create-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          plan_type: planType,
          plan_name: planName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      setMessage("✅ Plan created successfully");
    } catch {
      setMessage("⚠️ Server error");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create Personal Plan</h2>

      <p><strong>Goal:</strong> {goal}</p>
      <p><strong>Age:</strong> {user.age}</p>
      <p><strong>Gender:</strong> {user.gender}</p>
      <p><strong>Height:</strong> {user.height_cm} cm</p>
      <p><strong>Weight:</strong> {user.weight_kg} kg</p>

      <form onSubmit={handleSubmit}>
        <label>
          Plan Name
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            required
          />
        </label>

        <br /><br />

        <label>
          Plan Type
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            required
          >
            <option value="">Select</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </select>
        </label>

        <br /><br />

        <button type="submit">Create Plan</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
