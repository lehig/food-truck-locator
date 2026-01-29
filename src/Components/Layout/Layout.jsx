import React from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Layout.css";

export default function Layout({
  children,
  showNavbar = true,
  showFooter = true,
  navbarProps = {},
  footerProps = {},
}) {
  return (
    <div className="app-layout">
      {showNavbar && <Navbar {...navbarProps} />}

      <main className="app-content">
        {children}
      </main>

      {showFooter && <Footer {...footerProps} />}
    </div>
  );
}
