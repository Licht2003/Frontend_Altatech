import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()
    if (localStorage.getItem(email)) {
      alert("User already exists")
    } else {
      localStorage.setItem(email, JSON.stringify({ password, lastVote: null }))
      alert("Registered successfully")
      navigate('/')
    }
  }

  return (
  <div className="form-container">
    <h2>Register</h2>
    <form onSubmit={handleRegister}>
      <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <a href="/">Login</a></p>
  </div>
 )
}
