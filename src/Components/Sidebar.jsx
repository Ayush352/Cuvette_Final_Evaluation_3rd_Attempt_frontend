import React from 'react';
import { LayoutDashboard, BarChart2, Settings, LogOut, Box } from 'lucide-react';
import './Sidebar.css';  
import { useNavigate, useLocation  } from 'react-router-dom';
import databaseIcon from "../images/database.png"
import settingsIcon from "../images/settings.png"
import layoutIcon from "../images/layout.png"
import codeIcon from "../images/codesandbox.png"

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate("/login")
    }

    const isActive = (path) => {
      return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
      <img
              src={codeIcon}
              sizes={20}
              />
        <h1 className="sidebar-title">Pro Manage</h1>
      </div>

      <nav className="nav-menu">
        <ul className="nav-list">
          <li>
            <a href="#" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
            >
              <img
              src={layoutIcon}
              sizes={20}
              />
              <span className="nav-item-text">Board</span>
            </a>
          </li>
          <li>
            <a href="#" className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
            onClick={() => navigate('/analytics')}
            >
              <img
              src={databaseIcon}
              sizes={20}
              />
              <span className="nav-item-text">Analytics</span>
            </a>
          </li>
          <li>
            <a href="#" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
            >
            <img
              src={settingsIcon}
              sizes={20}
              />
              <span className="nav-item-text">Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;