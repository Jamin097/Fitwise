import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

import feedbackData from "./feedback.json"; // NEW
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]); // NEW
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
  });

  const [activePlan, setActivePlan] = useState(null);

  // -----------------------------
  // AUTH CHECK
  // -----------------------------
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) navigate("/login");
  }, [navigate]);

  // -----------------------------
  // LOAD DATA BASED ON TAB
  // -----------------------------
  useEffect(() => {
    setLoading(true);
    if (activeTab === "dashboard") {
      setLoading(false);
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "plans") {
      fetchPlans();
    } else if (activeTab === "feedback") {
      setFeedbacks(feedbackData); // Load feedbacks from JSON
      setLoading(false);
    }
  }, [activeTab]);

  // -----------------------------
  // FETCH USERS & PLANS
  // -----------------------------
  const fetchUsers = () => {
    fetch("http://127.0.0.1:5000/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchPlans = () => {
    fetch("http://127.0.0.1:5000/admin/plans")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // -----------------------------
  // ADD USER
  // -----------------------------
  const addUser = async () => {
    const { name, email, password, age, gender, height_cm, weight_kg } =
      newUser;
    if (!name || !email || !password) {
      setMessage("⚠️ Name, email, and password are required");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/admin/add_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          age: age || null,
          gender: gender || null,
          height_cm: height_cm || null,
          weight_kg: weight_kg || null,
          limitations: { max_searches: 0 },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${data.error || "Failed to add user"}`);
        return;
      }

      setMessage("✅ User added successfully");
      setNewUser({
        name: "",
        email: "",
        password: "",
        age: "",
        gender: "",
        height_cm: "",
        weight_kg: "",
      });
      fetchUsers();
    } catch {
      setMessage("❌ Server error");
    }
  };

  // -----------------------------
  // DELETE USER
  // -----------------------------
  const deleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    fetch(`http://127.0.0.1:5000/admin/user/${id}`, { method: "DELETE" })
      .then(() => {
        setMessage("🗑 User deleted");
        setUsers(users.filter((u) => u.user_id !== id));
      })
      .catch(() => setMessage("❌ Delete failed"));
  };

  // -----------------------------
  // DELETE PLAN
  // -----------------------------
  const deletePlan = (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    fetch(`http://127.0.0.1:5000/admin/plan/${id}`, { method: "DELETE" })
      .then(() => {
        setMessage("🗑 Plan deleted");
        setPlans(plans.filter((p) => p.id !== id));
      })
      .catch(() => setMessage("❌ Delete failed"));
  };

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage your fitness platform</p>
        </div>
        <div className="header-right">
          <div className="admin-info">
            <div className="admin-avatar">A</div>
            <span>Admin</span>
          </div>
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem("isAdmin");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {message && <p className="msg">{message}</p>}

      <div className="admin-layout">
        <nav className="admin-sidebar">
          <ul className="sidebar-nav">
            <li>
              <button
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => setActiveTab("dashboard")}
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button
                className={activeTab === "users" ? "active" : ""}
                onClick={() => setActiveTab("users")}
              >
                👥 Users
              </button>
            </li>
            <li>
              <button
                className={activeTab === "plans" ? "active" : ""}
                onClick={() => setActiveTab("plans")}
              >
                📋 Plans
              </button>
            </li>
            <li>
              <button
                className={activeTab === "feedback" ? "active" : ""}
                onClick={() => setActiveTab("feedback")}
              >
                💬 Feedback
              </button>
            </li>
          </ul>
        </nav>

        <main className="admin-content">
          {loading && <p className="loading">Loading...</p>}

          {/* ---------------- Dashboard ---------------- */}
          {!loading && activeTab === "dashboard" && (
            <div className="admin-dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <h3>Total Users</h3>
                  <div className="stat-number">{users.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <h3>Total Plans</h3>
                  <div className="stat-number">{plans.length}</div>
                </div>
              </div>

              <div className="charts-grid">
                {/* User Gender Pie Chart */}
                <div className="chart-card">
                  <h4>User Gender Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Male",
                            value: users.filter(
                              (u) => u.gender?.trim().toLowerCase() === "male"
                            ).length,
                          },
                          {
                            name: "Female",
                            value: users.filter(
                              (u) => u.gender?.trim().toLowerCase() === "female"
                            ).length,
                          },
                          {
                            name: "Other",
                            value: users.filter((u) => {
                              const g = u.gender?.trim().toLowerCase();
                              return g !== "male" && g !== "female";
                            }).length,
                          },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        <Cell fill="#0088FE" />
                        <Cell fill="#FF8042" />
                        <Cell fill="#00C49F" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Plans by Goal Bar Chart */}
                <div className="chart-card">
                  <h4>Plans by Goal</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        {
                          goal: "weight loss",
                          count: plans.filter((p) => p.goal === "weight loss")
                            .length,
                        },
                        {
                          goal: "muscle gain",
                          count: plans.filter((p) => p.goal === "muscle gain")
                            .length,
                        },
                        {
                          goal: "general fitness",
                          count: plans.filter(
                            (p) => p.goal === "general fitness"
                          ).length,
                        },
                      ]}
                    >
                      <XAxis dataKey="goal" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- Users ---------------- */}
          {!loading && activeTab === "users" && (
            <div className="management-section">
              <h2>User Management</h2>
              <div className="add-user-form">
                <input
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
                <input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <input
                  placeholder="Age"
                  type="number"
                  value={newUser.age}
                  onChange={(e) =>
                    setNewUser({ ...newUser, age: e.target.value })
                  }
                />
                <input
                  placeholder="Gender"
                  value={newUser.gender}
                  onChange={(e) =>
                    setNewUser({ ...newUser, gender: e.target.value })
                  }
                />
                <input
                  placeholder="Height (cm)"
                  type="number"
                  value={newUser.height_cm}
                  onChange={(e) =>
                    setNewUser({ ...newUser, height_cm: e.target.value })
                  }
                />
                <input
                  placeholder="Weight (kg)"
                  type="number"
                  value={newUser.weight_kg}
                  onChange={(e) =>
                    setNewUser({ ...newUser, weight_kg: e.target.value })
                  }
                />
                <button onClick={addUser}>➕ Add User</button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Height</th>
                      <th>Weight</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.age}</td>
                        <td>{u.gender}</td>
                        <td>{u.height_cm}</td>
                        <td>{u.weight_kg}</td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() => deleteUser(u.user_id)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- Plans ---------------- */}
          {!loading && activeTab === "plans" && (
            <div className="management-section">
              <h2>Plans Management</h2>
              <div className="cards-grid">
                {plans.map((plan) => (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-header">
                      <div className="plan-avatar">{plan.name[0]}</div>
                      <div className="plan-info">
                        <h4>{plan.name}</h4>
                        <span className="plan-goal">{plan.goal}</span>
                      </div>
                    </div>
                    <div className="plan-timestamp">
                      Created at: {new Date(plan.created_at).toLocaleString()}
                    </div>
                    <div className="plan-actions">
                      <button
                        className="btn-view-plan"
                        onClick={() => setActivePlan(plan.plan)}
                      >
                        👁️ View Plan
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deletePlan(plan.id)}
                      >
                        🗑 Delete Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- Feedback ---------------- */}
          {!loading && activeTab === "feedback" && (
            <div className="management-section">
              <h2>Feedbacks</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Rating</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((f) => (
                      <tr key={f.feedback_id}>
                        <td>{f.user_name}</td>
                        <td>{f.email}</td>
                        <td>{f.message}</td>
                        <td>{f.rating}</td>
                        <td>{new Date(f.submitted_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- Plan Modal ---------------- */}
          {activePlan && (
            <div className="plan-modal">
              <div className="plan-modal-content">
                <button
                  className="close-modal"
                  onClick={() => setActivePlan(null)}
                >
                  ✖
                </button>
                <div className="plan-content">
                  {/* Plan details same as before */}
                  {/* Omitted for brevity */}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
