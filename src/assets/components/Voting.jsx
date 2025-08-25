import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApiService from '../../api.js'
import './payment-modal.css'
import VoteHistory from './VoteHistory'

export default function Voting() {
  const navigate = useNavigate()
  const user = localStorage.getItem("currentUser")
  const [canVote, setCanVote] = useState(true)
  const [voteCounts, setVoteCounts] = useState({})
  const [showPayment, setShowPayment] = useState(false)
  const [method, setMethod] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [votingStatus, setVotingStatus] = useState({
    canVote: true,
    nextVoteDate: null,
    todayVote: null
  })

  // Load candidates and check voting status
  useEffect(() => {
    if (!user) return navigate('/')

    const loadData = async () => {
      setIsLoading(true)
      
      try {
        // Load candidates from backend
        const backendCandidates = await ApiService.fetchCandidates();
        if (backendCandidates && backendCandidates.length > 0) {
          setCandidates(backendCandidates);
        } else {
          // Fallback to default candidates if backend fails
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

        // Check if user can vote today
        const votingStatus = await ApiService.canVote();
        setVotingStatus(votingStatus);
        setCanVote(votingStatus.can_vote);

        // Load vote counts for all candidates
        await loadVoteCounts(backendCandidates);

      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to localStorage if backend fails
        const storedCandidates = JSON.parse(localStorage.getItem('candidates'))
        if (storedCandidates && storedCandidates.length > 0) {
          setCandidates(storedCandidates)
        }
        
        // Check localStorage for voting status
        const data = JSON.parse(localStorage.getItem(user))
        const lastVote = data?.lastVote
        const today = new Date().toDateString()
        if (lastVote === today) {
          setCanVote(false)
          setVotingStatus({
            canVote: false,
            nextVoteDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            todayVote: null
          })
        }
      } finally {
        setIsLoading(false)
      }
    };

    loadData();

    // Listen for updates from admin
    const syncFromStorage = () => {
      const updatedCandidates = JSON.parse(localStorage.getItem('candidates'))
      if (updatedCandidates) setCandidates(updatedCandidates)
    }
    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)

  }, [navigate, user])

  // Load vote counts for all candidates
  const loadVoteCounts = async (candidatesList) => {
    try {
      const counts = {};
      for (const candidate of candidatesList) {
        try {
          const response = await ApiService.getCandidateVotes(candidate.id);
          counts[candidate.id] = response.total_votes || 0;
        } catch (error) {
          console.error(`Failed to load votes for candidate ${candidate.id}:`, error);
          counts[candidate.id] = 0;
        }
      }
      setVoteCounts(counts);
    } catch (error) {
      console.error('Failed to load vote counts:', error);
    }
  };

  // Refresh vote counts after voting
  const refreshVoteCounts = async () => {
    if (candidates.length > 0) {
      await loadVoteCounts(candidates);
    }
  };

  const handleVote = async (id) => {
    if (!canVote) {
      alert("You've already voted today! You can vote again tomorrow.")
      return
    }

    setIsLoading(true)
    const selectedCandidate = candidates.find(c => c.id === id)

    try {
      const response = await ApiService.castVote({ 
        candidate_id: id, 
        type: 'free' 
      });
      
      if (response.success || response.message) {
        alert(`You voted for ${selectedCandidate.name}! You have used your daily vote.`)
        setCanVote(false)
        setVotingStatus({
          canVote: false,
          nextVoteDate: response.next_vote_date,
          todayVote: {
            candidate_name: selectedCandidate.name,
            vote_type: 'free',
            voted_at: new Date().toISOString()
          }
        })
        
        // Update local storage for fallback
        const userData = JSON.parse(localStorage.getItem(user) || '{}')
        userData.lastVote = new Date().toDateString()
        localStorage.setItem(user, JSON.stringify(userData))
        
        // Save vote history
        const history = JSON.parse(localStorage.getItem(user + '_history')) || []
        history.push({ candidate: selectedCandidate.name, date: new Date().toDateString() })
        localStorage.setItem(user + '_history', JSON.stringify(history))
        
        // Refresh vote counts after successful vote
        await refreshVoteCounts();
        
        return;
      }
    } catch (error) {
      if (error.message.includes('already voted today')) {
        alert("You have already voted today! You can only vote once per day.")
        setCanVote(false)
        // Refresh voting status
        try {
          const votingStatus = await ApiService.canVote();
          setVotingStatus(votingStatus);
          setCanVote(votingStatus.can_vote);
        } catch (refreshError) {
          console.error('Failed to refresh voting status:', refreshError);
        }
      } else {
        alert(`Vote failed: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
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

  const formatNextVoteDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleShowHistory} className="history-btn" style={{ marginRight: 'auto' }}>Vote History</button>
        <h2 style={{ margin: '0 auto' }}>Vote for Your Favorite</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Voting Status Banner */}
      {!canVote && votingStatus.todayVote && (
        <div className="voting-status-banner">
          <h3>You've Voted Today!</h3>
          <p>
            <strong>Voted for:</strong> {votingStatus.todayVote.candidate_name}
          </p>
          <p>
            <strong>Vote type:</strong> {votingStatus.todayVote.vote_type === 'free' ? 'Free Vote' : 'Paid Vote'}
          </p>
          <p>
            <strong>Next vote available:</strong> {formatNextVoteDate(votingStatus.nextVoteDate)}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="loading-container">
          <h3>Loading...</h3>
        </div>
      )}

      <div className="grid">
        {candidates.map(c => (
          <div key={c.id} className="candidate-card">
            <div className="candidate-info">
              <img src={ApiService.getImageUrl(c.image) || 'https://via.placeholder.com/150x200/4A90E2/FFFFFF?text=Photo'} alt={c.name} className="candidate-img" />
              <h4 className="candidate-name">{c.name}</h4>
              <p className="candidate-description">{c.description || 'No description available'}</p>
            </div>
            
            <div className="candidate-actions">
              {!canVote ? (
                              <button className="payment-required-btn" onClick={() => handleVoteAgain(c)}>
                Vote Again (Payment Required)
              </button>
              ) : (
                <button 
                  className="vote-btn"
                  onClick={() => handleVote(c.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Voting...' : 'Vote Now'}
                </button>
              )}
            </div>
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
        <VoteHistory user={user} onClose={handleCloseHistory} candidates={candidates} />
      )}
    </div>
  )
}
