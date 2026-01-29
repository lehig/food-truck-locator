import React, { useState } from 'react';
import './BusRegisterForm.css';
import { useLocation, useNavigate } from "react-router-dom";
import api from '../../api/client';

function BusRegisterForm() {
  const REGISTER_API = "business-register"
  const location = useLocation();
  const { userId, username, email } = location.state || {};
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE;


  const [businessProfile, setBusinessProfile] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hours: {
      Monday: "",
      Tuesday: "",
      Wednesday: "",
      Thursday: "",
      Friday: "",
      Saturday: "",
      Sunday: ""
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

  const handleHoursChange = (day, value) => {
    setBusinessProfile(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value,
      },
    }));
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
      const payload = {
        user_id: userId,
        username,
        email,
        business_name: businessProfile.name,
        state: businessProfile.state,
        city: businessProfile.city,
        address: businessProfile.address,
        zip_code: businessProfile.zipCode,
        hours: businessProfile.hours,
        menu_items: businessProfile.menuItems,
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
    <div className="wrapper-bus">
      <div className="glass-box">
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
          <div className="hours-grid">
            {Object.keys(businessProfile.hours).map(day => (
              <div key={day} className="hours-row">
                <span>{day}</span>
                <input
                  type="text"
                  placeholder="e.g. 10:00 - 18:00 / Closed"
                  value={businessProfile.hours[day]}
                  onChange={e => handleHoursChange(day, e.target.value)}
                />
              </div>
            ))}
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
                className="btn btn-secondary btn-small"
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
            >
              {saving ? "Saving..." : "Submit Business Info"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusRegisterForm;
