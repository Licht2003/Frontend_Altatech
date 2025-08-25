import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../api.js';
import './Admin.css';
import './login.css';

export default function Admin() {
  const [candidates, setCandidates] = useState([]);
  const [editedCandidates, setEditedCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDescription, setNewCandidateDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voteCounts, setVoteCounts] = useState({});
  const user = localStorage.getItem("currentUser");
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!user || userRole !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, userRole, navigate]);

  // Load candidates and vote counts from database
  useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true);
      try {
        const backendCandidates = await ApiService.fetchCandidates();
        setCandidates(backendCandidates);
        setEditedCandidates(backendCandidates);
        
        // Load vote counts for each candidate
        await loadVoteCounts(backendCandidates);
      } catch (error) {
        console.error('Failed to load candidates:', error);
        setError('Failed to load candidates. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && userRole === 'admin') {
      loadCandidates();
    }
  }, [user, userRole]);

  // Load vote counts for all candidates
  const loadVoteCounts = async (candidatesList) => {
    try {
      const counts = {};
      for (const candidate of candidatesList) {
        try {
          const response = await ApiService.getCandidateVotes(candidate.id);
          counts[candidate.id] = {
            free_votes: response.free_votes || 0,
            paid_votes: response.paid_votes || 0,
            total_votes: response.total_votes || 0
          };
        } catch (error) {
          console.error(`Failed to load votes for candidate ${candidate.id}:`, error);
          counts[candidate.id] = { free_votes: 0, paid_votes: 0, total_votes: 0 };
        }
      }
      setVoteCounts(counts);
    } catch (error) {
      console.error('Failed to load vote counts:', error);
    }
  };

  // Refresh vote counts after operations
  const refreshVoteCounts = async () => {
    if (candidates.length > 0) {
      await loadVoteCounts(candidates);
    }
  };

  // Add new candidate
  const handleAddCandidate = async () => {
    if (!newCandidateName.trim()) {
      setError('Candidate name is required');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Debug: Check authentication
    const token = localStorage.getItem('auth_token');
    console.log('Auth token:', token);
    console.log('User role:', userRole);
    
    try {
      const newCandidate = {
        name: newCandidateName,
        description: newCandidateDescription || '',
        image: null
      };

      console.log('Creating candidate:', newCandidate);
      const response = await ApiService.createCandidate(newCandidate);
      console.log('Response:', response);
      
      // Add to local state
      const candidateWithId = { ...response, id: response.id };
      setCandidates([...candidates, candidateWithId]);
      setEditedCandidates([...editedCandidates, candidateWithId]);
      
      // Initialize vote counts for new candidate
      setVoteCounts(prev => ({
        ...prev,
        [response.id]: { free_votes: 0, paid_votes: 0, total_votes: 0 }
      }));
      
      // Clear form
      setNewCandidateName('');
      setNewCandidateDescription('');
      setSuccess('Candidate added successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add candidate:', error);
      console.error('Error details:', error.message, error.stack);
      setError('Failed to add candidate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update candidate
  const handleEdit = (id, field, value) => {
    const updated = editedCandidates.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    setEditedCandidates(updated);
  };

  // Save individual candidate changes
  const handleSaveCandidate = async (candidate) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Check if there's a new image file to upload
      if (candidate._imageFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', candidate.name);
        formData.append('description', candidate.description || '');
        formData.append('image', candidate._imageFile);
        
        // Use a different endpoint for file uploads
        await ApiService.updateCandidateWithImage(candidate.id, formData);
        
        // Remove the temporary file reference
        delete candidate._imageFile;
      } else {
        // Regular update without image
        await ApiService.updateCandidate(candidate.id, candidate);
      }
      
      // Update local state
      setCandidates(candidates.map(c => 
        c.id === candidate.id ? candidate : c
      ));
      
      setSuccess('Candidate updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update candidate:', error);
      setError('Failed to update candidate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Photo upload
  const handlePhotoChange = (id, file) => {
    if (!file) return;
    
    // Create a local URL for preview
    const imageUrl = URL.createObjectURL(file);
    
    // Update the candidate with the file name (not base64)
    const fileName = file.name;
    handleEdit(id, 'image', `/candidates-images/${fileName}`);
    
    // Store the file reference for later upload
    handleEdit(id, '_imageFile', file);
  };

  // Delete candidate
  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await ApiService.deleteCandidate(id);
      
      // Remove from local state
      const filtered = candidates.filter(c => c.id !== id);
      const filteredEdited = editedCandidates.filter(c => c.id !== id);
      
      setCandidates(filtered);
      setEditedCandidates(filteredEdited);
      
      // Remove vote counts for deleted candidate
      setVoteCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[id];
        return newCounts;
      });
      
      setSuccess('Candidate deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      setError('Failed to delete candidate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (isLoading && candidates.length === 0) {
    return (
      <div className="admin-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>Loading candidates...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>

      <div className="admin-header">
        <h2>Admin Panel</h2>
        <div className="admin-stats">
          <span className="candidate-count">Total Candidates: {editedCandidates.length}</span>
          <button 
            onClick={refreshVoteCounts} 
            style={{
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: '10px'
            }}
          >
            🔄 Refresh Votes
          </button>
        </div>
      </div>

      {/* Add Candidate Form */}
      <div className="add-candidate-form">
        <h3>Add New Candidate</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Candidate Name"
            value={newCandidateName}
            onChange={e => setNewCandidateName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-row">
          <textarea
            placeholder="Description (optional)"
            value={newCandidateDescription}
            onChange={e => setNewCandidateDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button onClick={handleAddCandidate} disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Candidate'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Candidates Grid */}
      <div className="candidates-grid">
        {editedCandidates.map(c => (
          <div key={c.id} className="candidate-card">
            <div className="candidate-header">
              <h4>Candidate #{c.id}</h4>
              <div className="candidate-actions">
                <button 
                  className="save-candidate-btn" 
                  onClick={() => handleSaveCandidate(c)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="delete-candidate-btn" 
                  onClick={() => handleDeleteCandidate(c.id)}
                  disabled={isLoading}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="candidate-content">
              <div className="candidate-image-section">
                <img 
                  src={ApiService.getImageUrl(c.image) || 'https://via.placeholder.com/150x200/4A90E2/FFFFFF?text=Photo'} 
                  alt={c.name} 
                  className="candidate-image"
                />
                <div className="image-upload">
                  <label htmlFor={`photo-${c.id}`} className="upload-label">
                    Change Photo
                  </label>
                  <input
                    id={`photo-${c.id}`}
                    type="file"
                    accept="image/*"
                    onChange={e => handlePhotoChange(c.id, e.target.files[0])}
                    disabled={isLoading}
                    className="photo-input"
                  />
                </div>
              </div>
              
              <div className="candidate-fields">
                <div className="field-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => handleEdit(c.id, 'name', e.target.value)}
                    disabled={isLoading}
                    className="candidate-input"
                  />
                </div>
                
                <div className="field-group">
                  <label>Description:</label>
                  <textarea
                    value={c.description || ''}
                    onChange={e => handleEdit(c.id, 'description', e.target.value)}
                    disabled={isLoading}
                    className="candidate-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Vote Statistics Section */}
            <div className="vote-statistics">
              <div className="stat-item">
                <div className="stat-label">Free Votes</div>
                <div className="stat-value free-votes">
                  {voteCounts[c.id]?.free_votes || 0}
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Paid Votes</div>
                <div className="stat-value paid-votes">
                  {voteCounts[c.id]?.paid_votes || 0}
                </div>
              </div>
              
              <div className="stat-item total">
                <div className="stat-label">Total Votes</div>
                <div className="stat-value total-votes">
                  {voteCounts[c.id]?.total_votes || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
