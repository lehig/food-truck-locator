import React from "react";
import { TERMS_OF_SERVICE } from "../Components/TOS/TermsOfService"; // adjust path if needed
import "../Components/TOS/TermsOfService.css";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";

function TermsOfServicePage() {
  return (
    <>
        <Navbar />
        <div className="glass-box">
            <div className="terms-page">
            <h1>{TERMS_OF_SERVICE.title}</h1>
            <p className="last-updated">
                Last Updated: {TERMS_OF_SERVICE.lastUpdated}
            </p>

            {TERMS_OF_SERVICE.sections.map((section, index) => (
                <div key={index} className="terms-section">
                <h2>{section.heading}</h2>
                {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}
                </div>
            ))}
            </div>
        </div>
        <Footer />
    </>
  );
}

export default TermsOfServicePage;
