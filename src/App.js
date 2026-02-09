import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import DBManager from "./components/DBManager";
import AboutUs from "./components/AboutUs"; 
import FriendsList from "./components/FriendsList";

import Login from "./Login";
import Signup from "./Signup";
import AdminPanel from "./components/AdminPanel";

import "./signup.css";
import "./login.css";

// Dashboard wrapper
function Dashboard({ onLogout }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
       
        <Overview />
      </div>
      <FriendsList /> {/* Only in Dashboard */}
    </div>
  );
}

// AboutUs wrapper
function AboutUsPage() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
       
        <AboutUs />
      </div>
      {/* FriendsList hidden for AboutUs */}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  // Restore user on refresh
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser.username);
  }, []);

  return (
    <Router>
      <Routes>
        {/* USER DASHBOARD */}
        <Route
          path="/"
          element={
            user ? (
              <Dashboard onLogout={() => setUser(null)} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* AUTH ROUTES */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* ADMIN ROUTE */}
        <Route
          path="/admin"
          element={
            localStorage.getItem("isAdmin") ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* DB MANAGER */}
        <Route
          path="/db-manager"
          element={
            localStorage.getItem("isDBManager") ? (
              <DBManager />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ABOUT US */}
        <Route path="/about-us" element={<AboutUsPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
