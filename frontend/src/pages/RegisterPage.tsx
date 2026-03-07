import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      authLogin(data);
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: unknown } };
      const errors = axiosError?.response?.data;
      if (Array.isArray(errors)) {
        setError(errors.map((e: { description?: string }) => e.description).join(' '));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">💼 Portfolio Tools</h1>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-banner">{error}</div>}
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password <span className="hint">(min 8 chars, must include a digit)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
