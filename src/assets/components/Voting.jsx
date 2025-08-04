import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './payment-modal.css'
import VoteHistory from './VoteHistory'

const candidates = [
  { id: 1, name: 'Daniela Andrea Avanzini Llorente', img: '/candidates-images/daniela.jpg' },
  { id: 2, name: 'Sophia Elizabeth Guevera Laforteza', img: '/candidates-images/sophia.jpg' },
  { id: 3, name: 'Meret Manon Sarpong Bannerman', img: '/candidates-images/manon.jpg' },
  { id: 4, name: 'Jeung Yoon-chae', img: '/candidates-images/yoonchae.jpeg' },
  { id: 5, name: 'Lara Rajagopalan', img: '/candidates-images/lara.jpeg' },
  { id: 6, name: 'Megan Meiyok Skiendiel', img: '/candidates-images/megan.jpg' },
  { id: 7, name: 'Hinari', img: '/candidates-images/hinari.webp' },
  { id: 8, name: 'Celeste', img: '/candidates-images/celeste.webp' },
  { id: 9, name: 'Emily', img: '/candidates-images/emily.webp' },
  { id: 10, name: 'Karlee', img: '/candidates-images/karlee.webp' },
  { id: 11, name: 'Iliya', img: '/candidates-images/iliya.webp' },
  { id: 12, name: 'Nayoung', img: '/candidates-images/nayoung.webp' },
  { id: 13, name: 'Lexie', img: '/candidates-images/lexie.jpeg' }
]

export default function Voting() {
  const navigate = useNavigate()
  const user = localStorage.getItem("currentUser")
  const [voted, setVoted] = useState(false)
  const [voteCounts, setVoteCounts] = useState({})
  const [showPayment, setShowPayment] = useState(false)
  const [method, setMethod] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!user) return navigate('/')

    const data = JSON.parse(localStorage.getItem(user))
    const lastVote = data?.lastVote
    const today = new Date().toDateString()
    if (lastVote === today) setVoted(true)

    const storedVotes = JSON.parse(localStorage.getItem("voteCounts")) || {}
    setVoteCounts(storedVotes)
  }, [])

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
                Already Voted
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
