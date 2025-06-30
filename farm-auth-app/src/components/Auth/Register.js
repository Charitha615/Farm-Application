import React, { useState } from 'react';
import { register } from '../../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaExclamationCircle, FaCheckCircle, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../css/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    nic: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    language: 'en'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">
            <FaUserPlus size={28} />
          </div>
          <h2>Join FarmConnect</h2>
          <p>Create your account to manage your farm operations</p>
        </div>
        
        {error && (
          <div className="register-error">
            <FaExclamationCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="register-success">
            <FaCheckCircle className="success-icon" />
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className={error && !formData.full_name ? 'input-error' : ''}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="nic">NIC Number</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="nic"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="Enter your NIC number"
                  required
                  className={error && !formData.nic ? 'input-error' : ''}
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={error && !formData.email ? 'input-error' : ''}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className={error && !formData.phone ? 'input-error' : ''}
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className={error && !formData.password ? 'input-error' : ''}
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
            <small className="password-hint">Minimum 8 characters with at least one number</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <div className="input-with-icon">
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
                required
                className={error && !formData.address ? 'input-error' : ''}
              ></textarea>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="language">Preferred Language</label>
            <div className="select-wrapper">
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="language-select"
              >
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Register</span>
              </>
            )}
          </button>
        </form>
        
        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="terms-text">By registering, you agree to our <Link to="/terms">Terms of Service</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;