import React, { useMemo, useState } from "react";
import "./Contact.css";
// import axios from "axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", msg: "" });
  const [sending, setSending] = useState(false);

  const topics = useMemo(
    () => ["General", "Collaboration", "Job Opportunity", "Speaking", "Other"],
    []
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status.type) setStatus({ type: "", msg: "" });
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    // simple email sanity check
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!okEmail) return "Please enter a valid email address.";
    if (!form.message.trim()) return "Please enter a message.";
    if (form.message.trim().length < 10) return "Message is a bit short—add a little more detail.";
    return "";
  };

  const buildMailto = () => {
    // TODO: replace with your preferred contact address
    const to = "lehigraciaiii@gmail.com";

    const subject = `[Contact] ${form.topic} — ${form.name}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Topic: ${form.topic}`,
      "",
      form.message,
    ].join("\n");

    const enc = (s) => encodeURIComponent(s);
    return `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setStatus({ type: "error", msg: err });
      return;
    }

    setSending(true);
    setStatus({ type: "", msg: "" });

    try {
      // OPTION A (no backend yet): mailto fallback
      window.location.href = buildMailto();
      setStatus({ type: "success", msg: "Opening your email client…" });

      // OPTION B (when you have an API):
      // const API_BASE = process.env.REACT_APP_API_BASE;
      // await axios.post(`${API_BASE}/contact`, form);
      // setStatus({ type: "success", msg: "Message sent! Thanks for reaching out." });
      // setForm({ name: "", email: "", topic: "General", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        msg: "Something went wrong while sending. Please try again or use the email link below.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-box">
      <div className="contact-header">
        <h1>Contact</h1>
        <p>
          Want to connect? Send a message here for collaborations, opportunities, or general questions.
        </p>
      </div>

        <div className="contact-grid">
          <div className="contact-left">
            <h2>Reach out</h2>
            <p className="muted">
              I read every message. If it’s time-sensitive, email is best.
            </p>

            <div className="contact-links">
              <a className="link" href="mailto:lehigraciaiii@gmail.com">
                lehigraciaiii@gmail.com
              </a>
              <div className="link-row">
                <a className="pill" href="https://www.linkedin.com/in/lehi-gracia-966196273/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a className="pill" href="https://github.com/lehig" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a className="pill" href="/" >
                  Home
                </a>
              </div>
            </div>

            {/* 
            <div className="note">
              <strong>Note:</strong> This form uses a mailto fallback by default. If you prefer an in-app send,
              wire it to an API endpoint and switch to the axios block.
            </div> 
            */}
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="row">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>

              <label>
                Email
                <input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </label>
            </div>

            <label>
              Topic
              <select value={form.topic} onChange={(e) => handleChange("topic", e.target.value)}>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Message
              <textarea
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="What would you like to talk about?"
                rows={7}
              />
            </label>

            {status.type && (
              <div className={`status ${status.type}`}>
                {status.msg}
              </div>
            )}

            <div className="actions">
              <button className="con-primary contact-btn" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </button>

              <button
                type="button"
                className="contact-btn"
                onClick={() => setForm({ name: "", email: "", topic: "General", message: "" })}
                disabled={sending}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

    </div>
  );
}
