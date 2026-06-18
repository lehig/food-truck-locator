import React, { useState, useEffect } from 'react';
import './ForTrucks.css';
import { useNavigate } from 'react-router-dom';

const translations = {
    en: {
        title: "For Food Trucks | Lowk - Grow Your Business",
        metaDescription: "Join Lowk's premier platform for food trucks. Increase your visibility, engage with customers in real-time, and grow your mobile business.",
        heroTitle: "Elevate Your Food Truck Business",
        heroSubtitleLine1: "The platform for the starving masses to find your grub.",
        heroSubtitleLine2: "You should join.",
        heroSubtitleLine3: "It's pretty lowk.",
        joinNow: "Join Now",
        whyPartner: "Why Partner With Us?",
        benefit1Title: "Real-Time Visibility",
        benefit1Desc: "Let customers find your exact location in real-time. No more guessing where the flavor is hiding.",
        benefit2Title: "Direct Engagement",
        benefit2Desc: "Send notifications to your followers when you're nearby or running a special promotion.",
        benefit3Title: "Premium Profile",
        benefit3Desc: "Showcase your menu, photos, and social links in a professional, easy-to-read profile.",
        getRolling: "Get Rolling in 3 Steps",
        step1Title: "Create Your Free Account",
        step1Desc: "Sign up and tell us about your truck, your menu, and your vibe.",
        step2Title: "Verify Your Business",
        step2Desc: "A quick verification process ensures our platform stays high-quality and trusted.",
        step3Title: "Go Live",
        step3Desc: "Set your location on the map and start serving your hungry fans!",
        ctaTitle: "Ready to Take Your Truck to the Next Level?",
        ctaDesc: "Join today and help build the best food truck community.",
        getStarted: "Get Started Today"
    },
    es: {
        title: "Para Food Trucks | Lowk - Crece Tu Negocio",
        metaDescription: "Únese a la plataforma líder de Lowk para food trucks. Aumenta su visibilidad, interactúa con sus clientes en tiempo real y haz crecer su negocio móvil.",
        heroTitle: "Eleva su Negocio de Food Truck",
        heroSubtitleLine1: "La plataforma para que las masas hambrientas encuentren su comida.",
        heroSubtitleLine2: "Debería unirse.",
        heroSubtitleLine3: "Es bastante lowk.",
        joinNow: "Únete Ahora",
        whyPartner: "¿Por qué asociar con nosotros?",
        benefit1Title: "Visibilidad en Tiempo Real",
        benefit1Desc: "Permite que los clientes encuentren su ubicación exacta en tiempo real. Se acabó el adivinar dónde se esconde el sabor.",
        benefit2Title: "Interacción Directa",
        benefit2Desc: "Envía notificaciones a sus seguidores cuando estés cerca o tenga una promoción especial.",
        benefit3Title: "Perfil Premium",
        benefit3Desc: "Muestra su menú, fotos y enlaces sociales en un perfil profesional y fácil de leer.",
        getRolling: "Empieza a rodar en 3 pasos",
        step1Title: "Crea su Cuenta Gratis",
        step1Desc: "Regístra y cuéntanos sobre su camión, su menú y su estilo.",
        step2Title: "Verifica su Negocio",
        step2Desc: "Un proceso de verificación rápido garantiza que nuestra plataforma siga siendo confiable y de alta calidad.",
        step3Title: "Transmite en Vivo",
        step3Desc: "Establece su ubicación en el mapa y ¡comienza a atender a sus hambrientos fans!",
        ctaTitle: "¿Listo para llevar su camión al siguiente nivel?",
        ctaDesc: "¡Únase hoy y ayuda a construir la mejor comunidad de food trucks!",
        getStarted: "¡Comenzar Hoy!"
    }
};

const ForTrucks = () => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState('en');

    const t = translations[language];

    useEffect(() => {
        document.title = t.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute("content", t.metaDescription);
        }
    }, [language, t]);

    const handleGetStarted = () => {
        navigate('/register');
    };

    return (
        <div className="for-trucks-container">
            {/* Language Selector */}
            <div className="language-selector-container">
                <div className="language-toggle">
                    <input 
                        type="radio" 
                        id="lang-en" 
                        name="language" 
                        value="en" 
                        checked={language === 'en'} 
                        onChange={() => setLanguage('en')}
                    />
                    <label htmlFor="lang-en">English</label>
                    
                    <input 
                        type="radio" 
                        id="lang-es" 
                        name="language" 
                        value="es" 
                        checked={language === 'es'} 
                        onChange={() => setLanguage('es')}
                    />
                    <label htmlFor="lang-es">Español</label>
                    <div className="toggle-slider"></div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">{t.heroTitle}</h1>
                    <p className="hero-subtitle">
                        {t.heroSubtitleLine1}
                        <br />
                        {t.heroSubtitleLine2}
                        <br />
                        {t.heroSubtitleLine3}
                    </p>
                    <button className="cta-button primary" onClick={handleGetStarted}>
                        {t.joinNow}
                    </button>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <h2 className="section-title">{t.whyPartner}</h2>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon">📍</div>
                        <h3>{t.benefit1Title}</h3>
                        <p>{t.benefit1Desc}</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">📢</div>
                        <h3>{t.benefit2Title}</h3>
                        <p>{t.benefit2Desc}</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">✨</div>
                        <h3>{t.benefit3Title}</h3>
                        <p>{t.benefit3Desc}</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2 className="section-title">{t.getRolling}</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>{t.step1Title}</h3>
                        <p>{t.step1Desc}</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>{t.step2Title}</h3>
                        <p>{t.step2Desc}</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>{t.step3Title}</h3>
                        <p>{t.step3Desc}</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="final-cta">
                <div className="cta-card">
                    <h2>{t.ctaTitle}</h2>
                    <p>{t.ctaDesc}</p>
                    <button className="cta-button secondary" onClick={handleGetStarted}>
                        {t.getStarted}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ForTrucks;
