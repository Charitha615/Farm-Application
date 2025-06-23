import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMapMarkerAlt, FaTimes, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import '../css/Land.css';

const AddLand = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    district: '',
    size: '',
    coordinates: '',
    description: ''
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('province', formData.province);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('coordinates', formData.coordinates);
      formDataToSend.append('description', formData.description);
      
      if (documentFile) {
        formDataToSend.append('document', documentFile);
      }

      const response = await axios.post(
        'http://localhost/firebase-auth/api/farmers/lands/add',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Land added successfully!');
      setFormData({
        name: '',
        province: '',
        district: '',
        size: '',
        coordinates: '',
        description: ''
      });
      setDocumentFile(null);
      setFileName('No file chosen');
      
      setTimeout(() => navigate('/lands'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add land');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/lands');
  };

  return (
    <div className="land-container">
      <div className="land-header">
        <h1><FaPlus /> Add New Land</h1>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="land-form" encType="multipart/form-data">
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
              <option value="">Select Province</option>
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
              placeholder="6.9271,79.8612"
              required
            />
          </div>
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

        <div className="form-group">
          <label htmlFor="document">Land Document (PDF/Image)</label>
          <div className="file-upload-container">
            <label htmlFor="document" className="file-upload-label">
              <FaUpload /> Choose File
              <input
                type="file"
                id="document"
                name="document"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
            </label>
            <span className="file-name">{fileName}</span>
          </div>
          <small className="file-hint">Upload land deed or ownership document (max 5MB)</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Land'}
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLand;