import React, { useEffect, useState } from "react";
import './LoginForm.css';
import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signIn, fetchAuthSession } from '../../auth/cognito';

// Small helper so we don't duplicate token->user parsing logic.
function buildUserFromSession(session, fallbackUsername = '') {
  const idPayload = session.tokens?.idToken?.payload ?? {};
  const accessPayload = session.tokens?.accessToken?.payload ?? {};

  const userID = idPayload.sub || accessPayload.sub;
  if (!userID) throw new Error('Missing sub claim');

  // Groups are often on the access token
  const groupsClaim = accessPayload['cognito:groups'] ?? idPayload['cognito:groups'];
  const groups = Array.isArray(groupsClaim)
    ? groupsClaim
    : typeof groupsClaim === 'string' && groupsClaim.length
      ? groupsClaim.split(',').map(s => s.trim())
      : [];

  const role = groups[0] || '';
  const email = idPayload.email || accessPayload.email || '';
  const username = idPayload['cognito:username'] || accessPayload['cognito:username'] || fallbackUsername || '';

  return { userID, username, email, role };
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // (1) Rehydrate session on page load. If already signed in, redirect through.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      setCheckingSession(true);
      setError('');

      try {
        const session = await fetchAuthSession();

        // If tokens exist, user is already authenticated.
        const hasTokens =
          !!session?.tokens?.accessToken?.toString?.() ||
          !!session?.tokens?.idToken?.toString?.();

        if (!hasTokens) {
          // Not signed in; clear any stale local user cache.
          sessionStorage.removeItem('ftlUser');
          return;
        }

        const user = buildUserFromSession(session);

        sessionStorage.setItem('ftlUser', JSON.stringify(user));

        // Only navigate if component is still mounted.
        if (!cancelled) {
          navigate('/dashboard', { replace: true, state: user });
        }
      } catch (err) {
        // Not signed in (or session not available) is normal; just ensure storage is clean.
        sessionStorage.removeItem('ftlUser');
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };

    hydrate();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // If we're still checking session, avoid double-work.
      if (checkingSession) return;

      const res = await signIn({ username, password });

      // If Cognito requires another step (MFA, new password, etc.)
      const step = res?.nextStep?.signInStep;
      if (step && step !== 'DONE') {
        throw new Error(`Sign-in requires additional step: ${step}`);
      }

      const session = await fetchAuthSession();
      const user = buildUserFromSession(session, username);

      sessionStorage.setItem('ftlUser', JSON.stringify(user));
      navigate('/dashboard', { replace: true, state: user });
    } catch (err) {
      console.error('Login error:', err);

      // If Amplify says already authenticated, treat it as success and redirect.
      const name = err?.name || '';
      if (name === 'UserAlreadyAuthenticatedException') {
        try {
          const session = await fetchAuthSession();
          const user = buildUserFromSession(session, username);

          sessionStorage.setItem('ftlUser', JSON.stringify(user));
          navigate('/dashboard', { replace: true, state: user });
          return;
        } catch (rehydrateErr) {
          // If rehydrate fails, fall through to show the original error.
        }
      }

      setError(err?.message || 'login failed');
    }
  };

  return (
    <div className='wrapper'>
      <form onSubmit={handleSubmit}>
        <h1>Food Truck Locator</h1>
        <h2>Login</h2>

        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={checkingSession}
          />
          <FaUser className="icon" />
        </div>

        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={checkingSession}
          />
          <FaLock className="icon" />
        </div>

        {checkingSession && <p className="hint">Checking session…</p>}
        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={checkingSession}>
          Login
        </button>

        <div className="register-link">
          <p>
            Don't have an account yet? <a href="/register">Register</a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
