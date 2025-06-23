import React, { useState } from 'react';
import { register } from '../../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaExclamationCircle, FaCheckCircle, FaSpinner, FaUserEdit } from 'react-icons/fa';
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
            <FaUserEdit />
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
            
            <div className="form-group">
              <label htmlFor="nic">NIC Number</label>
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
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
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
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
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
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              className={error && !formData.password ? 'input-error' : ''}
            />
            <small className="password-hint">Minimum 8 characters with at least one number</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
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
          
          <div className="form-group">
            <label htmlFor="language">Preferred Language</label>
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
      
      <div className="register-background">
        <div className="background-overlay"></div>
      </div>
    </div>
  );
};

export default Register;