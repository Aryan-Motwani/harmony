import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <div style={brandingStyle}>
        <h2>Health and Harmony</h2>
      </div>
      <ul style={navLinksStyle}>
        <li>
          <Link to="/tickets" style={linkStyle}>Tickets</Link>
        </li>
        <li>
          <Link to="/form" style={linkStyle}>Form</Link>
        </li>
      </ul>
    </nav>
  );
}

// Styling
const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#333',
  color: 'white',
};

const brandingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
};

const navLinksStyle = {
  listStyle: 'none',
  display: 'flex',
  gap: '20px',
  margin: 0,
  padding: 0,
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '18px',
};

const linkHoverStyle = {
  textDecoration: 'underline',
};
