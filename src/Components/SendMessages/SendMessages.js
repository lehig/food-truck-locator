import React, { useState } from 'react';
import './SendMessages.css';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

function SendMessages() {
  const stored = sessionStorage.getItem('ftlUser');
  const user = stored ? JSON.parse(stored) : null;
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE;

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) {
    return (
      <div className="messages-page">
        <div className="glass-box">
          <h2>Not Logged In</h2>
          <p>You must be logged in to send messages.</p>
          <button
            className="primary-button"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSending(true);

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();

    if (!trimmedSubject || !trimmedBody) {
      setError('Subject and message cannot be empty.')
      setSending(false);
      return;
    }
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      setSending(false);
      return;
    }

    try {
      await api.post('/messages/broadcast', 
        { 
          subject: trimmedSubject,
          body: trimmedBody,
          busName: user.username,
        },
        {
          params: {
            businessID: user.userID,
          },
        }
      );

      setSuccessMessage('Message sent successfully!');
      setSubject('');
      setBody('');
      // keep recipient so they can send multiple messages to same person
    } catch (err) {
      console.error('Error sending message:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to send message. Please try again.';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard', { state: { userID: user.userID, username: user.username, email: user.email } });
  };

  return (
    <div className="messages-page">
      {/* Top profile/header box */}
      <div className="glass-box header-box">
        <div className="header-main">
          <div>
            <h1>Business Messages</h1>
            <p className="subtitle">
              Logged in as <span className="highlight">{user.username}</span>
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Message form */}
      <div className="glass-box">
        <form className="send-message-form" onSubmit={handleSubmit}>
          <h2>Send a Message to your customers</h2>

          {error && <div className="error">{error}</div>}
          {successMessage && <div className="success">{successMessage}</div>}

          <label>
            Subject
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              required
            />
          </label>

          <label>
            Message
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              required
            />
          </label>

          <div className="actions">
            <button
              type="submit"
              className="primary-button"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendMessages;
