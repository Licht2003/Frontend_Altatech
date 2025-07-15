import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

    // Update vote tally
    const updatedVotes = { ...voteCounts }
    updatedVotes[id] = (updatedVotes[id] || 0) + 1
    localStorage.setItem("voteCounts", JSON.stringify(updatedVotes))
    setVoteCounts(updatedVotes)

    alert(`You voted for ${candidates.find(c => c.id === id).name}`)
    setVoted(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate('/')
  }

  return (
    <div className="container">
  <div className="header">
    <h2>Vote for Your Favorite</h2>
    <button onClick={handleLogout} className="logout-btn">Logout</button>
  </div>

  <div className="grid">
    {candidates.map(c => (
      <div key={c.id} className="candidate-card">
        <img src={c.img} alt={c.name} className="candidate-img" />
        <h4 className="candidate-name">{c.name}</h4>
        <p className="vote-count"><strong>Votes:</strong> {voteCounts[c.id] || 0}</p>
        <button 
          className="vote-btn"
          onClick={() => handleVote(c.id)} 
          disabled={voted}
        >
          {voted ? 'Already Voted' : 'Vote'}
        </button>
      </div>
    ))}
  </div>
</div>
  )
}
