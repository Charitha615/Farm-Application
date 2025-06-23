import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaIdCard, FaPhone, FaMapMarkerAlt, FaGlobe, FaEdit, FaFileUpload } from 'react-icons/fa';
import axios from 'axios';
import '../css/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  if (loading) return <div className="profile-container loading">Loading profile...</div>;
  if (error) return <div className="profile-container error">Error: {error}</div>;
  if (!profile) return <div className="profile-container">No profile data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1><FaUser /> Profile Information</h1>
        <button onClick={handleEdit} className="edit-btn">
          <FaEdit /> Edit Profile
        </button>
      </div>

      <div className="profile-details">
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2>{profile.full_name}</h2>
          <p className="profile-role">{profile.role}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <div>
              <h3>Email</h3>
              <p>{profile.email}</p>
            </div>
          </div>

          <div className="info-item">
            <FaIdCard className="info-icon" />
            <div>
              <h3>NIC</h3>
              <p>{profile.nic}</p>
            </div>
          </div>

          <div className="info-item">
            <FaPhone className="info-icon" />
            <div>
              <h3>Phone</h3>
              <p>{profile.phone}</p>
            </div>
          </div>

          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <h3>Address</h3>
              <p>{profile.address}</p>
            </div>
          </div>

          <div className="info-item">
            <FaGlobe className="info-icon" />
            <div>
              <h3>Language</h3>
              <p>{profile.language === 'en' ? 'English' : 'Sinhala'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-documents">
        <h2><FaFileUpload /> Documents</h2>
        <div className="documents-list">
          <p>No documents uploaded yet</p>
          <button className="upload-btn">Upload Document</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;