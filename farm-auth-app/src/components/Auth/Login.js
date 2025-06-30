import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignInAlt, FaExclamationCircle, FaSpinner, FaUserTie, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../css/Login.css';

const Login = () => {
  const [userType, setUserType] = useState('farmer'); // 'farmer' or 'inspector'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. Check for hardcoded admin credentials
    if (email === 'admin@admin' && password === 'admin') {
      setIsLoading(false);
      navigate('/admin/dashboard');
      return;
    }

    // 2. Check for hardcoded inspector credentials
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
      // Farmer login
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
            {userType === 'inspector' ? <FaUserTie size={28} /> : <FaUser size={28} />}
          </div>
          <h2>Welcome to FarmConnect</h2>
          <p>Manage your agricultural operations with ease</p>
          
          <div className="user-type-tabs">
            <button
              className={`tab ${userType === 'farmer' ? 'active' : ''}`}
              onClick={() => setUserType('farmer')}
            >
              <FaUser className="tab-icon" /> Farmer
            </button>
            <button
              className={`tab ${userType === 'inspector' ? 'active' : ''}`}
              onClick={() => setUserType('inspector')}
            >
              <FaUserTie className="tab-icon" /> Inspector
            </button>
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
            <div className="input-with-icon">
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
          </div>

          {userType === 'inspector' ? (
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
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
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={error ? 'input-error' : ''}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
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
                <span className="divider">•</span>
                {/* <Link to="/forgot-password">Forgot password?</Link> */}
              </>
            )}
          </div>
          <div className="footer-text">
            <p>By continuing, you agree to our <Link to="/terms">Terms of Service</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;