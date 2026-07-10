import React, { useState } from 'react';
import { register, login, setToken, setStoredEmail } from '../api.js';

export default function Login({ onAuthed }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter an email and password.');
      return;
    }
    setBusy(true);
    try {
      const fn = mode === 'signup' ? register : login;
      const data = await fn(email, password);
      setToken(data.token);
      setStoredEmail(data.email);
      onAuthed(data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="login-screen">
      <div className="login-card">
        <div className="login-eyebrow">Prep Deck</div>
        <h1>Before the next four years start</h1>
        <p>One place for everything you're collecting before college — screenshots, notes, links, videos, and a timeline that actually reminds you. This account works from any device.</p>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          <label className="field-label">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
          {error && <div className="auth-error">{error}</div>}
          <button className="btn-primary" disabled={busy} type="submit">
            {busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>
        <div className="auth-toggle">
          {mode === 'signin' ? (
            <button className="btn-ghost" onClick={() => setMode('signup')}>New here? Create an account</button>
          ) : (
            <button className="btn-ghost" onClick={() => setMode('signin')}>Already have an account? Log in</button>
          )}
        </div>
      </div>
    </div>
  );
}
