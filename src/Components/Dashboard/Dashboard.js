import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';


function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

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

  const API_BASE = 'https://1pdtxa0shi.execute-api.us-east-1.amazonaws.com/dev/business';

  const handleProfileClick = () => {
    navigate('/profile', { state: { userID, username, email, role } });
  };

  const handleStateChange = async (e) => {
    const value = e.target.value;


    setSelectedState(value);
    setBusinesses([]);
    setError('');

    if (!value) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}?state=${encodeURIComponent(value)}`);
      
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

  const handleLogout = () => {
    sessionStorage.removeItem("ftlUser");
    navigate("/");
  }

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
          <span className='nav-logo'>Food Truck Locator</span>
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
              {businesses.map((b) => (
                <div
                  key={b.business_id || b.id}
                  className="business-card"
                >
                  <div className="business-card-header">
                    <h2 className="business-name">
                      {b.business_name || 'Unnamed Business'}
                    </h2>
                    <span className="business-location">
                      {b.address && b.city && b.state ? `${b.address}\n${b.city}, ${b.state} ${b.zip_code}` : b.address || b.state || b.city || 'Location N/A'}
                    </span>
                  </div>

                  <div className="business-card-body">
                    <h3 className="menu-title">Menu</h3>
                    <div className="menu-content">
                      {renderMenuItems(b.menu_items)}
                    </div>
                  </div>

                  {/* Optional footer area if you want actions later */}
                  {/* <div className="business-card-footer">
                    <button className="btn btn-outline">View Details</button>
                  </div> */}
                </div>
              ))}
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


