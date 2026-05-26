import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  const incomingBusinessID = locationState.businessID || null;

  const displayName = username || 'Guest';

  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [expandedHours, setExpandedHours] = useState({}); // { [businessID]: boolean }
  const [expandedMenu, setExpandedMenu] = useState({}); // { [businessID]: boolean }

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});


  // NEW: subscription-related state
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [submittingMap, setSubmittingMap] = useState({}); // { [businessID]: boolean }
  const [subscriptionsLoaded, setSubscriptionsLoaded] = useState(false);
  const [subscriptionPopup, setSubscriptionPopup] = useState(null);
  const autoSubscribeAttemptedRef = useRef(false);
  const popupTimerRef = useRef(null);

  const handleProfileClick = () => {
    navigate('/profile', { state: { userID, username, email, role } });
  };

  const showSubscribeLoading = (businessName = 'this business') => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    setSubscriptionPopup({
      phase: 'loading',
      businessName,
      status: '',
    });
  };

  const showSubscribeSuccess = (data, fallbackName = 'this business') => {
    const businessName =
      data?.BusinessName ||
      data?.businessName ||
      data?.business_name ||
      fallbackName;
    const status = data?.status || data?.Status || 'Subscribed';
    setSubscriptionPopup({
      phase: 'success',
      businessName,
      status,
    });
    popupTimerRef.current = setTimeout(() => {
      setSubscriptionPopup(null);
      popupTimerRef.current = null;
    }, 1700);
  };

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const geocodeAddress = async (addressStr) => {
    const cacheKey = 'geocodeCache_v1';
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem(cacheKey) || '{}'); } catch (e) {}
    if (cache[addressStr]) return cache[addressStr];

    if (!MAPBOX_TOKEN) return null;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressStr)}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const coords = { lng: data.features[0].center[0], lat: data.features[0].center[1] };
        cache[addressStr] = coords;
        localStorage.setItem(cacheKey, JSON.stringify(cache));
        return coords;
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
    return null;
  };

  const fetchBusinesses = async (bounds) => {
    if (!API_BASE_URL) {
      setError('Missing API base URL configuration.');
      return;
    }

    setLoading(true);
    try {
      const { _sw, _ne } = bounds;
      const res = await api.get('/business', { 
        params: { 
          minLat: _sw.lat,
          maxLat: _ne.lat,
          minLng: _sw.lng,
          maxLng: _ne.lng
        } 
      });
      const data = Array.isArray(res.data) ? res.data : res.data.businesses || [];
      
      const isTest = (b) => {
        const name = (b?.business_name ?? "").trim().toUpperCase();
        return name.startsWith("TEST");
      };
      
      const validBusinesses = data.filter((b) => !isTest(b));

      // Map lat/lng directly to a coords object for backward compatibility
      const mappedBusinesses = validBusinesses.map(b => ({
        ...b,
        coords: (b.lat && b.lng) ? { lat: b.lat, lng: b.lng } : null
      })).filter(b => b.coords !== null);

      setBusinesses(mappedBusinesses);
    } catch (err) {
      console.error('fetch error:', err);
      setError('error fetching data. please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;
    if (!mapRef.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-111.891, 40.760],
        zoom: 10
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      const map = mapRef.current;

      map.on('load', () => {
        fetchBusinesses(map.getBounds());
      });

      map.on('moveend', () => {
        fetchBusinesses(map.getBounds());
      });
    }

    const map = mapRef.current;

    businesses.forEach((b) => {
      const businessID = b.user_id || b.id;
      if (!b.coords || markersRef.current[businessID]) return;

      const el = document.createElement('div');
      el.className = 'custom-map-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.background = '#e74c3c';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid #fff';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
      el.style.cursor = 'pointer';
      
      el.addEventListener('click', () => {
        setSelectedBusiness(b);
        map.flyTo({ center: [b.coords.lng, b.coords.lat], zoom: 15, speed: 1.2 });
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([b.coords.lng, b.coords.lat])
        .addTo(map);

      markersRef.current[businessID] = marker;
    });
  }, [businesses, MAPBOX_TOKEN]);

  const visibleBusinesses = useMemo(() => {
    const isTest = (b) => {
      const name = (b?.business_name ?? "").trim().toUpperCase();
      return name.startsWith("TEST"); // matches "TEST", "TEST ", "TEST-"
    };

    return (businesses ?? []).filter((b) => !isTest(b));
  }, [businesses]);

  // const handleLogout = async () => {
  //   sessionStorage.removeItem('ftlUser');
  //   try { await signOut(); } catch {}
  //   navigate('/');
  // };

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
      } finally {
        setSubscriptionsLoaded(true);
      }
    };

    fetchSubscriptions();
  }, [userID, API_BASE_URL]);

  useEffect(() => {
    if (autoSubscribeAttemptedRef.current) return;
    if (!incomingBusinessID || !userID || !subscriptionsLoaded) return;
    if (role === 'business' || role === 'unverified-business') return;
    if (subscriptions.has(incomingBusinessID)) {
      console.log("business id:", incomingBusinessID)
      autoSubscribeAttemptedRef.current = true;
      return;
    }
    if (!API_BASE_URL) return;

    const subscribeFromLink = async () => {
      autoSubscribeAttemptedRef.current = true;
      try {
        showSubscribeLoading(incomingBusinessID);
        const res = await api.post('/subscribe', { customerID: userID, businessID: incomingBusinessID });
        setSubscriptions(prev => {
          const next = new Set(prev);
          next.add(incomingBusinessID);
          return next;
        });
        showSubscribeSuccess(res?.data, incomingBusinessID);
      } catch (err) {
        console.error('auto-subscribe error:', err);
        setSubscriptionPopup(null);
      }
    };

    subscribeFromLink();
  }, [incomingBusinessID, userID, subscriptionsLoaded, role, subscriptions, API_BASE_URL]);

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
  const toggleSubscription = async (businessID, businessName) => {
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
        showSubscribeLoading(businessName || businessID);
        const res = await api.post('/subscribe', { customerID: userID, businessID });

        setSubscriptions(prev => {
          const next = new Set(prev);
          next.add(businessID);
          return next;
        });
        showSubscribeSuccess(res?.data, businessName || businessID);
      }
    } catch (err) {
      console.error('subscription error:', err);
      setSubscriptionPopup(null);
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

  const toggleMenu = (businessID) => {
    setExpandedMenu(prev => ({
      ...prev,
      [businessID]: !prev[businessID],
    }));
  };

  const isMenuExpanded = (businessID) => !!expandedMenu[businessID];

  const renderMenuItems = (menu, businessID) => {
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

        const expanded = isMenuExpanded(businessID);
        const visibleGroups = expanded ? groups : groups.slice(0, 3);
        const hasMore = groups.length > 3;

        return (
          <>
            <ul className="menu-list">
              {visibleGroups.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.name || 'Item'}</strong>
                  {item.price && ` – $${item.price}`}
                  {item.description && ` – ${item.description}`}
                </li>
              ))}
            </ul>
            {hasMore && (
              <div
                className="read-more-link"
                onClick={() => toggleMenu(businessID)}
                style={{ color: '#007BFF', cursor: 'pointer', fontSize: '0.9em', marginTop: '5px' }}
              >
                {expanded ? '...read less' : 'read more...'}
              </div>
            )}
          </>
        );
      }

      // Case 2: array of objects or nested arrays
      const expanded = isMenuExpanded(businessID);
      const visibleItems = expanded ? flatItems : flatItems.slice(0, 3);
      const hasMore = flatItems.length > 3;

      return (
        <>
          <ul className="menu-list">
            {visibleItems.map((item, idx) => {
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
          {hasMore && (
            <div
              className="read-more-link"
              onClick={() => toggleMenu(businessID)}
              style={{ color: '#007BFF', cursor: 'pointer', fontSize: '0.9em', marginTop: '5px' }}
            >
              {expanded ? '...read less' : 'read more...'}
            </div>
          )}
        </>
      );
    }

    // If it's a JSON string, try to parse
    if (typeof menu === 'string') {
      try {
        const parsed = JSON.parse(menu);
        if (Array.isArray(parsed)) {
          return renderMenuItems(parsed, businessID);
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
    <div className='dashboard dashboard-map-mode' style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {subscriptionPopup && (
        <div className="subscribe-popup-overlay" role="status" aria-live="polite">
          <div className="subscribe-popup-card">
            <div className="subscribe-popup-icon-wrap">
              {subscriptionPopup.phase === 'loading' ? (
                <div className="subscribe-spinner" />
              ) : (
                <div className="subscribe-checkmark">✓</div>
              )}
            </div>
            <p className="subscribe-popup-title">
              {subscriptionPopup.phase === 'loading' ? 'Subscribing...' : 'Subscribed'}
            </p>
            <p className="subscribe-popup-business">{subscriptionPopup.businessName}</p>
            {subscriptionPopup.phase === 'success' && (
              <p className="subscribe-popup-status">{subscriptionPopup.status}</p>
            )}
          </div>
        </div>
      )}

      {/* Floating Top Navigation Bar */}
      <nav className='dashboard-nav'>
        <div className='nav-left'>
          <span className='nav-logo'>Lowk Dashboard</span>
        </div>
        <div className='nav-right'>
          <button className='btn profile-btn' onClick={handleProfileClick} style={{ color: '#000' }}>
            {displayName}
          </button>
        </div>
      </nav>

      {/* Mapbox Container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* Sidebar Overlay for selected business */}
      <div className="dashboard-sidebar">
        
        {loading && (
          <div style={{ background: 'rgba(14, 22, 32, 0.85)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '16px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'auto' }}>
            <div className="subscribe-spinner" style={{ width: '30px', height: '30px', margin: '0 auto 10px', borderWidth: '3px' }}></div>
            <p style={{ textAlign: 'center', margin: 0 }}>Loading food trucks...</p>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(231, 76, 60, 0.85)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '16px', color: '#fff', pointerEvents: 'auto' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {!selectedBusiness && !loading && !error && businesses.length > 0 && (
          <div style={{ background: 'rgba(14, 22, 32, 0.85)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '16px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.2rem', marginBottom: '10px' }}>Discover Food Trucks</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Click on any pin on the map to view menu and hours.</p>
          </div>
        )}

        {selectedBusiness && (() => {
          const b = selectedBusiness;
          const businessID = b.user_id || b.id;
          const subscribed = isSubscribed(businessID);
          const isSubmitting = submittingMap[businessID] || false;
          
          return (
            <div className="business-card" style={{ pointerEvents: 'auto', margin: 0, maxHeight: '100%', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', background: 'rgba(14, 22, 32, 0.95)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 className="business-name">
                  <Link 
                    to={`/business/${businessID}`} 
                    style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#4a90e2'}
                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                  >
                    {b.business_name || 'Unnamed Business'} &rarr;
                  </Link>
                </h2>
                <button onClick={() => setSelectedBusiness(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
              </div>
              <span className="business-location">
                {b.address && b.city && b.state
                  ? `${b.address}\n${b.city}, ${b.state} ${b.zip_code}`
                  : b.address || b.state || b.city || 'Location N/A'}
              </span>

              <div className="business-card-body">
                <h3 className="menu-title">Menu</h3>
                <div className="menu-content">
                  {renderMenuItems(b.menu_items, businessID)}
                </div>

                <div className="hours-section">
                  <button
                    type="button"
                    className="btn hours-toggle-btn"
                    onClick={() => toggleHours(businessID)}
                    aria-expanded={isHoursExpanded(businessID)}
                    style={{ marginTop: '10px' }}
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

              <div className="business-card-footer" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
                <Link 
                  to={`/business/${businessID}`} 
                  className="btn subscribe-btn" 
                >
                  View Profile
                </Link>
                {userID && role !== 'business' && (
                  <button
                    className={
                      'btn subscribe-btn' +
                      (subscribed ? ' subscribed' : '')
                    }
                    onClick={() => toggleSubscription(businessID, b.business_name)}
                    disabled={isSubmitting}
                    style={{ margin: 0 }}
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
        })()}

      </div>
    </div>
  );
}

export default Dashboard;
