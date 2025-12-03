import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const stored = sessionStorage.getItem('ftlUser');
  const user = stored ? JSON.parse(stored) : null;
  const API_BASE_URL = 'https://1pdtxa0shi.execute-api.us-east-1.amazonaws.com/dev';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Flag for "no business row exists yet"
  const [needsRegistration, setNeedsRegistration] = useState(false);

  // Business profile state
  const [businessProfile, setBusinessProfile] = useState({
    businessID: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hours: {
      Monday: '',
      Tuesday: '',
      Wednesday: '',
      Thursday: '',
      Friday: '',
      Saturday: '',
      Sunday: ''
    },
    menuItems: [
      { name: '', description: '', price: '' }
    ]
  });

  // Customer messages state
  const [messages, setMessages] = useState([]);

  const isBusiness = user?.role === 'business';
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view your profile.');
      setLoading(false);
      return;
    }

    if (isBusiness) {
      loadBusinessProfile();
    } else if (isCustomer) {
      loadCustomerMessages();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBusinessProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setNeedsRegistration(false);

      const res = await axios.get(
        `${API_BASE_URL}/business/profile`,
        { params: { username: user.username } }  // <-- username as PK
      );

      const data = res.data || {};

      // If backend returns 200 with an error body: { "error": "business not found" }
      if (data.error === 'business not found') {
        setNeedsRegistration(true);
        setLoading(false);
        return;
      }

      setBusinessProfile({
        username: data.username || user.username,
        userID: data.userID || user.userID,
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        hours: {
          Monday: data.hours?.Monday || '',
          Tuesday: data.hours?.Tuesday || '',
          Wednesday: data.hours?.Wednesday || '',
          Thursday: data.hours?.Thursday || '',
          Friday: data.hours?.Friday || '',
          Saturday: data.hours?.Saturday || '',
          Sunday: data.hours?.Sunday || '',
        },
        menuItems: (data.menuItems && data.menuItems.length > 0)
          ? data.menuItems
          : [{ name: '', description: '', price: '' }],
      });
    } catch (err) {
      console.error('Error loading business profile:', err);

      // If backend returns a 404 for missing business
      if (err.response && err.response.status === 404) {
        setNeedsRegistration(true);
      } else {
        setError('Failed to load business profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerMessages = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        `${API_BASE_URL}/messages`,
        { params: { customerID: user.userID } } // <-- user_id
      );

      setMessages(res.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessChange = (field, value) => {
    setBusinessProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day, value) => {
    setBusinessProfile(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  const handleMenuItemChange = (index, field, value) => {
    setBusinessProfile(prev => {
      const updated = [...prev.menuItems];
      updated[index] = {
        ...updated[index],
        [field]: field === 'price' ? value : value
      };
      return { ...prev, menuItems: updated };
    });
  };

  const addMenuItem = () => {
    setBusinessProfile(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, { name: '', description: '', price: '' }]
    }));
  };

  const removeMenuItem = (index) => {
    setBusinessProfile(prev => {
      const updated = prev.menuItems.filter((_, i) => i !== index);
      return { ...prev, menuItems: updated.length ? updated : [{ name: '', description: '', price: '' }] };
    });
  };

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...businessProfile,
        username: user.username,
        userID: user.userID,
        menuItems: businessProfile.menuItems.map(mi => ({
          ...mi,
          price: mi.price === '' ? 0 : parseFloat(mi.price),
        })),
      };

      await axios.put(`${API_BASE_URL}/business/profile`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Profile saved!');
    } catch (err) {
      console.error('Error saving business profile:', err);
      setError('Failed to save profile.');
    }
  };

  const handleGoToBusinessRegistration = () => {
    // 🔁 Change '/business-register' to your actual BusRegisterForm route
    navigate('/business-register', {
      state: {
        userId: user.userID,
        username: user.username,
        email: user.email,
      },
    });
  };

  const handleGoToDashboard = () => {
    // 🔁 change '/dashboard' to whatever your actual route is
    navigate('/dashboard', {
        state: {
        userID: user.userID,
        username: user.username,
        email: user.email,
        },
    });
    };


  if (loading) {
    return <div className="profile-page"><p>Loading...</p></div>;
  }

  // Only treat error as a hard stop if we are NOT in the "needs registration" state
  if (error && !needsRegistration) {
    return <div className="profile-page"><p className="error">{error}</p></div>;
  }

  if (!user) {
    return <div className="profile-page"><p>Please log in.</p></div>;
  }

  return (
    <div className="profile-page">
        <div className="glass-box profile-header">
            <div className="profile-header-main">
                <h1>Profile</h1>
                <p>
                Logged in as: <strong>{user.username}</strong> ({user.role})
                </p>
            </div>
            <div className="profile-header-actions">
                <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGoToDashboard}
                >
                Back to Dashboard
                </button>
            </div>
        </div>


      {isBusiness && needsRegistration && (
        <div className="business-registration-cta">
            <h2>No business profile found</h2>
            <p>
                We couldn&apos;t find a business entry linked to your account.
                To appear in searches and let customers find you, please register your business.
            </p>
            <button
            type="button"
            className="btn btn-primary"
            onClick={handleGoToBusinessRegistration}
            >
                Register My Business
            </button>

        </div>
      )}

      {isBusiness && !needsRegistration && (
        <div className='glass-box'>
            <form className="business-profile-form" onSubmit={handleSaveBusiness}>
            <h2>Business Profile</h2>

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
                />
            </label>

            <div className="row">
                <label>
                City
                <input
                    type="text"
                    value={businessProfile.city}
                    onChange={e => handleBusinessChange('city', e.target.value)}
                />
                </label>
                <label>
                State
                <input
                    type="text"
                    value={businessProfile.state}
                    onChange={e => handleBusinessChange('state', e.target.value)}
                />
                </label>
                <label>
                Zip Code
                <input
                    type="text"
                    value={businessProfile.zipCode}
                    onChange={e => handleBusinessChange('zipCode', e.target.value)}
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
                    placeholder="e.g. 10:00 - 18:00"
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

            <button type="button" className="btn btn-secondary" onClick={addMenuItem}>
                + Add Menu Item
            </button>

            <div className="actions">
                <button type="submit" className="btn btn-primary">
                    Save Profile
                </button>
            </div>

            </form>
        </div>
      )}

      {isCustomer && (
        <div className='glass-box'>
            <div className="customer-messages">
                <h2>Messages from Businesses</h2>
                {messages.length === 0 ? (
                    <p>No messages yet.</p>
                ) : (
                    <ul className="messages-list">
                    {messages.map((msg, idx) => (
                        <li key={`${msg.customerID}-${msg.createdAt}-${idx}`} className="message-card">
                        <div className="message-header">
                            <strong>{msg.subject || 'No subject'}</strong>
                            <span className="message-date">{msg.createdAt}</span>
                        </div>
                        <p className="message-body">{msg.body}</p>
                        <small>From business: {msg.businessID}</small>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        </div>
      )}

      {!isBusiness && !isCustomer && (
        <p>Your account doesn’t have a role yet. Talk to the admin / adjust your seed data.</p>
      )}
    </div>
  );
}

export default ProfilePage;
