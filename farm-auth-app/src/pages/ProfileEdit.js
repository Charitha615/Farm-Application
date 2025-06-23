import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import '../css/Profile.css';

const ProfileEdit = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost/firebase-auth/api/farmers/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setProfile({
          full_name: response.data.full_name,
          phone: response.data.phone,
          address: response.data.address,
          language: response.data.language
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost/firebase-auth/api/farmers/profile', profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) return <div className="profile-container loading">Loading profile...</div>;
  if (error) return <div className="profile-container error">Error: {error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1><FaUser /> Edit Profile</h1>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="full_name">Full Name</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            name="language"
            value={profile.language}
            onChange={handleChange}
          >
            <option value="en">English</option>
            <option value="si">Sinhala</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            <FaSave /> Save Changes
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;