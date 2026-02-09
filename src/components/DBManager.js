import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DBManager.css";

import usersData from "./users.json";
import plansData from "./plans.json";
import StatsCharts from "./StatsCharts";

export default function DBManager() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchPlan, setSearchPlan] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
  });

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    localStorage.removeItem("isDBManager");
    navigate("/login");
  };

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem("users");
      const storedPlans = localStorage.getItem("plans");

      const usersFinal = storedUsers
        ? JSON.parse(storedUsers)
        : usersData.users;
      const plansFinal = storedPlans
        ? JSON.parse(storedPlans)
        : plansData.plans;

      setUsers(usersFinal);
      setPlans(plansFinal);

      localStorage.setItem("users", JSON.stringify(usersFinal));
      localStorage.setItem("plans", JSON.stringify(plansFinal));
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Failed to load local data");
      setTimeout(() => setMessage(""), 3000);
    }
  }, []);

  // -----------------------------
  // ADD USER
  // -----------------------------
  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage("⚠️ Name, Email, Password required");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const entry = { user_id: Date.now(), ...newUser };
    const updated = [...users, entry];
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));

    setNewUser({
      name: "",
      email: "",
      password: "",
      age: "",
      gender: "",
      height_cm: "",
      weight_kg: "",
    });
    setMessage("✅ User added");
    setTimeout(() => setMessage(""), 3000);
  };

  // -----------------------------
  // DELETE USER / PLAN
  // -----------------------------
  const deleteUser = (id) => {
    const updated = users.filter((u) => u.user_id !== id);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
    setMessage("🗑 User deleted");
    setTimeout(() => setMessage(""), 3000);
  };

  const deletePlan = (id) => {
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    localStorage.setItem("plans", JSON.stringify(updated));
    setMessage("🗑 Plan deleted");
    setTimeout(() => setMessage(""), 3000);
  };

  // -----------------------------
  // FILTERS
  // -----------------------------
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const filteredPlans = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(searchPlan.toLowerCase()) ||
      p.goal.toLowerCase().includes(searchPlan.toLowerCase()),
  );

  return (
    <div className="db-manager">
      {/* HEADER */}
      <div className="header-pill">DB Manager Panel</div>

      {message && <p className="msg">{message}</p>}

      {/* CHARTS */}
      {users.length > 0 && plans.length > 0 && (
        <StatsCharts users={users} plans={plans} />
      )}

      {/* ADD USER */}
      <div className="card">
        
        <input
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <input
          placeholder="Age"
          value={newUser.age}
          onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
        />
        <input
          placeholder="Gender"
          value={newUser.gender}
          onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
        />
        <button onClick={addUser}>➕ Add User</button>
      </div>

      {/* USERS TABLE */}
      <div className="table-wrapper">
      
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <button
                    className="danger"
                    onClick={() => deleteUser(u.user_id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PLANS TABLE */}
      <div className="table-wrapper">
       
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Goal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.goal}</td>
                <td>
                  <button className="danger" onClick={() => deletePlan(p.id)}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
