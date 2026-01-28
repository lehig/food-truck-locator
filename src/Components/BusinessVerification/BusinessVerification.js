import React, { useEffect } from "react";
import "./BusinessVerification.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaClock } from "react-icons/fa";

function BusinessVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const { userId, username, email, token } = location.state || {};

  useEffect(() => {
    // Prevent direct navigation without state (same pattern as your confirm page)
    if (!username) {
      navigate("/login", { replace: true });
      return;
    }

    // Optional: persist a minimal session object so refresh doesn't break the UX
    // (Only do this if you already store ftlUser similarly elsewhere.)
    const existing = sessionStorage.getItem("ftlUser");
    if (!existing) {
      sessionStorage.setItem(
        "ftlUser",
        JSON.stringify({
          userID: userId,
          username,
          email,
          role: "unverified-business",
          token,
        })
      );
    }
  }, [username, navigate, userId, email, token]);

  const handleGoDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleGoLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="wrapper">
        <h1 className="verify-title">Food Truck Locator</h1>

        <div className="verify-badge">
            <FaCheckCircle className="verify-icon" />
            <h2>Thanks, {username}.</h2>
        </div>

        <p className="verify-lead">
            Your email has been confirmed. Your business account is now pending manual approval.
        </p>

        <div className="verify-panel">
            <div className="verify-row">
            <FaClock className="mini-icon" />
            <div>
                <div className="verify-row-title">Verification timeline</div>
                <div className="verify-row-text">We will review and verify your business within 24–48 hours.</div>
            </div>
            </div>

            <div className="verify-row">
            <div className="verify-row-dot" />
            <div>
                <div className="verify-row-title">What happens next</div>
                <div className="verify-row-text">
                We’ll reach out to <strong>{email}</strong> if we need additional details.
                Once verified, you’ll gain access to business features like messaging and profile management.
                </div>
            </div>
            </div>
        </div>

        <div className="verify-actions">
            <button className="primary" onClick={handleGoDashboard}>
            Go to Dashboard
            </button>
            <button className="secondary" onClick={handleGoLogin}>
            Back to Login
            </button>
        </div>

        <p className="verify-footnote">
            <strong>Please Note:</strong> If you believe this is a mistake or need expedited verification, contact support.
        </p>
    </div>
  );
}

export default BusinessVerification;
