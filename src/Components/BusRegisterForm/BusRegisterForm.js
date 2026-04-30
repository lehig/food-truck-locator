import React, { useState } from 'react';

import { useLocation, useNavigate } from "react-router-dom";
import api from '../../api/client';

/**
 * 
 * 
Mock data (temporary until API integration)
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
  schedule: [
    { day: 'Monday', open: '11:00 AM', close: '8:00 PM' },
    { day: 'Tuesday', open: '11:00 AM', close: '8:00 PM' },
    { day: 'Wednesday', open: '11:00 AM', close: '8:00 PM' },
    { day: 'Thursday', open: '11:00 AM', close: '9:00 PM' },
    { day: 'Friday', open: '11:00 AM', close: '10:00 PM' },
    { day: 'Saturday', open: '12:00 PM', close: '10:00 PM' },
    { day: 'Sunday', closed: true },
  ],
  menu: [
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
 */

function BusRegisterForm() {
  const REGISTER_API = "business-register"
  const location = useLocation();
  const { userId, username, email } = location.state || {};
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE;


  const [businessProfile, setBusinessProfile] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hours: {
      Monday: { open: '', close: '', isClosed: false },
      Tuesday: { open: '', close: '', isClosed: false },
      Wednesday: { open: '', close: '', isClosed: false },
      Thursday: { open: '', close: '', isClosed: false },
      Friday: { open: '', close: '', isClosed: false },
      Saturday: { open: '', close: '', isClosed: false },
      Sunday: { open: '', close: '', isClosed: false }
    },
    menuItems: [{ name: '', description: '', price: '' }]
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // --- handlers like in ProfilePage ---

  const handleBusinessChange = (field, value) => {
    setBusinessProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setBusinessProfile(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        },
      },
    }));
  };

  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  const handleMenuItemChange = (index, field, value) => {
    setBusinessProfile(prev => {
      const updated = [...prev.menuItems];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return {
        ...prev,
        menuItems: updated,
      };
    });
  };

  const addMenuItem = () => {
    setBusinessProfile(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, { name: '', description: '', price: '' }],
    }));
  };

  const removeMenuItem = (index) => {
    setBusinessProfile(prev => {
      const updated = [...prev.menuItems];
      updated.splice(index, 1);
      return {
        ...prev,
        menuItems: updated,
      };
    });
  };

  // --- submit ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      return;
    }

    setSaving(true);

    try {
      // Convert hours to array of BusinessHour objects expected by backend
      const hoursArray = Object.entries(businessProfile.hours).map(([day, hrs]) => ({
        day,
        open: hrs.open ? formatTime12h(hrs.open) : "",
        close: hrs.close ? formatTime12h(hrs.close) : "",
        closed: hrs.isClosed || (!hrs.open && !hrs.close)
      }));

      // Geocode address
      let lat = 0;
      let lng = 0;
      const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;
      if (MAPBOX_TOKEN) {
        const addressStr = `${businessProfile.address}, ${businessProfile.city}, ${businessProfile.state} ${businessProfile.zipCode}`.trim();
        try {
          const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressStr)}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData.features && geoData.features.length > 0) {
            lng = geoData.features[0].center[0];
            lat = geoData.features[0].center[1];
          }
        } catch (geoErr) {
          console.error("Geocoding failed:", geoErr);
        }
      }

      const payload = {
        user_id: userId,
        username,
        email,
        business_name: businessProfile.name,
        category: businessProfile.category,
        description: businessProfile.description,
        address: businessProfile.address,
        state: businessProfile.state,
        city: businessProfile.city,
        zip: businessProfile.zipCode,
        hours: hoursArray,
        menu: businessProfile.menuItems.map(item => ({
          name: item.name,
          description: item.description,
          price: item.price
        })),
        // Default empty fields currently unsupported by the form
        logo: '',
        coverPhoto: '',
        lat: lat,
        lng: lng
      };

      console.log("sending payload:", payload);

      const response = await api.post(REGISTER_API,payload);

      console.log("business registration saved:", response.data);
      alert("business info saved successfully... redirecting to login!");
      navigate('/');
    } catch (err) {
      console.error("error saving business info:", err);

      let message = "failed to save business info";

      if (err.response && err.response.data) {
        message = err.response.data.error || message;
      } else if (err.message) {
        message = err.message;
      }

      setError(String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wrapper-bus" style={{ maxWidth: '800px'}}>
        <form className="business-profile-form" onSubmit={handleSubmit}>
          <h2>Business Registration</h2>
          <p className="base-account">
            Base account: {username} ({email})
          </p>

          <label>
            Business Name
            <input
              type="text"
              value={businessProfile.name}
              onChange={e => handleBusinessChange('name', e.target.value)}
              required
            />
          </label>

          <label>
            Category
            <input
              type="text"
              placeholder="e.g. American • Burgers"
              value={businessProfile.category}
              onChange={e => handleBusinessChange('category', e.target.value)}
              required
            />
          </label>

          <label>
            Description
            <textarea
              rows="3"
              value={businessProfile.description}
              onChange={e => handleBusinessChange('description', e.target.value)}
              required
            />
          </label>

          <label>
            Address
            <input
              type="text"
              value={businessProfile.address}
              onChange={e => handleBusinessChange('address', e.target.value)}
              required
            />
          </label>

          <div className="row">
            <label>
              City
              <input
                type="text"
                value={businessProfile.city}
                onChange={e => handleBusinessChange('city', e.target.value)}
                required
              />
            </label>

            <label>
              State
              {/* you can keep this as free text or make it a <select> */}
              <select
                value={businessProfile.state}
                onChange={e => handleBusinessChange('state', e.target.value)}
                required
              >
                <option value="">Select a State</option>
                <option value="ID">Idaho</option>
                <option value="UT">Utah</option>
                <option value="WY">Wyoming</option>
              </select>
            </label>

            <label>
              Zip Code
              <input
                type="text"
                value={businessProfile.zipCode}
                onChange={e => handleBusinessChange('zipCode', e.target.value)}
                required
              />
            </label>
          </div>

          <h3>Hours</h3>
          <div className="hours-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {Object.keys(businessProfile.hours).map(day => {
              const hrs = businessProfile.hours[day];
              return (
              <div key={day} className="hours-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ width: '90px', fontWeight: 'bold' }}>{day}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 0, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hrs.isClosed}
                    onChange={e => handleHoursChange(day, 'isClosed', e.target.checked)}
                    style={{ width: 'auto', marginTop: 0 }}
                  />
                  Closed
                </label>
                {!hrs.isClosed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                    <input
                      type="time"
                      value={hrs.open}
                      onChange={e => handleHoursChange(day, 'open', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={hrs.close}
                      onChange={e => handleHoursChange(day, 'close', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )})}
          </div>

          <h3>Menu Items</h3>
          {businessProfile.menuItems.map((item, index) => (
            <div key={index} className="menu-item-row">
              <input
                type="text"
                placeholder="Name"
                value={item.name}
                onChange={e => handleMenuItemChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={e => handleMenuItemChange(index, 'description', e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={item.price}
                onChange={e => handleMenuItemChange(index, 'price', e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-rmv btn-small"
                onClick={() => removeMenuItem(index)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={addMenuItem}
          >
            + Add Menu Item
          </button>

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%' }}
            >
              {saving ? "Saving..." : "Submit Business Info"}
            </button>
          </div>
        </form>
    </div>
  );
}

export default BusRegisterForm;
