import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if admin
    if (email === "admin123" && password === "admin123") {
      localStorage.setItem("currentUser", "admin");
      navigate('/admin');
      return;
    }

    // Check User
    const stored = JSON.parse(localStorage.getItem(email));
    if (stored && stored.password === password) {
      localStorage.setItem("currentUser", email);
      navigate('/vote');
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <>
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
      <footer style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
        &copy; Altatech Solutions Inc
      </footer>
    </>
  );
}
