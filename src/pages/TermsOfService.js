import React from "react";
import { TERMS_OF_SERVICE } from "../Components/TOS/TermsOfService"; // adjust path if needed
import "../Components/TOS/TermsOfService.css";
import Layout from "../Components/Layout/Layout";

function TermsOfServicePage() {
  return (
    <Layout>
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
    </Layout>
  );
}

export default TermsOfServicePage;
