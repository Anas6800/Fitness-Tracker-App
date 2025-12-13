import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/');
    } catch {
      setError('Failed to log in. Check email and password.');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="card-inner">
          <div className="row" style={{ alignItems: 'baseline' }}>
            <h2 className="h2">Welcome back</h2>
            <span className="subtle">Log in to track your streak</span>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            <input className="input" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
            <button className="btn btn-primary" type="submit">Log In</button>
          </form>

          <p className="subtle" style={{ marginTop: 14 }}>
            Need an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
