import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignatureCollection from './SigantureCollection';
import Form from './Form';
import TicketsPage from './Ticket';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/form" element={<Form />} />
        <Route path="/ticket/:id" element={<SignatureCollection />} />
        <Route path="/tickets" element={<TicketsPage />} />
        {/* Optional: Redirect unknown routes to /form */}
        <Route path="*" element={<Navigate to="/form" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
