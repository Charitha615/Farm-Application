import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import '../css/Land.css';

const EditLand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    district: '',
    size: '',
    coordinates: '',
    description: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost/firebase-auth/api/farmers/lands/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch land details');
        setLoading(false);
      }
    };

    fetchLand();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost/firebase-auth/api/farmers/lands/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Land updated successfully!');
      setTimeout(() => navigate('/lands'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update land');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/lands');
  };

  if (loading) return <div className="land-container loading">Loading land details...</div>;
  if (error) return <div className="land-container error">Error: {error}</div>;

  return (
    <div className="land-container">
      <div className="land-header">
        <h1>Edit Land</h1>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="land-form">
        <div className="form-group">
          <label htmlFor="name">Land Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="province">Province</label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
            >
              <option value="Western">Western</option>
              <option value="Central">Central</option>
              <option value="Southern">Southern</option>
              <option value="Northern">Northern</option>
              <option value="Eastern">Eastern</option>
              <option value="North Western">North Western</option>
              <option value="North Central">North Central</option>
              <option value="Uva">Uva</option>
              <option value="Sabaragamuwa">Sabaragamuwa</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="district">District</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="size">Size (acres)</label>
            <input
              type="number"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              step="0.1"
              min="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">
              <FaMapMarkerAlt /> Coordinates (lat,long)
            </label>
            <input
              type="text"
              id="coordinates"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLand;