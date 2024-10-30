import React, { useState, useEffect } from 'react';
import client from './sanityClient';
import './Admin.css'; // Assuming you have an Admin.css file for additional styling.
import Navbar from './Navbar';

export default function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('trampoline');
  const [pricing, setPricing] = useState({
    trampoline: [],
    softplay: 0,
    socks: {},
  });

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const data = await client.fetch(`*[_id == "2ce3cd1c-f62b-4d88-90fc-4ef9c024ee87"][0]{
          trampoline,
          softplay,
          socks
        }`);
        
        // Assign fetched data to state
        setPricing({
          trampoline: data.trampoline || [],
          softplay: data.softplay || 0,
          socks: data.socks || {},
        });
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      }
    };

    fetchPricingData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'yourpassword') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid username or password');
    }
  };

  const handlePriceChange = (category, key, value) => {
    setPricing((prevPricing) => {
      if (category === 'trampoline') {
        const updatedPrices = [...prevPricing[category]];
        updatedPrices[key] = Number(value);
        return { ...prevPricing, [category]: updatedPrices };
      } else if (category === 'socks') {
        return { ...prevPricing, [category]: { ...prevPricing[category], [key]: Number(value) } };
      } else {
        return { ...prevPricing, [category]: Number(value) };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      await client
        .patch('2ce3cd1c-f62b-4d88-90fc-4ef9c024ee87') // Replace with the correct Sanity document ID
        .set({ trampoline: pricing.trampoline, softplay: pricing.softplay, socks: pricing.socks })
        .commit();
      alert('Pricing updated successfully!');
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        <Navbar/>
      <div className="admin-container">
        <h2 align="center">Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
    <div className="admin-panel">
      <h2 align="center">Admin Panel</h2>

      <div className="activity-switch">
        <button onClick={() => setSelectedActivity('trampoline')} className={`activity-button ${selectedActivity === 'trampoline' ? 'active' : ''}`}>
          Trampoline Prices
        </button>
        <button onClick={() => setSelectedActivity('softplay')} className={`activity-button ${selectedActivity === 'softplay' ? 'active' : ''}`}>
          Softplay Price
        </button>
      </div>

      {selectedActivity === 'trampoline' && (
        <>
          <h3>Session Prices</h3>
          <div className="pricing-row">
            {pricing.trampoline.map((price, index) => (
              <div key={`trampoline-${index}`} className="pricing-input">
                <label>Price {index + 1}:</label>
                <input
                  type="number"
                  value={price}
                  style={{width: '100%', padding: '8px', marginTop: '5px' }}
                  onChange={(e) => handlePriceChange('trampoline', index, e.target.value)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {selectedActivity === 'softplay' && (
        <>
          <h3>Softplay Price</h3>
          <div className="pricing-row">
            <div className="pricing-input">
              <label>Softplay:</label>
              <input
                type="number"
                value={pricing.softplay}
                style={{padding: '8px', margin: '5px 10px' }}

                onChange={(e) => handlePriceChange('softplay', null, e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      <h3>Socks Pricing</h3>
      <div className="socks-pricing">
        {Object.keys(pricing.socks).map((size) => (
          <div key={size} className="socks-input">
            <label>{size}:</label>
            <input
              type="number"
              value={pricing.socks[size]}
              style={{width: '100%', padding: '8px', marginTop: '5px' }}
              onChange={(e) => handlePriceChange('socks', size, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="submit-button">
        Save Changes
      </button>
    </div>
    </div>
  );
}
