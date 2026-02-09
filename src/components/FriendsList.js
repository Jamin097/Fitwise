import React, { useState } from "react";
import usersData from "./users.json";
import "./styles/FriendsList.css";

const avatarColors = [
  "#45a247",
  "#019c7f",
  "#283c86",
  "#ff9f43",
  "#5f27cd",
  "#ee5253"
];

const getColor = (id = 0) => avatarColors[id % avatarColors.length];

export default function FriendsList() {
  const [activeTab, setActiveTab] = useState("active");
  const [showAll, setShowAll] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // store clicked user

  const users = usersData.users || [];

  const activeUsers = users.filter(u => u.gender?.toLowerCase() === "male");
  const inactiveUsers = users.filter(u => u.gender?.toLowerCase() === "female");

  const listToRender = showAll
    ? users
    : activeTab === "active"
    ? activeUsers
    : inactiveUsers;

  return (
    <div className="friends-list">
      {/* Header */}
      <div className="header-section">
        <h2>👥 Friends</h2>
        <button
          className="view-all-button"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : "View All"}
        </button>
      </div>

      {/* Tabs */}
      {!showAll && (
        <div className="activity-tabs">
          <button
            className={activeTab === "active" ? "active" : ""}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={activeTab === "inactive" ? "active" : ""}
            onClick={() => setActiveTab("inactive")}
          >
            Inactive
          </button>
        </div>
      )}

      {/* Friends List */}
      <ul>
        {listToRender.map(user => (
          <li 
            key={user.user_id} 
            onClick={() => setSelectedUser(user)} 
            style={{ cursor: 'pointer' }}
          >
            <div
              className="friend-image default-icon"
              style={{ backgroundColor: getColor(user.user_id) }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
              </svg>
            </div>

            <div className="friend-info">
              <span className="friend-name">{user.name}</span>
              <span>{user.email}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Popup / Profile */}
{/* Selected User Info Card */}
{selectedUser && (
  <div className="selected-user-card">
    {/* Close Button */}
    <div className="card-header">
      <button className="close-btn" onClick={() => setSelectedUser(null)}>✖</button>
    </div>

    {/* Friend Info */}
    <div className="friend-info">
      <strong>{selectedUser.name}</strong>
      <span>{selectedUser.email}</span>
      <span>Age: {selectedUser.age}</span>
      <span>Height: {selectedUser.height_cm} cm</span>
      <span>Weight: {selectedUser.weight_kg} kg</span>
    </div>
  </div>
)}

    </div>
  );
}
