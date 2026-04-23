import React, { useEffect, useState } from 'react';
import api from '../../api/client';

// Mock data (temporary until API integration)
const MOCK_BUSINESS = {
  id: '123',
  business_name: 'Gourmet Grillers',
  category: 'American • Burgers • Comfort Food',
  logo: 'https://images.unsplash.com/photo-1565123409695-4b568d44ee4c?auto=format&fit=crop&w=150&q=80',
  coverPhoto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
  description: 'Serving the finest gourmet burgers and loaded fries in the heart of the city. Everything made fresh daily!',
  address: '123 Foodie Ave',
  state: "TX",
  city: "Austin",
  zip: "78701",
  hours: [
    { day: 'Monday', open: '11:00 AM', close: '8:00 PM' },
    { day: 'Tuesday', open: '11:00 AM', close: '8:00 PM' },
    { day: 'Wednesday', open: '11:00 AM', close: '8:00 PM' },
    { day: 'Thursday', open: '11:00 AM', close: '9:00 PM' },
    { day: 'Friday', open: '11:00 AM', close: '10:00 PM' },
    { day: 'Saturday', open: '12:00 PM', close: '10:00 PM' },
    { day: 'Sunday', closed: true },
  ],
  menuItems: [
    {
      id: 'm1',
      name: 'Classic Smash Burger',
      description: 'Double beef patty, American cheese, house sauce on a toasted brioche bun.',
      price: '$12.00',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'm2',
      name: 'Truffle Parmesan Fries',
      description: 'Crispy shoestring fries tossed in truffle oil and parmesan cheese.',
      price: '$6.50',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f39085d2?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'm3',
      name: 'Crispy Chicken Sandwich',
      description: 'Buttermilk fried chicken breast, spicy mayo, pickles, brioche bun.',
      price: '$13.50',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cb6ebd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'm4',
      name: 'Loaded Nachos',
      description: 'Tortilla chips generously topped with melted cheese, jalapeños, and pulled pork.',
      price: '$11.00',
      image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
    }
  ]
};

export default function BusinessProfile({ businessId, data }) {
  const [business, setBusiness] = useState(data || null);

  useEffect(() => {
    // If data is passed directly (preview mode), don't fetch
    if (data) {
      setBusiness(data);
      return;
    }

    const fetchBusinessProfile = async () => {
      try {
        const response = await api.get(`/public/business/profile?business_id=${businessId}`);
        // Default to response.data if it exists, otherwise placeholder MOCK_BUSINESS
        setBusiness(response.data || MOCK_BUSINESS);
      } catch (error) {
        console.error("Error fetching business profile:", error);
        // Fallback for visual testing if api fails
        setBusiness(MOCK_BUSINESS);
      }
    };

    if (businessId) {
      fetchBusinessProfile();
    } else {
      setBusiness(MOCK_BUSINESS);
    }
  }, [businessId, data]);

  if (!business) {
    return <div className="bp-loading-container"><div className="bp-spinner"></div></div>;
  }

  return (
    <div className="business-profile-page">
      {/* Cover and Header */}
      <div
        className="business-cover"
        style={{ backgroundImage: `url(${business.coverPhoto})` }}
      >
        <div className="business-cover-overlay">
          <div className="business-header-glass">
            <img src={business.logo} alt={`${business.business_name} logo`} className="business-logo" />
            <div className="business-header-info">
              <h1>{business.business_name}</h1>
              <p className="business-category">{business.category}</p>
              <div className="business-stats">
              </div>
              <p className="business-location">
                📍 {business.address}, {business.city}, {business.state} {business.zip}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bp-content-wrapper">
        <div className="bp-main-column">
          {/* About Section */}
          <section className="bp-section">
            <h2>About Us</h2>
            <p className="bp-description">{business.description}</p>
          </section>

          {/* Menu Section */}
          <section className="bp-section">
            <h2>Our Menu</h2>
            <div className="menu-grid">
              {business.menuItems?.map((item) => (
                <div key={item.id} className="menu-card">
                  <div
                    className="menu-card-img"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  <div className="menu-card-content">
                    <div className="menu-card-top">
                      <h3>{item.name}</h3>
                      <span className="menu-card-price">{item.price}</span>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="bp-sidebar-column">
          {/* Schedule Section */}
          <div className="bp-schedule-card">
            <h3>Opening Hours</h3>
            <div className="bp-schedule-list">
              {(() => {
                const hoursData = business.hours;
                let displayHours = [];
                if (Array.isArray(hoursData)) {
                  displayHours = hoursData;
                } else if (hoursData && typeof hoursData === 'object') {
                  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                  displayHours = days.map(day => {
                    const val = hoursData[day];
                    if (!val || val === 'Closed') {
                      return { day, closed: true };
                    }
                    const parts = val.split(' - ');
                    return { day, open: parts[0], close: parts[1], closed: false };
                  });
                }

                return displayHours.map((slot, index) => (
                  <div key={index} className={`bp-schedule-row ${slot.day === 'Today' ? 'bp-today' : ''}`}>
                    <span className="bp-day">{slot.day}</span>
                    <span className="bp-times">
                      {slot.closed ? (
                        <span className="bp-closed">Closed</span>
                      ) : (
                        `${slot.open} - ${slot.close}`
                      )}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="bp-contact-card">
            <h3>Contact Info</h3>
            <button className="bp-btn bp-btn-full">Get Directions</button>
            <button className="bp-btn bp-btn-full bp-btn-outline">Send a Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}
