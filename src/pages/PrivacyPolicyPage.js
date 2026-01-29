import React from "react";
import { PRIVACY_POLICY } from "../Components/PrivacyPolicy/PrivacyPolicy"; // adjust path if needed
import "../Components/PrivacyPolicy/PrivacyPolicy.css";
import Layout from "../Components/Layout/Layout";

function PrivacyPolicyPage() {
  return (
    <Layout>
        <div className="privacy-page">
            <div className="glass-box">
                <h1>{PRIVACY_POLICY.title}</h1>
                <p className="last-updated">
                    Last Updated: {PRIVACY_POLICY.lastUpdated}
                </p>

                {PRIVACY_POLICY.sections.map((section, index) => (
                    <div key={index} className="privacy-section">
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

export default PrivacyPolicyPage;
