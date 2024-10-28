import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from './sanityClient'; // Adjust the import based on your project structure
import Navbar from './Navbar';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  // Function to fetch initial tickets
  const fetchTickets = async () => {
    try {
      const results = await client.fetch('*[_type == "ticket"]');
      
      // Remove duplicates and sort by date and time
      const uniqueTickets = removeDuplicatesAndSort(results);
      setTickets(uniqueTickets); // Set the fetched and sorted tickets
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  // Function to handle incoming data updates
  const handleDataUpdate = (updatedTicket) => {
    setTickets(prevTickets => {
      const existingTicketIndex = prevTickets.findIndex(ticket => ticket._id === updatedTicket._id);
      if (existingTicketIndex > -1) {
        // Update existing ticket
        const updatedTickets = [...prevTickets];
        updatedTickets[existingTicketIndex] = updatedTicket;
        return removeDuplicatesAndSort(updatedTickets);
      }
      // Add new ticket if it doesn't exist
      return removeDuplicatesAndSort([...prevTickets, updatedTicket]);
    });
  };

  // Effect for fetching tickets and subscribing to real-time updates
  useEffect(() => {
    fetchTickets(); // Fetch tickets when the component mounts

    // Set up real-time updates using Sanity's listen method
    const query = '*[_type == "ticket"]';
    const subscription = client.listen(query).subscribe((update) => {
      const { documentId, result, transition } = update;
      
      if (transition === 'appear' || transition === 'update') {
        handleDataUpdate(result); // Handle incoming ticket updates
      } else if (transition === 'disappear') {
        setTickets(prevTickets => prevTickets.filter(ticket => ticket._id !== documentId)); // Remove ticket
      }
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Remove duplicate tickets and sort them by date and time
  const removeDuplicatesAndSort = (tickets) => {
    // Remove duplicates based on ticket ID
    const uniqueTickets = Object.values(tickets.reduce((acc, ticket) => {
      acc[ticket._id] = ticket;
      return acc;
    }, {}));
    
    // Sort tickets by createdAt (date and time)
    return uniqueTickets.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA - dateB;
    });
  };

  // Function to format date and time from createdAt
  const formatDateAndTime = (createdAt) => {
    const date = new Date(createdAt);
    
    // Format date as YYYY-MM-DD and time as HH:mm
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toTimeString().split(' ')[0].slice(0, 5);

    return { date: formattedDate, time: formattedTime };
  };

  // Render signature status for people
  const renderSignatureStatus = (people) => {
    if (!Array.isArray(people)) {
      return 'Signature status unknown'; // Fallback message if people is not an array
    }
    
    const allSigned = people.every(person => person.signature);
    return allSigned ? 'Signed' : 'Unsigned';
  };

  // Handle row click to navigate to ticket details
  const handleRowClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  return (
    <div>
      <Navbar/>
      <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center' }}>Tickets</h1>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>Customer Name</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>Time</th>
              <th style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>Signature Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => {
                const { date, time } = formatDateAndTime(ticket.createdAt); // Format date and time from createdAt

                return (
                  <tr
                    key={ticket._id}
                    style={{ border: '1px solid #ccc', cursor: 'pointer' }}
                    onClick={() => handleRowClick(ticket._id)}
                  >
                    <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>{ticket.customerName}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>{date}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>{time}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
                      {renderSignatureStatus(ticket.people)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>No tickets available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
