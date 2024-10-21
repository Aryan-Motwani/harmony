import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import client from './sanityClient'; // Adjust the import based on your project structure

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to fetch tickets
  const fetchTickets = async () => {
    try {
      const results = await client.fetch('*[_type == "ticket"]');
      setTickets(results);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  // Function to handle incoming data updates (WebSocket simulation)
  const handleDataUpdate = (updatedTicket) => {
    setTickets(prevTickets => {
      const existingTicketIndex = prevTickets.findIndex(ticket => ticket._id === updatedTicket._id);
      if (existingTicketIndex > -1) {
        // Update existing ticket
        const updatedTickets = [...prevTickets];
        updatedTickets[existingTicketIndex] = updatedTicket;
        return updatedTickets;
      }
      // Add new ticket if it doesn't exist
      return [...prevTickets, updatedTicket];
    });
  };

  useEffect(() => {
    fetchTickets(); // Fetch tickets when the component mounts

    // Simulate a real-time update using a polling mechanism
    const intervalId = setInterval(fetchTickets, 500);

    // Simulate incoming data updates (for demo purposes only)
    // Replace this with actual WebSocket or event subscription logic
    const simulateIncomingUpdates = () => {
      // This function simulates a ticket update
      const simulatedUpdatedTicket = {
        _id: 'some-ticket-id',
        customerName: 'Updated Customer',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        people: [{ signature: 'New Signature' }]
      };
      handleDataUpdate(simulatedUpdatedTicket);
    };
    // Call simulateIncomingUpdates every 10 seconds for demonstration
    const updateInterval = setInterval(simulateIncomingUpdates, 10000);

    // Cleanup function to clear intervals when the component unmounts
    return () => {
      clearInterval(intervalId);
      clearInterval(updateInterval);
    };
  }, []);

  const renderSignatureStatus = (people) => {
    // Check if all signatures are saved
    const allSigned = people.every(person => person.signature);
    return allSigned ? 'Signed' : 'Unsigned';
  };

  const handleRowClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`); // Navigate to the ticket details page
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Tickets</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Customer Name</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Date</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Time</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Signature Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <tr
                key={ticket._id}
                style={{ border: '1px solid #ccc', cursor: 'pointer' }} // Add cursor pointer for visual feedback
                onClick={() => handleRowClick(ticket._id)} // Call handleRowClick on row click
              >
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{ticket.customerName}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{ticket.date}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{ticket.time}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                  {renderSignatureStatus(ticket.people)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>No tickets available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
