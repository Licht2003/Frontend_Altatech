import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    const stored = JSON.parse(localStorage.getItem(email))
    if (stored && stored.password === password) {
      localStorage.setItem("currentUser", email)
      navigate('/vote')
    } else {
      alert("Invalid credentials")
    }
  }

 return (
  <div className="form-container">
    <h2>Login</h2>
    <form onSubmit={handleLogin}>
      <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="/register">Register</a></p>
  </div>
 )
}
