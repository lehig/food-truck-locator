import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-brand">
          © {new Date().getFullYear()} Food Truck Locator
        </span>

        <div className="footer-links">
          <Link to="/tos">Terms of Service</Link>
          <span className="divider">|</span>
          <Link to="/privacy">Privacy Policy</Link>
          <span className="divider">|</span>
          <Link to="/contact">Contact Me</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
