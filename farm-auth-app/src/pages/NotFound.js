import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content animated">
        <i className="fas fa-exclamation-triangle" style={{ 
          fontSize: '5rem', 
          color: 'var(--warning-color)', 
          marginBottom: '1.5rem' 
        }}></i>
        <h1>404</h1>
        <h2>Oops! Page Not Found</h2>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <Link to="/" className="btn btn-primary">
          <i className="fas fa-home"></i>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;