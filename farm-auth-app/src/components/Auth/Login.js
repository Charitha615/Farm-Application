import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignInAlt, FaExclamationCircle, FaSpinner, FaUserShield, FaUserTie, FaUser } from 'react-icons/fa';
import '../../css/Login.css';

const Login = () => {
  const [userType, setUserType] = useState('farmer'); // 'farmer' or 'inspector'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      return;
    }

    // 2. Check for hardcoded inspector credentials (NO API CALL)
    if (email === 'inspector@inspector' && password === 'inspector') {
      setIsLoading(false);
      navigate('/inspector/dashboard');
      return;
    }

    if (userType === 'inspector') {
      // Inspector login API call
      try {
        const response = await fetch('http://localhost/firebase-auth/api/inspectors/login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            phone: phone
          })
        });

        const data = await response.json();

        if (data.exists) {
          // Store inspector data in local storage or context
          localStorage.setItem('inspector', JSON.stringify(data.user));
          navigate('/inspector/dashboard');
        } else {
          setError('Inspector not found. Please check your credentials.');
        }
      } catch (err) {
        setError('Failed to connect to the server. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Farmer login (existing AuthContext login)
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            {userType === 'inspector' ? <FaUserTie /> : <FaUser />}
          </div>
          <h2>Welcome to FarmConnect</h2>
          <p>Manage your agricultural operations with ease</p>
          
          <div className="user-type-selector">
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value)}
              className="user-type-dropdown"
            >
              <option value="farmer">Farmer</option>
              <option value="inspector">Inspector</option>
            </select>
          </div>
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

          {userType === 'inspector' ? (
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
                className={error ? 'input-error' : ''}
              />
            </div>
          ) : (
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
          )}

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
            {userType === 'farmer' && (
              <>
                <Link to="/register">Create an account</Link>
                <span>•</span>
              </>
            )}
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