import React, { useEffect, useState, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import BusinessProfile from '../BusinessProfile/BusinessProfile';
import { FaList, FaImage } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ImageUpload from '../ImageUpload/ImageUpload';


const formatTimestamp = (isoString) => {
  if (!isoString) return '';

  const date = new Date(isoString); // parses "2025-12-11T06:57:04Z" as UTC

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',   // "Dec"
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/Boise', // or omit this to use the user's local timezone
  });
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':');
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minute} ${ampm}`;
};

const parseTimeTo24h = (timeStr) => {
  if (!timeStr || timeStr === 'N/A' || timeStr === 'Closed') return '';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '';
  let [, hours, minutes, ampm] = match;
  let h = parseInt(hours, 10);
  if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
  if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${minutes}`;
};

const parseHoursString = (str) => {
  if (!str || str === 'Closed') return { open: '', close: '', isClosed: true };
  const parts = str.split(' - ');
  return {
    open: parseTimeTo24h(parts[0]),
    close: parseTimeTo24h(parts[1] || ''),
    isClosed: false
  };
};

function ProfilePage() {
  const stored = sessionStorage.getItem('ftlUser');
  const user = stored ? JSON.parse(stored) : null;
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Flag for "no business row exists yet"
  const [needsRegistration, setNeedsRegistration] = useState(false);

  // Go Live state
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // Mapbox initialization
  useEffect(() => {
    if (showMapModal && mapContainer.current && !mapRef.current) {
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY || '';

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [mapCoords.lng, mapCoords.lat],
        zoom: 16
      });

      map.on('move', () => {
        const center = map.getCenter();
        setMapCoords({ lat: center.lat, lng: center.lng });
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      mapRef.current = map;
    }

    return () => {
      if (!showMapModal && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapModal]); // Remove mapCoords from dependencies to prevent infinite re-renders

  // Business profile state
  const [businessProfile, setBusinessProfile] = useState({
    businessID: '',
    business_name: '',
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
    category: '',
    description: '',
    instagram: '',
    logo: '',
    menuType: 'text',
    menuImage: '',
    menuItems: [
      { name: '', description: '', price: '' }
    ]
  });

  // Customer messages state
  const [messages, setMessages] = useState([]);

  const [effectiveUser, setEffectiveUser] = useState(user);

  const isBusiness = user?.role === 'business';
  const isCustomer = user?.role === 'customer';
  const isUnverified = user?.role === 'unverified-business';

  const fetchAndPersistRole = async () => {
    // If we already have role, nothing to do
    if (!effectiveUser || effectiveUser.role) return effectiveUser;
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      return effectiveUser;
    }

    try {
      // You need a backend route that returns: { role: "customer" | "business" | "unverified-business" }
      // It should use the JWT to identify the user (best), or accept username (temporary).
      const res = await api.get('/account-type', { params: { userID: effectiveUser.userID } });

      const fetchedRole = res.data?.role;
      if (!fetchedRole) return effectiveUser;

      const updated = { ...effectiveUser, role: fetchedRole };

      sessionStorage.setItem('ftlUser', JSON.stringify(updated));
      setEffectiveUser(updated);

      return updated;
    } catch (err) {
      console.error('Failed to fetch account type:', err);
      // Don’t hard fail; just continue without role
      return effectiveUser;
    }
  };

  useEffect(() => {
    const boot = async () => {
      if (!effectiveUser) {
        setError('You must be logged in to view your profile.');
        setLoading(false);
        return;
      }
      if (!API_BASE_URL) {
        setError('Missing API base URL configuration.');
        setLoading(false);
        return;
      }

      setError('');
      setLoading(true);

      const u = await fetchAndPersistRole();
      const r = u?.role;

      if (r === 'business') {
        await loadBusinessProfile(u);
      } else if (r === 'customer') {
        await loadCustomerMessages(u);
      } else {
        // unverified or unknown
        setLoading(false);
      }
    };

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBusinessProfile = async (u = effectiveUser) => {
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setNeedsRegistration(false);

      const res = await api.get('/business/profile', { params: { username: u.username } });

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
        business_name: data.business_name || '',
        category: data.category || '',
        description: data.description || '',
        instagram: data.instagram || '',
        logo: data.logo || '',
        menuType: data.menuType || 'text',
        menuImage: data.menuImage || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || data.zip || '',
        hours: (() => {
          const hoursObj = {
            Monday: { open: '', close: '', isClosed: true },
            Tuesday: { open: '', close: '', isClosed: true },
            Wednesday: { open: '', close: '', isClosed: true },
            Thursday: { open: '', close: '', isClosed: true },
            Friday: { open: '', close: '', isClosed: true },
            Saturday: { open: '', close: '', isClosed: true },
            Sunday: { open: '', close: '', isClosed: true }
          };

          if (Array.isArray(data.hours)) {
            data.hours.forEach(slot => {
              if (slot.day && hoursObj[slot.day]) {
                hoursObj[slot.day] = {
                  open: parseTimeTo24h(slot.open),
                  close: parseTimeTo24h(slot.close),
                  isClosed: slot.closed
                };
              }
            });
          } else if (data.hours && typeof data.hours === 'object') {
            // Fallback for legacy object-of-strings format
            Object.entries(data.hours).forEach(([day, val]) => {
              if (hoursObj[day]) {
                hoursObj[day] = typeof val === 'string' ? parseHoursString(val) : val;
              }
            });
          }
          return hoursObj;
        })(),
        menuItems: (data.menuItems && data.menuItems.length > 0)
          ? data.menuItems.map(mi => ({
            name: mi.name ?? '',
            description: mi.description ?? '',
            price: mi.price == null ? '' : String(mi.price), // force string
          }))
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
      setIsDirty(false);
    }
  };

  const loadCustomerMessages = async (u = effectiveUser) => {
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.get('/messages', { params: { customerID: u.userID } });

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
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const handleMenuItemChange = (index, field, value) => {
    setBusinessProfile(prev => {
      const updated = [...prev.menuItems];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, menuItems: updated };
    });
    setIsDirty(true);
  };

  const addMenuItem = () => {
    setBusinessProfile(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, { name: '', description: '', price: '' }]
    }));
    setIsDirty(true);
  };

  const removeMenuItem = (index) => {
    setBusinessProfile(prev => {
      const updated = prev.menuItems.filter((_, i) => i !== index);
      return { ...prev, menuItems: updated.length ? updated : [{ name: '', description: '', price: '' }] };
    });
    setIsDirty(true);
  };

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setError('');

    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      return;
    }

    try {
      // Format hours as an array of objects for the API (matching Go models)
      const hoursArray = Object.entries(businessProfile.hours).map(([day, hrs]) => ({
        day,
        open: hrs.open ? formatTime12h(hrs.open) : "",
        close: hrs.close ? formatTime12h(hrs.close) : "",
        closed: hrs.isClosed || (!hrs.open && !hrs.close)
      }));

      // Geocode address
      let lat = businessProfile.lat || 0;
      let lng = businessProfile.lng || 0;
      const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;
      if (MAPBOX_TOKEN && businessProfile.address) {
        const addressStr = `${businessProfile.address}, ${businessProfile.city}, ${businessProfile.state} ${businessProfile.zipCode || ''}`.trim();
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
        ...businessProfile,
        username: user.username,
        userID: user.userID,
        hours: hoursArray,
        category: businessProfile.category,
        description: businessProfile.description,
        instagram: businessProfile.instagram,
        logo: businessProfile.logo,
        menuType: businessProfile.menuType,
        menuImage: businessProfile.menuImage,
        menuItems: businessProfile.menuType === 'text' ? businessProfile.menuItems.map(mi => ({
          ...mi,
          price: mi.price === '' || mi.price == null ? '' : String(mi.price).trim(),
        })) : [],
        lat: lat,
        lng: lng
      };

      await api.put('/business/profile', payload);

      alert('Profile saved!');
      setIsDirty(false);
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

  const submitGoLive = async (lat, lng) => {
    try {
      setLocationLoading(true);
      await api.post('/business/live', {
        userID: user.userID,
        username: user.username,
        lat: lat,
        lng: lng,
        durationHours: 4
      });
      alert("You are now live! Your location will be broadcasted for the next 4 hours.");
      setShowMapModal(false);
    } catch (err) {
      console.error('Error going live:', err);
      alert("Failed to go live. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleGoLive = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Always prompt with Mapbox to confirm location before going live
        setMapCoords({ lat: latitude, lng: longitude });
        setShowMapModal(true);
        setLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleGoToLogin = () => {
    navigate('/')
  }

  const handleGoToDashboard = () => {
    // 🔁 change '/dashboard' to whatever your actual route is
    if (user) {
      navigate('/dashboard', {
        state: {
          userID: user.userID,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      // Fallback if no user in sessionStorage; Dashboard can handle "guest" or redirect
      navigate('/dashboard');
    }

  };

  if (loading) {
    return <div className="bp-loading-container"><div className="bp-spinner"></div></div>;
  }

  // Only treat error as a hard stop if we are NOT in the "needs registration" state
  if (error && !needsRegistration) {
    return (
      <div className="profile-page">
        <p className="error">{error}</p>
        <div className='buttons'>
          <button
            type='button'
            className='btn btn-primary'
            onClick={handleGoToDashboard}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGoToLogin}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <p>Please log in.</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleGoToDashboard}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className='glass-box'>
        <div className="">
          <h1>Profile</h1>
          <p>
            Logged in as: <strong>{user.username}</strong> ({user.role})
          </p>
        </div>
      </div>

      {isUnverified && (
        <div className="glass-box">

          <h2>Business Verification Pending</h2>
          <p>
            Your email has been confirmed, and your business account is pending manual approval.
            We will review your account and reach out within <strong>24–48 hours</strong>.
          </p>

          <p style={{ marginTop: "12px" }}>
            During this time, business features (messaging, profile visibility, and search listings) are disabled.
          </p>

          <p style={{ marginTop: "12px" }}>
            If you have any questions or concerns please reach out to <a href='/support'>technical support</a>.
          </p>

          <div className="actions" style={{ marginTop: "18px" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGoToDashboard}
            >
              Back to Dashboard
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGoToLogin}
              style={{ marginLeft: "10px" }}
            >
              Go to Login
            </button>
          </div>

        </div>
      )}


      {isBusiness && needsRegistration && (
        <div className="business-registration-cta">
          <h2>No business profile found</h2>
          <p>
            We couldn&apos;t find a business entry linked to your account.
            To appear in searches and let customers find you, please register your business.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleGoToBusinessRegistration}
          >
            Register My Business
          </button>

        </div>
      )}

      {isBusiness && !needsRegistration && (
        <div>
          <div className='glass-box' style={{ marginBottom: '1.5rem', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)' }}>
            <h2 style={{ color: '#ff4d4d', marginTop: 0, marginBottom: '10px' }}>📍 Quick Actions: Go Live</h2>
            <p>
              Parked and ready for customers? Ping your current location to appear on the live map and mark your truck as "Open" for the next 4 hours.
            </p>
            <button
              type="button"
              className="btn btn-broadcast"
              onClick={handleGoLive}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <>
                  <div className="bp-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Getting Location...
                </>
              ) : (
                'Broadcast Location (4 Hours)'
              )}
            </button>
          </div>

          <div className='glass-box'>
            <form className="business-profile-form" onSubmit={handleSaveBusiness}>
              <h1>Business Profile</h1>

              <label>
                Business Name
                <input
                  type="text"
                  value={businessProfile.business_name}
                  onChange={e => handleBusinessChange('business_name', e.target.value)}
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

              <label>
                Category
                <input
                  type="text"
                  placeholder="e.g. American • Burgers"
                  value={businessProfile.category}
                  onChange={e => handleBusinessChange('category', e.target.value)}
                />
              </label>

              <label>
                Description
                <textarea
                  rows="3"
                  value={businessProfile.description}
                  onChange={e => handleBusinessChange('description', e.target.value)}
                />
              </label>

              <label>
                Instagram Handle/URL
                <input
                  type="text"
                  placeholder="@yourfoodtruck or https://instagram.com/..."
                  value={businessProfile.instagram}
                  onChange={e => handleBusinessChange('instagram', e.target.value)}
                />
              </label>

              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <ImageUpload
                  label="Profile Picture (Logo)"
                  value={businessProfile.logo}
                  onChange={(url) => handleBusinessChange('logo', url)}
                  userId={user.userID}
                  imageType="logo"
                />
              </div>

              <br></br>
              <h2>Hours</h2>
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
                  )
                })}
              </div>
              <br></br>
              <div style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <h2>Menu</h2>
              </div>
              <br></br>
              <div className="account-type-boxes" style={{ marginBottom: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <label className={`type-box ${businessProfile.menuType === 'text' ? 'active' : ''}`} style={{display: 'flex'}}>
                      <input
                          type="radio"
                          name="menuType"
                          value="text"
                          checked={businessProfile.menuType === 'text'}
                          onChange={() => handleBusinessChange('menuType', 'text')}
                      />
                      <FaList className="box-icon" />
                      <span>Text Menu</span>
                  </label>

                  <label className={`type-box ${businessProfile.menuType === 'image' ? 'active' : ''}`} style={{display: 'flex'}}>
                      <input
                          type="radio"
                          name="menuType"
                          value="image"
                          checked={businessProfile.menuType === 'image'}
                          onChange={() => handleBusinessChange('menuType', 'image')}
                      />
                      <FaImage className="box-icon" />
                      <span>Image Menu</span>
                  </label>
              </div>

              {businessProfile.menuType === 'text' ? (
                <>
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
                        className="btn btn-rmv btn-small"
                        onClick={() => removeMenuItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="add-menu-btn-container">
                    <button type="button" className="btn btn-secondary" id="add-menu-btn" onClick={addMenuItem}>
                      + Add Menu Item
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <ImageUpload
                    label="Upload Menu Image"
                    value={businessProfile.menuImage}
                    onChange={(url) => handleBusinessChange('menuImage', url)}
                    userId={user.userID}
                    imageType="menu"
                  />
                </div>
              )}

              <div className="actions">
                <button type="submit" id="save-profile-btn" className="btn btn-primary">
                  Save Profile
                </button>
              </div>

            </form>
          </div>
          <div className="preview-section-header">
            <span className="preview-badge">Live Preview</span>
            <div className="preview-divider-line"></div>
          </div>

          <div className="glass-box preview-container">
            <div className="preview-header-meta">
              <h1>Public Profile Preview</h1>
              <p>This is exactly how your business appears to potential customers.</p>
            </div>

            <BusinessProfile
              data={{
                ...businessProfile,
                zip: businessProfile.zipCode, // BusinessProfile expects 'zip'
                hours: Object.entries(businessProfile.hours).map(([day, hrs]) => ({
                  day,
                  open: formatTime12h(hrs.open),
                  close: formatTime12h(hrs.close),
                  closed: hrs.isClosed
                })),
                menuItems: businessProfile.menuItems.map(item => ({
                  ...item,
                  price: item.price ? `$${parseFloat(item.price).toFixed(2)}` : ''
                }))
              }}
            />
          </div>
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
                      <span className="message-date"><strong>{formatTimestamp(msg.createdAt)}</strong></span>
                    </div>
                    <p className="message-body">{msg.body}</p>
                    <small>From business: {msg.busName?.toUpperCase()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!isBusiness && !isCustomer && !isUnverified && (
        <div className='glass-box'>
          <p>Your account doesn’t have a role yet. Talk to the admin / adjust your seed data.</p>
        </div>
      )}

      {isDirty && (
        <div className="save-reminder">
          <span>⚠️ You have unsaved changes</span>
          <button type="button" className="btn-save-now" onClick={handleSaveBusiness}>
            Save Now
          </button>
        </div>
      )}

      {/* Mapbox Modal for GPS Correction */}
      {showMapModal && (
        <div className="subscribe-popup-overlay" style={{ zIndex: 9999, pointerEvents: 'auto' }}>
          <div className="subscribe-popup-card" style={{ width: '90%', maxWidth: '600px', background: '#fff', color: '#000', textAlign: 'left', padding: '20px', pointerEvents: 'auto' }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>📍 Confirm Your Location</h2>
            <p style={{ color: '#555', marginBottom: '15px' }}>
              Please drag the map so the pin points to your exact parking spot so customers know exactly where to find you!
            </p>
            <div style={{ position: 'relative', width: '100%', height: '350px', marginBottom: '20px' }}>
              <div
                ref={mapContainer}
                style={{ width: '100%', height: '100%', borderRadius: '8px', border: '1px solid #ccc' }}
              ></div>
              {/* Static Center Pin Overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                zIndex: 10,
                fontSize: '40px',
                filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.4))'
              }}>
                📍
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowMapModal(false)}
                style={{ color: '#333', background: '#e0e0e0', borderColor: '#e0e0e0' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-confirm"
                onClick={() => submitGoLive(mapCoords.lat, mapCoords.lng)}
                disabled={locationLoading}
              >
                {locationLoading ? 'Confirming...' : 'Confirm Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
