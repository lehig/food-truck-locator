import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { signOut } from '../../auth/cognito';
import './Dashboard.css';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE;

  const locationState = location.state || {};

  const stored = sessionStorage.getItem("ftlUser");
  const storedUser = stored ? JSON.parse(stored) : null;

  const userID = locationState.userID || storedUser?.userID || null;
  const username = locationState.username || storedUser?.username || null;
  const email = locationState.email || storedUser?.email || null;
  const role = locationState.role || storedUser?.role || null;

  const displayName = username || 'Guest';

  const [selectedState, setSelectedState] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedHours, setExpandedHours] = useState({}); // { [businessID]: boolean }


  // NEW: subscription-related state
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [submittingMap, setSubmittingMap] = useState({}); // { [businessID]: boolean }

  const handleProfileClick = () => {
    navigate('/profile', { state: { userID, username, email, role } });
  };

  const handleStateChange = async (e) => {
    const value = e.target.value;

    setSelectedState(value);
    setBusinesses([]);
    setError('');

    if (!value) return;
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/business', { params: { state: value } });
      
      // this may need adjusting depending on the shape of the response
      const data = Array.isArray(res.data) ? res.data : res.data.businesses || [];
      setBusinesses(data);
    } catch(err) {
      console.error('fetch error:', err);
      setError('error fetching data. please try again.');
    } finally {
      setLoading(false);
    }
  };

  const visibleBusinesses = useMemo(() => {
    const isTest = (b) => {
      const name = (b?.business_name ?? "").trim().toUpperCase();
      return name.startsWith("TEST"); // matches "TEST", "TEST ", "TEST-"
    };

    return (businesses ?? []).filter((b) => !isTest(b));
  }, [businesses]);

  const handleLogout = async () => {
    sessionStorage.removeItem('ftlUser');
    try { await signOut(); } catch {}
    navigate('/');
  };

  // === NEW: Load subscriptions for this customer ===
  useEffect(() => {
    if (!userID) return; // nothing to load for guests
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        const res = await api.get('/subscriptions', { params: { customerID: userID } });
        const ids = res.data?.businessIDs || [];
        setSubscriptions(new Set(ids));
      } catch (err) {
        console.error('error loading subscriptions:', err);
        // optional: setError('Error loading subscriptions');
      }
    };

    fetchSubscriptions();
  }, [userID]);

  const isSubscribed = (businessID) => {
    if (!businessID) return false;
    return subscriptions.has(businessID);
  };

  const setSubmittingFor = (businessID, value) => {
    setSubmittingMap(prev => ({
      ...prev,
      [businessID]: value,
    }));
  };

  // === NEW: Toggle subscribe / unsubscribe ===
  const toggleSubscription = async (businessID) => {
    if (!userID) {
      alert('You must be logged in to subscribe.');
      return;
    }
    if (!businessID) {
      console.error('Missing businessID on card');
      return;
    }
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      return;
    }

    const currentlySubscribed = isSubscribed(businessID);
    setSubmittingFor(businessID, true);

    try {
      if (currentlySubscribed) {
        // Unsubscribe
        await api.delete('/subscribe', { data: { customerID: userID, businessID } });

        setSubscriptions(prev => {
          const next = new Set(prev);
          next.delete(businessID);
          return next;
        });
      } else {
        // Subscribe
        await api.post('/subscribe', { customerID: userID, businessID });

        setSubscriptions(prev => {
          const next = new Set(prev);
          next.add(businessID);
          return next;
        });
      }
    } catch (err) {
      console.error('subscription error:', err);
      // optional: setError('Error updating subscription. Please try again.');
    } finally {
      setSubmittingFor(businessID, false);
    }
  };

  const DAY_ORDER = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const formatHoursValue = (value) => {
    if (value == null) return '—';
    const v = String(value).trim();
    if (!v) return '—';
    // normalize common “closed” inputs
    if (v.toLowerCase() === 'closed') return 'Closed';
    return v;
  };

  const renderHours = (hours) => {
    if (!hours || typeof hours !== 'object') return <span>—</span>;

    return (
      <div className="hours-list">
        {DAY_ORDER.map((day) => (
          <div className="hours-row" key={day}>
            <span className="hours-day">{day}</span>
            <span className="hours-time">{formatHoursValue(hours[day])}</span>
          </div>
        ))}
      </div>
    );
  };

    const toggleHours = (businessID) => {
    setExpandedHours(prev => ({
      ...prev,
      [businessID]: !prev[businessID],
    }));
  };

  const isHoursExpanded = (businessID) => !!expandedHours[businessID];

  const renderMenuItems = (menu) => {
    if (!menu) return '—';

    // Helper to flatten nested arrays: [[item1, item2], [item3]] -> [item1, item2, item3]
    const flatten = (arr) => {
      if (!Array.isArray(arr)) return [];
      const result = [];
      const stack = [...arr];

      while (stack.length) {
        const current = stack.shift();
        if (Array.isArray(current)) {
          stack.unshift(...current);
        } else {
          result.push(current);
        }
      }
      return result;
    };

    // If it's already an array (or array of arrays)
    if (Array.isArray(menu)) {
      const flatItems = flatten(menu);

      if (flatItems.length === 0) return '—';

      // Case 1: it's a flat list of strings like:
      // ["1.75","delicious taco","taco", "2.50","yummy burrito","burrito"]
      const allStrings = flatItems.every((v) => typeof v === 'string');

      if (allStrings) {
        const groups = [];
        for (let i = 0; i < flatItems.length; i += 3) {
          const [price, description, name] = flatItems.slice(i, i + 3);
          if (price || description || name) {
            groups.push({ name, price, description });
          }
        }

        return (
          <ul className="menu-list">
            {groups.map((item, idx) => (
              <li key={idx}>
                <strong>{item.name || 'Item'}</strong>
                {item.price && ` – $${item.price}`}
                {item.description && ` – ${item.description}`}
              </li>
            ))}
          </ul>
        );
      }

      // Case 2: array of objects or nested arrays
      return (
        <ul className="menu-list">
          {flatItems.map((item, idx) => {
            // raw string items, keep as-is
            if (typeof item === 'string') {
              return <li key={idx}>{item}</li>;
            }

            // expected: object: { name, price, description }
            if (item && typeof item === 'object') {
              const name = item.name || 
                item.item_name ||
                item.Name ||
                'Item';
              const rawPrice = 
                item.price ||
                item.item_price ||
                item.Price; 
              const desc = item.description || 
                item.desc ||
                item.item_description ||
                item.Description ||
                '';

              const price = rawPrice ? `$${rawPrice}` : '';

              return (
                <li key={idx}>
                  <strong>{name}</strong>
                  {price && ` – ${price}`}
                  {desc && ` – ${desc}`}
                </li>
              );
            }

            // fallback
            return <li key={idx}>{String(item)}</li>;
          })}
        </ul>
      );
    }

    // If it's a JSON string, try to parse
    if (typeof menu === 'string') {
      try {
        const parsed = JSON.parse(menu);
        if (Array.isArray(parsed)) {
          return renderMenuItems(parsed);
        }
        return String(menu);
      } catch {
        // Not JSON, just show as is
        return menu;
      }
    }

    // Last-resort fallback
    return String(menu);
  };

  return (
    <div className='dashboard'>
      {/* Top Navigation Bar */}
      <nav className='dashboard-nav'>
        <div className='nav-left'>
          <span className='nav-logo'>Food Truck Locator Dashboard</span>
        </div>

        <div className='nav-center'>
          <label htmlFor='state-select'>Select a state:</label>
          <select
            id='state-select'
            className='state-select'
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value=''>Select a State</option>
            <option value='ID'>Idaho</option>
            <option value='UT'>Utah</option>
            <option value='WY'>Wyoming</option>
          </select>
        </div>

        <div className='nav-right'>
          <button className='btn' onClick={handleProfileClick}>
            Profile: {displayName}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className='dashboard-main'>
        <h1>Browse Food Trucks by State</h1>

        {selectedState && (
          <p className='state-summary'>
            Showing results for state: <strong>{selectedState}</strong>
          </p>
        )}

        {loading && <p>Loading businesses...</p>}

        {error && <p className='error-message'>{error}</p>}

        {!loading && !error && businesses.length === 0 && selectedState && (
          <p>No businesses found in {selectedState}. Try a different state.</p>
        )}

        {!loading && businesses.length > 0 && (
          <div className="business-list">
            <div className="business-cards">
              {visibleBusinesses.map((b) => {
                const businessID = b.user_id || b.id;
                const subscribed = isSubscribed(businessID);
                const isSubmitting = submittingMap[businessID] || false;

                return (
                  <div
                    key={businessID}
                    className="business-card"
                  >
                    <div className="business-card-header">
                      <h2 className="business-name">
                        {b.business_name || 'Unnamed Business'}
                      </h2>
                      <span className="business-location">
                        {b.address && b.city && b.state
                          ? `${b.address}\n${b.city}, ${b.state} ${b.zip_code}`
                          : b.address || b.state || b.city || 'Location N/A'}
                      </span>
                    </div>

                    <div className="business-card-body">
                      <h3 className="menu-title">Menu</h3>
                      <div className="menu-content">
                        {renderMenuItems(b.menu_items)}
                      </div>

                      {/* Hours (collapsible) */}
                      <div className="hours-section">
                        <button
                          type="button"
                          className="btn hours-toggle-btn"
                          onClick={() => toggleHours(businessID)}
                          aria-expanded={isHoursExpanded(businessID)}
                        >
                          {isHoursExpanded(businessID) ? 'Hide hours' : 'Show hours'}
                        </button>

                        {isHoursExpanded(businessID) && (
                          <div className="hours-content">
                            {renderHours(b.hours)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NEW: Subscribe button */}
                    <div className="business-card-footer">
                      {userID && role !== 'business' && (
                        <button
                          className={
                            'btn subscribe-btn' +
                            (subscribed ? ' subscribed' : '')
                          }
                          onClick={() => toggleSubscription(businessID)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? 'Saving...'
                            : subscribed
                              ? 'Subscribed'
                              : 'Subscribe'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      
      {/* floating logout button */}
      <button className='logout-btn' onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
