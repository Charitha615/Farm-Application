import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaPlus, FaMapMarkerAlt, FaEdit, FaTrash, FaTimes,
    FaUpload, FaSearch, FaFilter, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import axios from 'axios';
import '../css/Land.css';

const LandManagement = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('list'); // 'list', 'add', 'edit'
    const [lands, setLands] = useState([]);
    const [filteredLands, setFilteredLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        province: 'all',
        sizeMin: '',
        sizeMax: ''
    });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        province: '',
        district: '',
        size: '',
        coordinates: '',
        description: '',
        status: 'active'
    });
    const [currentLandId, setCurrentLandId] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
    const [fileName, setFileName] = useState('No file chosen');

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const farmerUid = user?.uid;

    // Fetch lands on component mount
    useEffect(() => {
        fetchLands();
    }, []);

    // Apply filters whenever lands or filters change
    useEffect(() => {
        applyFilters();
    }, [lands, filters, searchTerm]);

    const fetchLands = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `http://localhost/firebase-auth/api/farmers/lands/list.php?farmer_uid=${farmerUid}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Convert object response to array if needed
            const landsArray = response.data && typeof response.data === 'object'
                ? Object.entries(response.data).map(([id, land]) => ({ id, ...land }))
                : Array.isArray(response.data)
                    ? response.data
                    : [];

            setLands(landsArray);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch lands');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...lands];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(land =>
                land.name.toLowerCase().includes(term) ||
                land.district.toLowerCase().includes(term) ||
                (land.description && land.description.toLowerCase().includes(term))
            );
        }

        // Apply status filter
        if (filters.status !== 'all') {
            result = result.filter(land => land.status === filters.status);
        }

        // Apply province filter
        if (filters.province !== 'all') {
            result = result.filter(land => land.province === filters.province);
        }

        // Apply size filters
        if (filters.sizeMin) {
            result = result.filter(land => parseFloat(land.size) >= parseFloat(filters.sizeMin));
        }
        if (filters.sizeMax) {
            result = result.filter(land => parseFloat(land.size) <= parseFloat(filters.sizeMax));
        }

        setFilteredLands(result);
    };

    const handleAddClick = () => {
        setMode('add');
        setFormData({
            name: '',
            province: '',
            district: '',
            size: '',
            coordinates: '',
            description: '',
            status: 'active'
        });
        setCurrentLandId(null);
        setDocumentFile(null);
        setFileName('No file chosen');
        setError(null);
        setSuccess(null);
    };

    const handleEditClick = (land) => {
        setMode('edit');
        setFormData({
            name: land.name,
            province: land.province,
            district: land.district,
            size: land.size,
            coordinates: land.coordinates || '',
            description: land.description || '',
            status: land.status || 'active'
        });
        setCurrentLandId(land.id);
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setMode('list');
    };

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
            const url = mode === 'add'
                ? 'http://localhost/firebase-auth/api/farmers/lands/list.php'
                : `http://localhost/firebase-auth/api/farmers/lands/list.php?id=${currentLandId}`;

            const method = mode === 'add' ? 'POST' : 'PUT';

            // Prepare JSON data
            const landData = {
                farmer_uid: farmerUid,
                name: formData.name,
                province: formData.province,
                district: formData.district,
                size: formData.size,
                coordinates: formData.coordinates,
                description: formData.description
            };

            // Add status for edit mode
            if (mode === 'edit') {
                landData.status = formData.status;
            }

            /* File upload commented out
            if (documentFile) {
                landData.document = documentFile;
            }
            */

            const response = await axios({
                method,
                url,
                data: landData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // Changed to JSON
                }
            });

            setSuccess(`Land ${mode === 'add' ? 'added' : 'updated'} successfully!`);
            fetchLands(); // Refresh the list

            setTimeout(() => {
                setMode('list');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || err.message || `Failed to ${mode} land`);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (landId) => {
        if (!window.confirm('Are you sure you want to delete this land record?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost/firebase-auth/api/farmers/lands/list.php?id=${landId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSuccess('Land deleted successfully!');
            fetchLands(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to delete land');
        }
    };

    if (loading && mode === 'list') {
        return (
            <div className="land-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="land-container">
            {mode === 'list' ? (
                <>
                    <div className="land-header">
                        <h1>My Land Properties</h1>
                        <button onClick={handleAddClick} className="btn-primary">
                            <FaPlus /> Add Land
                        </button>
                    </div>

                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">{success}</div>}

                    <div className="land-controls">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search lands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn-filter"
                            onClick={() => setFiltersOpen(!filtersOpen)}
                        >
                            <FaFilter /> Filters {filtersOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>

                    {filtersOpen && (
                        <div className="filters-panel">
                            <div className="filter-group">
                                <label>Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Province</label>
                                <select
                                    value={filters.province}
                                    onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                                >
                                    <option value="all">All Provinces</option>
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

                            <div className="filter-group">
                                <label>Size Range (acres)</label>
                                <div className="size-range">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.sizeMin}
                                        onChange={(e) => setFilters({ ...filters, sizeMin: e.target.value })}
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.sizeMax}
                                        onChange={(e) => setFilters({ ...filters, sizeMax: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {filteredLands.length === 0 ? (
                        <div className="no-lands">
                            <p>No lands found matching your criteria.</p>
                            <button onClick={() => {
                                setSearchTerm('');
                                setFilters({
                                    status: 'all',
                                    province: 'all',
                                    sizeMin: '',
                                    sizeMax: ''
                                });
                            }} className="btn-secondary">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="lands-grid">
                            {filteredLands.map(land => (
                                <div key={land.id} className="land-card">
                                    <div className="land-card-header">
                                        <h3>{land.name}</h3>
                                        <span className={`status-badge ${land.status}`}>
                                            {land.status}
                                        </span>
                                    </div>

                                    <div className="land-card-body">
                                        <div className="land-info">
                                            <p><strong>Location:</strong> {land.district}, {land.province}</p>
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

                                        {land.document_url && (
                                            <div className="land-document">
                                                <a href={land.document_url} target="_blank" rel="noopener noreferrer">
                                                    View Document
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="land-card-footer">
                                        <small>Added: {new Date(land.created_at).toLocaleDateString()}</small>
                                        <div className="land-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditClick(land)}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleDelete(land.id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="land-form-container">
                    <div className="land-form-header">
                        <h1>{mode === 'add' ? 'Add New Land' : 'Edit Land'}</h1>
                        <button onClick={handleCancel} className="btn-icon">
                            <FaTimes />
                        </button>
                    </div>

                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">{success}</div>}

                    <form onSubmit={handleSubmit} className="land-form" encType="multipart/form-data">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Land Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {mode === 'edit' && (
                                <div className="form-group">
                                    <label htmlFor="status">Status *</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="province">Province *</label>
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
                                <label htmlFor="district">District *</label>
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
                                <label htmlFor="size">Size (acres) *</label>
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
                            <div className="file-upload-box">
                                <label htmlFor="document" className="file-upload-label">
                                    <FaUpload /> {fileName}
                                </label>
                                <input
                                    type="file"
                                    id="document"
                                    name="document"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>
                            <small className="file-hint">Max file size: 5MB</small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (mode === 'add' ? 'Add Land' : 'Update Land')}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LandManagement;