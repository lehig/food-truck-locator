import React from 'react';
import './ForTrucks.css';
import { useNavigate } from 'react-router-dom';

const ForTrucks = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = "For Food Trucks | Lowk - Grow Your Business";
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute("content", "Join Lowk's premier platform for food trucks. Increase your visibility, engage with customers in real-time, and grow your mobile business.");
        }
    }, []);

    const handleGetStarted = () => {
        navigate('/register');
    };

    return (
        <div className="for-trucks-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Elevate Your Food Truck Business</h1>
                    <p className="hero-subtitle">
                        The platform for the starving masses to find your grub.

                        <br />
                        <br />
                        <br />
                        You should join.
                        
                        <br />
                        <br />
                        <br />
                        It's pretty lowk.
                    </p>
                    <button className="cta-button primary" onClick={handleGetStarted}>
                        Join Now
                    </button>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <h2 className="section-title">Why Partner With Us?</h2>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon">📍</div>
                        <h3>Real-Time Visibility</h3>
                        <p>Let customers find your exact location in real-time. No more guessing where the flavor is hiding.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">📢</div>
                        <h3>Direct Engagement</h3>
                        <p>Send notifications to your followers when you're nearby or running a special promotion.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">✨</div>
                        <h3>Premium Profile</h3>
                        <p>Showcase your menu, photos, and social links in a professional, easy-to-read profile.</p>
                    </div>
                </div>

            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2 className="section-title">Get Rolling in 3 Steps</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Create Your Free Account</h3>
                        <p>Sign up and tell us about your truck, your menu, and your vibe.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Verify Your Business</h3>
                        <p>A quick verification process ensures our platform stays high-quality and trusted.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Go Live</h3>
                        <p>Set your location on the map and start serving your hungry fans!</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="final-cta">
                <div className="cta-card">
                    <h2>Ready to Take Your Truck to the Next Level?</h2>
                    <p>Join today and help build the best food truck community.</p>
                    <button className="cta-button secondary" onClick={handleGetStarted}>
                        Get Started Today
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ForTrucks;
