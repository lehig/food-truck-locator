// ContactPage.js
import React, { useMemo, useState } from "react";
import "./Support.css";
import axios from "axios";

export default function Support() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE; // e.g. https://.../dev
  const SUPPORT_EMAIL = "support@streetfoodlocator.net"; // change this

  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "Bug Report",
    message: "",
  });

  const [files, setFiles] = useState([]); // File[]
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalSizeMb = useMemo(() => {
    const bytes = files.reduce((sum, f) => sum + f.size, 0);
    return bytes / (1024 * 1024);
  }, [files]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setError("");
    setSuccess("");

    const incoming = Array.from(e.target.files || []);
    // Optional: keep only images + limit count
    const imagesOnly = incoming.filter((f) => f.type.startsWith("image/"));
    const limited = imagesOnly.slice(0, 5); // max 5

    setFiles(limited);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!form.email.trim()) return "Please include your email so I can reply.";
    if (!form.message.trim()) return "Please describe your message/issue.";
    if (files.length > 0 && totalSizeMb > 10) return "Please keep attachments under 10MB total.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    if (!API_BASE_URL) {
      setError("Missing API base URL configuration.");
      return;
    }

    // Build multipart/form-data payload
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("topic", form.topic);
    fd.append("message", form.message);

    files.forEach((f) => fd.append("attachments", f)); // backend should read "attachments"

    try {
      setSending(true);

      // If you don’t have the backend yet, you can comment this out for now.
      await axios.post(`${API_BASE_URL}/contact`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Thanks! Your message was sent.");
      setForm({ name: "", email: "", topic: "Bug Report", message: "" });
      setFiles([]);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong sending your message. You can email me instead."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="glass-box">
        <h1>Contact</h1>
        <p>
          Have feedback, found a bug, or want to get in touch? Send a message below.
          If you’re reporting a bug, screenshots help a lot.
        </p>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="row">
            <label>
              Your Name (optional)
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Jane Doe"
              />
            </label>

            <label>
              Your Email *
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <label>
            Topic
            <select
              value={form.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
            >
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Business Support</option>
              <option>General Question</option>
            </select>
          </label>

          <label>
            Message *
            <textarea
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Tell me what happened. If it’s a bug, include steps to reproduce + what you expected."
              rows={6}
              required
            />
          </label>

          <div className="attachments">
            <label className="file-label">
              Attach screenshots (optional, up to 5 images)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </label>

            {files.length > 0 && (
              <div className="file-list">
                {files.map((f, i) => (
                  <div className="file-pill" key={`${f.name}-${i}`}>
                    <span className="file-name">{f.name}</span>
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => removeFile(i)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <p className="file-hint">
                  Total: {totalSizeMb.toFixed(2)}MB (limit 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </button>

            <a className="email-fallback" href={`mailto:${SUPPORT_EMAIL}`}>
              Prefer email? {SUPPORT_EMAIL}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
