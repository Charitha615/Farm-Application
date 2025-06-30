import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaUser, FaSignOutAlt, FaUserPlus, FaHome, FaChartLine } from 'react-icons/fa';
import '../css/Layout.css';

const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="logo">
            <FaLeaf className="logo-icon" />
            <span className="logo-text">FarmConnect</span>
          </Link>
          
          <div className="nav-menu">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                >
                  <FaChartLine className="nav-icon" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="user-dropdown">
                  <div className="user-profile">
                    <div className="user-avatar">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="user-name">Hi, {user?.full_name?.split(' ')[0] || 'User'}</span>
                  </div>
                  <div className="dropdown-content">
                    <button onClick={handleLogout} className="dropdown-item">
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="register-button-top"
                >
                  <FaUserPlus className="button-icon" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-links">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;