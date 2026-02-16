import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { signOut } from "../../auth/cognito";
import logo from "../../assets/FTL-favicon.png"; // adjust path if needed

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Single source of truth: sessionStorage
  const user = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("ftlUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const isLoggedIn = Boolean(user);
  const role = user?.role ?? null;

  const isBusiness =
    role === "business" || role === "unverified-business";

  const handleLogout = async () => {
    setIsMenuOpen(false);
    sessionStorage.removeItem("ftlUser");
    try {
      await signOut();
    } catch {
      // swallow errors so logout always succeeds locally
    }
    navigate("/");
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (event) => {
    if (event.target.closest("a")) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img
            src={logo}
            alt="Food Truck Locator logo"
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">
            Food Truck Locator
          </span>
        </Link>
      </div>

      <button
        className="navbar-menu-btn"
        type="button"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        {isMenuOpen ? "Close" : "Menu"}
      </button>

      <div
        className={`navbar-right ${isMenuOpen ? "is-open" : ""}`}
        onClick={handleNavClick}
      >
        {/* Always visible */}
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>

        {/* Authenticated users */}
        {isLoggedIn && (
          <>
            <Link to="/dashboard">Dashboard</Link>

            {isBusiness && (
              <>
                <Link to="/messages">Send Message</Link>
                <Link to="/support">Technical Support</Link>
              </>
            )}

            <button
              className="logout-nav-btn"
              onClick={handleLogout}
            >
              <strong>Logout</strong>
            </button>
          </>
        )}

        {/* Guests only */}
        {!isLoggedIn && (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
