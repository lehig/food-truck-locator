import React from "react";
import { Link } from "react-router-dom";


function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-brand">
          © {new Date().getFullYear()} Lowk Locale
        </span>

        <div className="footer-links">
          <Link to="/for-trucks">For Food Trucks</Link>
          <span className="divider">|</span>
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
