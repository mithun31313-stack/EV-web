import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <form className="auth-box" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: 0 }}>Create Account</h2>
          <p className="muted small">Sign up to start charging</p>
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

        <input className="input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Sign Up'}
        </button>

        <Link to="/login">
          <button type="button" className="btn btn-outline">Already have an account? Login</button>
        </Link>
      </form>
    </div>
  );
}
