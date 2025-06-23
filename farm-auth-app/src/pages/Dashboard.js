import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaHome,
  FaUser,
  FaLandmark,
  FaPlus,
  FaList,
  FaShieldAlt,
  FaBell,
  FaQuestionCircle,
  FaSignOutAlt
} from 'react-icons/fa';
import '../css/Dashboard.css';

const SimpleDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="simple-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Farm<span>Portal</span></h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <Link to="/dashboard">
                <FaHome className="nav-icon" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/profile">
                <FaUser className="nav-icon" />
                <span>Profile Management</span>
              </Link>
            </li>
            <li className="has-submenu">
              <div className="submenu-trigger">
                <FaLandmark className="nav-icon" />
                <span>Land Registrations</span>
              </div>
              <ul className="submenu">
                <li>
                  <Link to="/land/add">
                    <FaPlus className="nav-icon" />
                    <span>Add Land</span>
                  </Link>
                </li>
                <li>
                  <Link to="/lands">
                    <FaList className="nav-icon" />
                    <span>View Lands</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/insurance">
                <FaShieldAlt className="nav-icon" />
                <span>Insurance Management</span>
              </Link>
            </li>
            <li>
              <Link to="/notifications">
                <FaBell className="nav-icon" />
                <span>Notifications</span>
              </Link>
            </li>
            <li>
              <Link to="/support">
                <FaQuestionCircle className="nav-icon" />
                <span>Support</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>Dashboard Overview</h1>
          <div className="user-info">
            <span>Welcome, {user?.full_name || 'User'}</span>
            <div className="user-avatar">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>
        
        <div className="content">
          {/* Quick Stats */}
          <div className="stats-container">
            <div className="stat-card">
              <h3>12</h3>
              <p>Registered Lands</p>
            </div>
            <div className="stat-card">
              <h3>3</h3>
              <p>Active Insurances</p>
            </div>
            <div className="stat-card">
              <h3>5</h3>
              <p>New Notifications</p>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="activity-container">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <FaLandmark />
                </div>
                <div className="activity-content">
                  <p>New land registered - Plot No. 2456</p>
                  <small>2 hours ago</small>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FaShieldAlt />
                </div>
                <div className="activity-content">
                  <p>Insurance renewed for 5 acres</p>
                  <small>1 day ago</small>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FaUser />
                </div>
                <div className="activity-content">
                  <p>Profile information updated</p>
                  <small>3 days ago</small>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="actions-container">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/land/add" className="action-btn">
                <FaPlus />
                <span>Add Land</span>
              </Link>
              <Link to="/insurance" className="action-btn">
                <FaShieldAlt />
                <span>Manage Insurance</span>
              </Link>
              <Link to="/profile" className="action-btn">
                <FaUser />
                <span>Update Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;