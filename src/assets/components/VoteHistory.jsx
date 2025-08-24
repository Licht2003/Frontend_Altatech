import React, { useEffect, useState } from 'react';
import './VoteHistory.css';

export default function VoteHistory({ user, onClose, candidates = [] }) {
  const [history, setHistory] = useState([]);
  const [candidatesData, setCandidatesData] = useState([]);

  useEffect(() => {
    // Load vote history from localStorage
    const voteHistory = JSON.parse(localStorage.getItem(user + '_history')) || [];
    setHistory(voteHistory);

    // Load candidates data if not provided
    if (candidates.length === 0) {
      const storedCandidates = JSON.parse(localStorage.getItem('candidates')) || [];
      setCandidatesData(storedCandidates);
    } else {
      setCandidatesData(candidates);
    }
  }, [user, candidates]);

  // Get candidate details by name
  const getCandidateDetails = (candidateName) => {
    return candidatesData.find(c => c.name === candidateName) || {
      name: candidateName,
      description: 'No description available',
      image: null
    };
  };

  return (
    <div className="vote-history-overlay">
      <div className="vote-history-modal">
        <div className="vote-history-header">
          <h3>Vote History</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        {history.length === 0 ? (
          <div className="no-votes">
            <p>No votes yet.</p>
            <p className="subtitle">Start voting to see your history here!</p>
          </div>
        ) : (
          <div className="vote-history-content">
            <p className="history-subtitle">Your voting activity:</p>
            <div className="vote-cards">
              {history.map((item, idx) => {
                const candidate = getCandidateDetails(item.candidate);
                return (
                  <div key={idx} className="vote-card">
                    <div className="candidate-image-section">
                      <img 
                        src={candidate.image || 'https://via.placeholder.com/80x100/4A90E2/FFFFFF?text=Photo'} 
                        alt={candidate.name} 
                        className="candidate-history-image"
                      />
                    </div>
                    <div className="candidate-details">
                      <h4 className="candidate-name">{candidate.name}</h4>
                      <p className="candidate-description">{candidate.description || 'No description available'}</p>
                      <div className="vote-date">
                        <span className="date-icon"></span>
                        {item.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
