import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './payment-modal.css'
import VoteHistory from './VoteHistory'

export default function Voting() {
  const navigate = useNavigate()
  const user = localStorage.getItem("currentUser")
  const [voted, setVoted] = useState(false)
  const [voteCounts, setVoteCounts] = useState({})
  const [showPayment, setShowPayment] = useState(false)
  const [method, setMethod] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [candidates, setCandidates] = useState([])

  // Load candidates and vote counts
  useEffect(() => {
    if (!user) return navigate('/')

    // Load saved candidates from localStorage (from Admin.jsx)
    const storedCandidates = JSON.parse(localStorage.getItem('candidates'))
    if (storedCandidates && storedCandidates.length > 0) {
      setCandidates(storedCandidates)
    } else {
      // Fallback to default hardcoded list if no admin data exists yet
      setCandidates([
        { id: 1, name: 'Candidate 1', info: 'Info here', img: '/default.jpg' },
        { id: 2, name: 'Candidate 2', info: 'Info here', img: '/default.jpg' },
        { id: 3, name: 'Candidate 3', info: 'Info here', img: '/default.jpg' },
        { id: 4, name: 'Candidate 4', info: 'Info here', img: '/default.jpg' },
        { id: 5, name: 'Candidate 5', info: 'Info here', img: '/default.jpg' },
        { id: 6, name: 'Candidate 6', info: 'Info here', img: '/default.jpg' },
        { id: 7, name: 'Candidate 7', info: 'Info here', img: '/default.jpg' },
        { id: 8, name: 'Candidate 8', info: 'Info here', img: '/default.jpg' },
        { id: 9, name: 'Candidate 9', info: 'Info here', img: '/default.jpg' },
        { id: 10, name: 'Candidate 10', info: 'Info here', img: '/default.jpg' },
        { id: 11, name: 'Candidate 11', info: 'Info here', img: '/default.jpg' },
        { id: 12, name: 'Candidate 12', info: 'Info here', img: '/default.jpg' },
        { id: 13, name: 'Candidate 13', info: 'Info here', img: '/default.jpg' },
      ])
    }

    // Check if user already voted today
    const data = JSON.parse(localStorage.getItem(user))
    const lastVote = data?.lastVote
    const today = new Date().toDateString()
    if (lastVote === today) setVoted(true)

    // Load vote counts
    const storedVotes = JSON.parse(localStorage.getItem("voteCounts")) || {}
    setVoteCounts(storedVotes)

    // Listen for updates from admin
    const syncFromStorage = () => {
      const updatedCandidates = JSON.parse(localStorage.getItem('candidates'))
      if (updatedCandidates) setCandidates(updatedCandidates)
    }
    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)

  }, [navigate, user])

  const handleVote = (id) => {
    if (voted) return alert("You've already voted today!")

    const today = new Date().toDateString()
    const userData = JSON.parse(localStorage.getItem(user))
    userData.lastVote = today
    localStorage.setItem(user, JSON.stringify(userData))

    const updatedVotes = { ...voteCounts }
    updatedVotes[id] = (updatedVotes[id] || 0) + 1
    localStorage.setItem("voteCounts", JSON.stringify(updatedVotes))
    setVoteCounts(updatedVotes)

    // Save vote history
    const history = JSON.parse(localStorage.getItem(user + '_history')) || []
    history.push({ candidate: candidates.find(c => c.id === id).name, date: today })
    localStorage.setItem(user + '_history', JSON.stringify(history))

    alert(`You voted for ${candidates.find(c => c.id === id).name}`)
    setVoted(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate('/')
  }

  const handleVoteAgain = (candidate) => {
    setSelectedCandidate(candidate)
    setShowPayment(true)
  }

  const handleClose = () => {
    setShowPayment(false)
    setMethod('')
    setSelectedCandidate(null)
  }

  const handlePayment = (e) => {
    e.preventDefault()
    if (!method) {
      alert('Please select a payment method.')
      return
    }
    alert(`Proceeding with payment via ${method} for ${selectedCandidate?.name}`)
    setShowPayment(false)
  }

  const handleShowHistory = () => setShowHistory(true)
  const handleCloseHistory = () => setShowHistory(false)

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleShowHistory} className="history-btn" style={{ marginRight: 'auto' }}>Vote History</button>
        <h2 style={{ margin: '0 auto' }}>Vote for Your Favorite</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="grid">
        {candidates.map(c => (
          <div key={c.id} className="candidate-card">
            <img src={c.img} alt={c.name} className="candidate-img" />
            <h4 className="candidate-name">{c.name}</h4>
            <p className="vote-count"><strong>Votes:</strong> {voteCounts[c.id] || 0}</p>
            {voted ? (
              <button className="already-voted-btn" onClick={() => handleVoteAgain(c)}>
                Click To Vote Again!
              </button>
            ) : (
              <button 
                className="vote-btn"
                onClick={() => handleVote(c.id)}
              >
                Vote
              </button>
            )}
          </div>
        ))}
      </div>

      {showPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <h3>Do you still want to vote?</h3>
            <p>Here is the payment for another voting for <b>{selectedCandidate?.name}</b>:</p>
            <form onSubmit={handlePayment}>
              <label>
                <input type="radio" name="payment" value="GCash" checked={method === 'GCash'} onChange={() => setMethod('GCash')} /> GCash
              </label>
              <label>
                <input type="radio" name="payment" value="PayMaya" checked={method === 'PayMaya'} onChange={() => setMethod('PayMaya')} /> PayMaya
              </label>
              <label>
                <input type="radio" name="payment" value="Bank" checked={method === 'Bank'} onChange={() => setMethod('Bank')} /> Bank
              </label>
              <button type="submit">Proceed to Pay</button>
              <button type="button" className="close-btn" onClick={handleClose}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <VoteHistory user={user} onClose={handleCloseHistory} />
      )}
    </div>
  )
}
