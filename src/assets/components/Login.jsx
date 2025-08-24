import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../api.js';
import './login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await ApiService.login({ email, password });
      
      if (response.token) {
        // Store user info and token
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("currentUser", response.user.email);
        localStorage.setItem("userRole", response.user.role);
        
        // Redirect based on role
        if (response.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/vote');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="form-container">
        <h2>Login</h2>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleLogin}>
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>Don't have an account? <a href="/register">Register</a></p>
        
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h4>Test Accounts:</h4>
          <p><strong>Admin:</strong> admin@pageant.com / password</p>
          <p><strong>User:</strong> john@example.com / password</p>
        </div>
      </div>
      <footer style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
        &copy; Altatech Solutions Inc
      </footer>
    </>
  );
}
