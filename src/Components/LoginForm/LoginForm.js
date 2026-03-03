import React, { useEffect, useState, useMemo } from "react";

import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signIn, fetchAuthSession, startPasswordReset, finishPasswordReset } from '../../auth/cognito';

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

// Helper to translate technical errors to user-friendly messages
function getFriendlyErrorMessage(err) {
  if (!err) return "An unexpected error occurred. Please try again.";

  const name = err.name || "";
  const msg = err.message || "";

  switch (name) {
    case 'NotAuthorizedException':
      return "Incorrect username or password.";
    case 'UserNotFoundException':
      return "We couldn't find an account with that username.";
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return "Too many attempts. Please try again later.";
    case 'CodeMismatchException':
      return "The reset code you entered is incorrect.";
    case 'ExpiredCodeException':
      return "The reset code has expired. Please request a new one.";
    case 'InvalidPasswordException':
      return "Your password does not meet the security requirements.";
    case 'InvalidParameterException':
      return "Please check your information and try again.";
    case 'NetworkError':
      return "Network error. Please check your internet connection.";
    default:
      if (msg.toLowerCase().includes('network error')) {
        return "Network error. Please check your internet connection.";
      }
      // If none of our cases match, you can return a generic message
      return "Something went wrong. Please check your information and try again.";
  }
}

function LoginForm() {
  const [mode, setMode] = useState("login");
  // "login" | "forgot" | "confirm"

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const [resetCode, setResetCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  const canSubmitLogin = useMemo(() => username && password, [username, password]);
  const canSubmitForgot = useMemo(() => username, [username]);
  const canSubmitConfirm = useMemo(() => username && resetCode && newPassword, [username, resetCode, newPassword]);

  const clearMessages = () => {
    setError("");
    setStatus("");
  }

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

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setBusy(true);

    try {
      // If we're still checking session, avoid double-work.
      if (checkingSession) return;

      const res = await signIn({ username, password });

      // If Cognito requires another step (MFA, new password, etc.)
      const step = res?.nextStep?.signInStep;
      if (step && step !== 'DONE') {
        if (step === 'CONFIRM_SIGN_UP') {
          navigate('/confirm-signup', { replace: true, state: { username } });
        }
        throw new Error(`Sign-in requires additional step: ${step}`);
      }

      const session = await fetchAuthSession();
      const user = buildUserFromSession(session, username);

      sessionStorage.setItem('ftlUser', JSON.stringify(user));
      navigate('/dashboard', { replace: true, state: user });
      setStatus("logged in");
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

      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    clearMessages();
    setBusy(true);

    try {
      await startPasswordReset(username);

      setStatus("reset code sent. check your email.");
      setMode("confirm");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    clearMessages();
    setBusy(true);

    try {
      await finishPasswordReset(username, resetCode, newPassword);
      setStatus("Password reset successful. Please log in with your new password.");
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setMode("login");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='wrapper'>
      <h1>Food Truck Locator</h1>
      <h2>Login</h2>

      {mode === "login" && (
        <form onSubmit={handleLogin}>
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

          <button type="submit" disabled={checkingSession || !canSubmitLogin || busy}>
            {busy ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            className="linkish"
            onClick={() => { clearMessages(); setMode("forgot"); }}
            disabled={busy}
          >
            Forgot password?
          </button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleSendResetCode}>
          <h2>Reset Password</h2>

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

          <button type="submit" disabled={!canSubmitForgot || busy || checkingSession}>
            {busy ? "Sending..." : "Send reset code"}
          </button>

          <button
            type="button"
            className="linkish"
            onClick={() => {
              clearMessages();
              setMode("login");
            }}
            disabled={busy}
          >
            Back to login
          </button>
        </form>
      )}

      {mode === "confirm" && (
        <form onSubmit={handleConfirmReset}>
          <h2>Enter Reset Code</h2>

          <label>
            Username
            <input value={username} disabled />
          </label>

          <div className="input-box">
            <input
              type="text"
              placeholder="Reset code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={busy}
            />
            <FaLock className="icon" />
          </div>

          <button type="submit" disabled={!canSubmitConfirm || busy || checkingSession}>
            {busy ? "Confirming..." : "Confirm reset"}
          </button>

          <button
            type="button"
            className="linkish"
            onClick={() => {
              clearMessages();
              setMode("login");
            }}
            disabled={busy}
          >
            Back to login
          </button>
        </form>
      )}


      {checkingSession && <p className="hint">Checking session…</p>}
      {error && <p className="error">{error}</p>}
      {status && <div className="status">{status}</div>}

      <div className="register-link">
        <p>
          Don't have an account yet? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
