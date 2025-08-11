import React, { useState, useEffect } from 'react';
import './Admin.css';
import './login.css';
import { useNavigate } from 'react-router-dom'


export default function Admin() {
  const [candidates, setCandidates] = useState([]);
  const [editedCandidates, setEditedCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const user = localStorage.getItem("currentUser");
  const navigate = useNavigate();

  //  Candidates 
  useEffect(() => {
    const saved = localStorage.getItem('candidates');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCandidates(parsed);
      setEditedCandidates(parsed);
    } else {
      const defaults = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Candidate ${i + 1}`,
        img: 'https://via.placeholder.com/120',
      }));

      setCandidates(defaults);
      setEditedCandidates(defaults);
    }
  }, []);

  // Add new candidate to editedCandidates only (not saved yet)
  const handleAddCandidate = () => {
    if (!newCandidateName.trim()) return;
    const newId = editedCandidates.length ? Math.max(...editedCandidates.map(c => c.id)) + 1 : 1;
    const newCandidate = {
      id: newId,
      name: newCandidateName,
      img: 'https://via.placeholder.com/120',
    };
    setEditedCandidates([...editedCandidates, newCandidate]);
    setNewCandidateName('');
  };

  // Update editedCandidates on field change
  const handleEdit = (id, field, value) => {
    const updated = editedCandidates.map(c => (c.id === id ? { ...c, [field]: value } : c));
    setEditedCandidates(updated);
  };

  // Photo upload updates editedCandidates only
  const handlePhotoChange = (id, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      handleEdit(id, 'img', reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Delete candidate by id
  const handleDeleteCandidate = (id) => {
    const filtered = editedCandidates.filter(c => c.id !== id);
    setEditedCandidates(filtered);
  };

  // Save changes: copy editedCandidates to candidates and save to localStorage
  const handleSaveChanges = () => {
    setCandidates(editedCandidates);
    localStorage.setItem('candidates', JSON.stringify(editedCandidates));
    alert('Changes saved!');
  };

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <div className="admin-container">
      <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>

      <h2>Admin Panel</h2>
      <h3>Total Candidates: {editedCandidates.length}</h3>

      {/* Add Candidate Form */}
      <div className="add-candidate-form">
        <h3>Add New Candidate</h3>
        <input
          type="text"
          placeholder="Name"
          value={newCandidateName}
          onChange={e => setNewCandidateName(e.target.value)}
        />
        <button onClick={handleAddCandidate}>Add Candidate</button>
      </div>

      {/* Candidates List */}
      {editedCandidates.map(c => (
        <div key={c.id} className="candidate-preview">
          <img src={c.img} alt={c.name} />
          <div className="candidate-details">
            <label>Name:</label>
            <input
              type="text"
              value={c.name}
              onChange={e => handleEdit(c.id, 'name', e.target.value)}
            />
            <label>Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => handlePhotoChange(c.id, e.target.files[0])}
            />
            <button 
              className="delete-candidate-btn" 
              onClick={() => handleDeleteCandidate(c.id)}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Save Changes Button */}
      <button className="admin-save-btn" onClick={handleSaveChanges}>
        Save Changes
      </button>
      
    </div>
  );
}
