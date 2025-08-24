import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApiService from '../../api.js'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await ApiService.register({ email, password })
      if (response.success || response.message) {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes('422')) {
        setError('Email already exists. Please use a different email.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="form-container">
        <h2>Register</h2>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
        
        <form onSubmit={handleRegister}>
          <input 
            type="email" 
            placeholder="Email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            required 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p>Already have an account? <a href="/">Login</a></p>
      </div>
      <footer style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
        &copy; Altatech Solutions Inc
      </footer>
    </>
  )
}
