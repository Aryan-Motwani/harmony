import React, { useState } from 'react';

export default function Admin() {
  // State for login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State for pricing
  const [pricing, setPricing] = useState({
    trampoline: { "30 min": 100, "60 min": 150, "90 min": 200 },
    dodgeball: { "30 min": 120, "60 min": 170, "90 min": 220 },
    socks: { small: 30, medium: 35, large: 40 },
  });

  // Handle login submission
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'yourpassword') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid username or password');
    }
  };

  // Handle price change
  const handlePriceChange = (activityType, timeOrSize, value) => {
    setPricing(prevPricing => ({
      ...prevPricing,
      [activityType]: {
        ...prevPricing[activityType],
        [timeOrSize]: Number(value)
      }
    }));
  };

  // Render login form if not logged in
  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // Render pricing form if logged in
  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Admin Panel</h2>
      <h3>Update Pricing</h3>
      {Object.keys(pricing).map((activityType) => (
        <div key={activityType} style={{ marginBottom: '20px' }}>
          <h4>{activityType.charAt(0).toUpperCase() + activityType.slice(1)} Pricing</h4>
          {Object.keys(pricing[activityType]).map((timeOrSize) => (
            <div key={timeOrSize} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ marginRight: '10px', width: '100px' }}>{timeOrSize}:</label>
              <input
                type="number"
                value={pricing[activityType][timeOrSize]}
                onChange={(e) => handlePriceChange(activityType, timeOrSize, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => console.log("Updated Pricing:", pricing)}>
        Save Changes
      </button>
    </div>
  );
}
