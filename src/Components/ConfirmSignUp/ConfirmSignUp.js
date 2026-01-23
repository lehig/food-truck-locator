import React, { useEffect, useState } from "react";
import "./ConfirmSignUp.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { confirmSignUp, resendSignUpCode, signIn, fetchAuthSession } from "../../auth/cognito";

function ConfirmSignup() {
  const location = useLocation();
  const navigate = useNavigate();

  // Values passed from RegisterForm
  const { userId, username, email, password, accountType } = location.state || {};

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // If someone hits this page directly without state, send them back.
    if (!username) {
      navigate("/register", { replace: true });
    }
  }, [username, navigate]);

  const clearMessages = () => {
    setError("");
    setStatus("");
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    clearMessages();
    setBusy(true);

    try {
      await confirmSignUp(username, code);
      setStatus("Confirmed. Signing you in...");

      // Sign them in immediately after confirmation (optional but common).
      // If you don't want to carry password in route state, ask them to re-enter it here instead.
      await signIn({ username, password });

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      // Continue based on account type
      if (accountType === "business") {
        navigate("/business-register", {
          replace: true,
          state: { userId, username, email, token },
        });
      } else {
        // You can go to dashboard or login depending on your flow
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Confirm sign-up error:", err);
      setError(err?.message || "Confirmation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    clearMessages();
    setBusy(true);

    try {
      await resendSignUpCode(username);
      setStatus("A new confirmation code has been sent.");
    } catch (err) {
      console.error("Resend code error:", err);
      setError(err?.message || "Could not resend code.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrapper">
      <h1>Food Truck Locator</h1>
      <h2>Confirm Your Email</h2>

      <p className="hint">
        Enter the confirmation code sent to <strong>{email || "your email"}</strong>.
      </p>

      {error && <p className="error">{error}</p>}
      {status && <div className="status">{status}</div>}

      <form onSubmit={handleConfirm}>
        <div className="input-box">
          <input
            type="text"
            placeholder="Confirmation code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={busy}
          />
          <FaLock className="icon" />
        </div>

        <button type="submit" disabled={busy || !code}>
          {busy ? "Confirming..." : "Confirm"}
        </button>

        <button
          type="button"
          className="linkish"
          onClick={handleResend}
          disabled={busy}
        >
          Resend code
        </button>
      </form>
    </div>
  );
}

export default ConfirmSignup;
