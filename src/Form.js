import React, { useEffect, useState } from 'react';
import client from './sanityClient';
import Navbar from './Navbar';

export default function Form() {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [numPeople, setNumPeople] = useState(1);
  const [people, setPeople] = useState([{ name: '', signature: 'h' }]);
  const [needsSocks, setNeedsSocks] = useState(false);
  const [socksSizes, setSocksSizes] = useState({ S: 0, M: 0, L: 0 });
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [billedBy, setBilledBy] = useState('Gulshan');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mixPayment, setMixPayment] = useState([{ method: 'cash', amount: '' }, { method: 'cash', amount: '' }]);
  const [bill, setBill] = useState('');
  const [data, setData] = useState([]);

  const durationPricing = { '30 min': 100, '60 min': 200, '90 min': 300 };

  useEffect(() => {
    client.fetch('*[_type == "ticket"]').then(setData).catch(console.error);
  }, []);

  useEffect(() => {
    // Update people state when numPeople changes
    setPeople(Array.from({ length: numPeople }, (_, index) => ({ name: index === 0 ? customerName : '' })));
  }, [numPeople, customerName]);

  const handleNumPeopleChange = (e) => {
    const num = parseInt(e.target.value);
    setNumPeople(num);
  };

  const handlePersonChange = (index, value) => {
    const newPeople = [...people];
    newPeople[index].name = value; // Update the name of the specific person
    setPeople(newPeople);
  };

  const handleSocksChange = (size, value) => {
    setSocksSizes((prev) => ({ ...prev, [size]: parseInt(value) || 0 }));
  };

  const validateSocks = () => {
    const totalSocks = Object.values(socksSizes).reduce((a, b) => a + b, 0);
    return totalSocks === numPeople;
  };

  const handleMixPaymentChange = (index, field, value) => {
    const newMixPayment = [...mixPayment];
    newMixPayment[index][field] = value;
    setMixPayment(newMixPayment);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const packagePrice = durationPricing[selectedDuration];
    const socksTotal = needsSocks ? numPeople * 30 : 0;
    const total = packagePrice * numPeople + socksTotal;
  
    const billDetails = `
      ---------------------------
              PAID
           Health & Harmony
        Cannaught place, Delhi
         Phone: +91 7888106698
      ---------------------------
      Name: ${customerName} (M: ${phone})
      Date: ${new Date().toLocaleString()}
      Duration: ${selectedDuration}
      Billed By: ${billedBy}
      ---------------------------
      No.    Item          Qty   Price
      1      Entry         ${numPeople}   ${packagePrice}
      ${needsSocks ? `Socks: ${numPeople} pairs - ${socksTotal} Rs` : ''}
      ---------------------------
      Total: ${total} Rs
      Payment Method: ${paymentMethod}
      ${paymentMethod === 'mix' ? 
        mixPayment.map((payment, index) => `Payment ${index + 1}: ${payment.method} - ${payment.amount} Rs`).join('\n') 
        : ''}
      ---------------------------
    `;
    setBill(billDetails);
  };
  

  const storeData = async () => {
    const totalAmount = durationPricing[selectedDuration] * numPeople + (needsSocks ? numPeople * 30 : 0);

    const ticketData = {
      _type: 'ticket',
      customerName,
      phoneNumber: phone,
      people,
      duration: selectedDuration,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await client.create(ticketData);
      alert('Ticket stored successfully!');
      console.log('Ticket stored:', result);
    } catch (error) {
      console.error('Store ticket failed:', error.message);
      alert('Error storing ticket: ' + error.message);
    }
  };

  const clearAllTickets = async () => {
    try {
      const tickets = await client.fetch('*[_type == "ticket"]{_id}');
      if (tickets.length === 0) return console.log('No tickets to delete.');

      const ticketIds = tickets.map((ticket) => ticket._id);
      await client.delete(ticketIds);
      console.log('Tickets cleared.');
      alert('All tickets cleared successfully!');
    } catch (error) {
      console.error('Error clearing tickets:', error.message);
    }
  };

  return (
    <div>
      <Navbar/>
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>Health and Harmony</h1>
        <p>Trampoline Park Customer Information</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label>Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Number of People</label>
          <input
            type="number"
            min="1"
            value={numPeople}
            onChange={handleNumPeopleChange}
            style={inputStyle}
          />
        </div>

        {people.map((person, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={person.name}
              onChange={(e) => handlePersonChange(index, e.target.value)}
              placeholder={`Person ${index + 1} Name`}
              style={inputStyle}
            />
          </div>
        ))}

        <div>
          <label>Duration</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            {['30 min', '60 min', '90 min'].map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                style={{
                  flex: '1',
                  padding: '12px',
                  borderRadius: '4px',
                  border: `2px solid ${selectedDuration === duration ? 'black' : '#ccc'}`,
                  backgroundColor: selectedDuration === duration ? 'black' : 'white',
                  color: selectedDuration === duration ? 'white' : 'black',
                  cursor: 'pointer',
                }}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Billed By</label>
          <select
            value={billedBy}
            onChange={(e) => setBilledBy(e.target.value)}
            style={inputStyle}
          >
            <option value="Gulshan">Gulshan</option>
            <option value="Aryan">Aryan</option>
            <option value="Jayesh">Jayesh</option>
          </select>
        </div>

        <div>
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={inputStyle}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="credit card">Credit Card</option>
            <option value="mix">Mix</option>
          </select>
        </div>

        {paymentMethod === 'mix' && (
          <>
            {mixPayment.map((payment, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={payment.method}
                  onChange={(e) => handleMixPaymentChange(index, 'method', e.target.value)}
                  style={{ flex: '1', padding: '8px' }}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="credit card">Credit Card</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={payment.amount}
                  onChange={(e) => handleMixPaymentChange(index, 'amount', e.target.value)}
                  style={{ flex: '1', padding: '8px' }}
                />
              </div>
            ))}
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={needsSocks}
            onChange={(e) => setNeedsSocks(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <label>I need socks</label>
        </div>

        {needsSocks && (
          <div style={{ display: 'grid', gap: '10px' }}>
            <label>Sock Sizes</label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['S', 'M', 'L'].map((size) => (
                <div key={size} style={{ flex: '1' }}>
                  <label>{size}</label>
                  <input
                    type="number"
                    value={socksSizes[size]}
                    onChange={(e) => handleSocksChange(size, e.target.value)}
                    min="0"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" style={{ ...buttonStyle, marginBottom: '10px' }}>Submit</button>
        <button type="button" onClick={storeData} style={buttonStyle}>Save to Database</button>
        <button type="button" onClick={clearAllTickets} style={buttonStyle}>Clear All Tickets</button>
      </form>

      {bill && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h2>Bill Details</h2>
          <pre>{bill}</pre>
        </div>
      )}
    </div>
    </div>
  );
}

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  width: '100%',
};

const buttonStyle = {
  padding: '12px',
  borderRadius: '4px',
  backgroundColor: 'black',
  color: 'white',
  cursor: 'pointer',
  marginBottom: '10px',
};
