import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import '../css/Land.css';

const LandList = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost/firebase-auth/api/farmers/lands/list',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // Convert object response to array
        const landsArray = Object.entries(response.data).map(([id, land]) => ({
          id,
          ...land
        }));
        
        setLands(landsArray);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch lands');
        setLoading(false);
      }
    };

    fetchLands();
  }, []);

  const handleDelete = async (landId) => {
    if (!window.confirm('Are you sure you want to delete this land record?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost/firebase-auth/api/farmers/lands/${landId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setLands(lands.filter(land => land.id !== landId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete land');
    }
  };

  if (loading) return <div className="land-container loading">Loading lands...</div>;
  if (error) return <div className="land-container error">Error: {error}</div>;

  return (
    <div className="land-container">
      <div className="land-header">
        <h1>My Lands</h1>
        <Link to="/land/add" className="add-btn">
          <FaPlus /> Add Land
        </Link>
      </div>

      {lands.length === 0 ? (
        <div className="no-lands">
          <p>You haven't added any lands yet.</p>
          <Link to="/land/add" className="add-btn">
            <FaPlus /> Add Your First Land
          </Link>
        </div>
      ) : (
        <div className="lands-grid">
          {lands.map(land => (
            <div key={land.id} className="land-card">
              <div className="land-card-header">
                <h3>{land.name}</h3>
                <span className={`status-badge ${land.status}`}>
                  {land.status}
                </span>
              </div>

              <div className="land-card-body">
                <div className="land-info">
                  <p><strong>Province:</strong> {land.province}</p>
                  <p><strong>District:</strong> {land.district}</p>
                  <p><strong>Size:</strong> {land.size} acres</p>
                  {land.coordinates && (
                    <p className="coordinates">
                      <FaMapMarkerAlt /> {land.coordinates}
                    </p>
                  )}
                </div>

                {land.description && (
                  <div className="land-description">
                    <p>{land.description}</p>
                  </div>
                )}

                <div className="land-card-footer">
                  <small>Added on: {new Date(land.created_at).toLocaleDateString()}</small>
                  <div className="land-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/lands/edit/${land.id}`)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(land.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandList;