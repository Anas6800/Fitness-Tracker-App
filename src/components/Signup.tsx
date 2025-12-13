import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      await signup(email, password);
      navigate('/');
    } catch {
      setError('Failed to create an account. Password must be 6 characters.');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="card-inner">
          <div className="row" style={{ alignItems: 'baseline' }}>
            <h2 className="h2">Create your account</h2>
            <span className="subtle">Start a challenge in 30 seconds</span>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            <input className="input" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password (min 6 characters)" onChange={(e) => setPassword(e.target.value)} required />
            <button className="btn btn-primary" type="submit">Sign Up</button>
          </form>

          <p className="subtle" style={{ marginTop: 14 }}>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
