import React, { useState } from 'react';
import './styles/Sidebar.css';
import AboutUs from './AboutUs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faChartBar,
  faSignOutAlt,
  faInfoCircle,
  faEdit, // Added info circle icon
} from '@fortawesome/free-solid-svg-icons';

import PersonalPlan from './PersonalPlan';
import Workout from './Workout';

function Sidebar({ onLogout }) {
  const [activePage, setActivePage] = useState(null);

  const handleClick = (index) => {
    if (index === 1) {
      setActivePage('workout');
    } else if (index === 2) {
      setActivePage('personalPlan');
    } else if (index === 3) { // ✅ ADMIN HANDLER
      setActivePage('admin');
    } else if (index === 4) { // About Us
      setActivePage('about');
    } else if (index === 5) { // Logout (shifted from 4 to 5)
      localStorage.removeItem('user');
      setActivePage(null);
      if (onLogout) onLogout();
      window.location.reload();
    } else {
      setActivePage(null);
    }
  };

  return (
    <div className="sidebar-container" style={{ display: 'flex' }}>
      <div className="sidebar">
        <div className="logo">
          
        </div>
        <nav>
          <ul>
            <li onClick={() => handleClick(0)}>
              <FontAwesomeIcon icon={faHome} className="fa-icon" />
            </li>

            <li onClick={() => handleClick(1)}>
              <FontAwesomeIcon icon={faEdit} className="fa-icon" />
            </li>

            <li onClick={() => handleClick(2)}>
              <FontAwesomeIcon icon={faChartBar} className="fa-icon" />
            </li>

            {/* New About Us (i) icon */}
            <li onClick={() => handleClick(4)}>
              <FontAwesomeIcon icon={faInfoCircle} className="fa-icon" />
            </li>

            <li onClick={() => handleClick(5)}>
              <FontAwesomeIcon icon={faSignOutAlt} className="fa-icon" />
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="main-content" style={{ flex: 1, padding: '20px' }}>
        {activePage === 'personalPlan' && <PersonalPlan />}
        {activePage === 'workout' && <Workout />}
        {activePage === 'about' && <AboutUs/>}
      </div>
    </div>
  );
}

export default Sidebar;
