import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignInAlt, FaExclamationCircle, FaSpinner, FaUserShield } from 'react-icons/fa';
import '../../css/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. Check for hardcoded admin credentials (NO API CALL)
    if (email === 'admin@admin' && password === 'admin') {
      setIsLoading(false);
      navigate('/admin/dashboard');
      return; // Exit early, no API call
    }

    // 2. Check for hardcoded inspector credentials (NO API CALL)
    if (email === 'inspector@inspector' && password === 'inspector') {
      setIsLoading(false);
      navigate('/inspector/dashboard');
      return; // Exit early, no API call
    }

    // 3. Only call the API for normal users (not hardcoded accounts)
    try {
      await login(email, password); // This is your AuthContext login function
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <FaUserShield />
          </div>
          <h2>Welcome to FarmConnect</h2>
          <p>Manage your agricultural operations with ease</p>
        </div>

        {error && (
          <div className="login-error">
            <FaExclamationCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={error ? 'input-error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={error ? 'input-error' : ''}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <FaSignInAlt />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="footer-links">
            <Link to="/register">Create an account</Link>
            <span>•</span>
            <Link to="/forgot-password">Reset password</Link>
          </div>
          <div className="footer-text">
            <p>By continuing, you agree to our <Link to="/terms">Terms of Service</Link></p>
          </div>
        </div>
      </div>

      <div className="login-background">
        <div className="background-overlay"></div>
      </div>
    </div>
  );
};

export default Login;