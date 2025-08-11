import React from 'react';
import './VoteHistory.css';

export default function VoteHistory({ user }) {
  const history = JSON.parse(localStorage.getItem(user + '_history')) || [];

  return (
    <aside className="vote-history-sidebar">
      <h3>Vote History</h3>
      {history.length === 0 ? (
        <p className="no-votes">No votes yet.</p>
      ) : (
        <ul className="vote-list">
          {history.map((item, idx) => (
            <li key={idx} className="vote-item">
              <strong>{item.candidate}</strong>
              <div className="vote-date">{item.date}</div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
