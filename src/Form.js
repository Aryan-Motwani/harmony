import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

import client from './sanityClient';
import Navbar from './Navbar';
import jsPDF from 'jspdf';

export default function Form() {
  
  const [activityType, setActivityType] = useState('Trampoline'); // Activity selection state

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [numPeople, setNumPeople] = useState(1);
  const [people, setPeople] = useState([{ name: '', signature: 'h' }]);
  const [needsSocks, setNeedsSocks] = useState(false);
  const [socksSizes, setSocksSizes] = useState({ S: 0, M: 0, L: 0 });
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('%'); // Default discount type to percentage
  const [billedBy, setBilledBy] = useState('Gulshan');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mixPayment, setMixPayment] = useState([{ method: 'cash', amount: '' }, { method: 'cash', amount: '' }]);
  const [bill, setBill] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(''); // Error state for mix payment validation
  const [phoneError, setPhoneError] = useState(''); // Error state for mix payment validation
  const billRef = useRef(null);


  const durationPricing = {
    Trampoline: { '30 min': 100, '60 min': 200, '90 min': 300 },
    Softplay: { '30 min': 80, '60 min': 160, '90 min': 240 },
  }

  const socksPricing = {
    Trampoline: { S: 20, M: 30, L: 40 },   // prices per size
    Softplay: { S: 15, M: 25, L: 35 },
  };
  

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

  

  const handleMixPaymentChange = (index, field, value) => {
    const newMixPayment = [...mixPayment];
    newMixPayment[index][field] = value;
    setMixPayment(newMixPayment);
  };

  const validateSocks = () => {
    const totalSocks = Object.values(socksSizes).reduce((a, b) => a + b, 0);
    if (totalSocks != numPeople) {
      setError(`Socks quantity does not match`);
      return false;
    }
    setError('');
    return true;
  };

  const validatePhone = () => {
    
    // const totalSocks = Object.values(socksSizes).reduce((a, b) => a + b, 0);
    if (phone.length != 9) {
      setPhoneError(`Invalid Phone Number`);
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateMixPayment = (total) => {
    const totalMixPayment = mixPayment.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    if (totalMixPayment !== total) {
      setError(`Total mix payments (${totalMixPayment} Rs) do not match the bill amount (${total} Rs).`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const packagePrice = durationPricing[activityType][selectedDuration];
    const socksTotal = needsSocks ? numPeople * 30 : 0;
    const discountAmount = discountType === 'Rs' ? discount : (packagePrice * numPeople + socksTotal) * (discount / 100);
    const total = packagePrice * numPeople + socksTotal - discountAmount;
    

    if (paymentMethod === 'mix' && !validateMixPayment(total)) return;
    if (!validateSocks()) return;

    const billDetails = (
      <div className='billDetails' style={{ textAlign: 'center' }}>
        <h2>Health & Harmony</h2>
        <p>Health & Harmony<br />Cannaught Place, Delhi<br />Phone: +91 7888106698</p>
        <p>-------------------------------------</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', opacity: 0.9 }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>No.</th>
              <th style={tableHeaderStyle}>Item</th>
              <th style={tableHeaderStyle}>Qty</th>
              <th style={tableHeaderStyle}>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tableCellStyle}>1</td>
              <td style={tableCellStyle}>Entry</td>
              <td style={tableCellStyle}>{numPeople}</td>
              <td style={tableCellStyle}>{packagePrice * numPeople} Rs</td>
            </tr>
            {needsSocks && (
              <tr>
                <td style={tableCellStyle}></td>
                <td style={tableCellStyle}>Socks</td>
                <td style={tableCellStyle}>{numPeople}</td>
                <td style={tableCellStyle}>{socksTotal} Rs</td>
              </tr>
            )}
            <tr>
              <td style={tableCellStyle} colSpan="3">Subtotal</td>
              <td style={tableCellStyle}>{packagePrice * numPeople + socksTotal} Rs</td>
            </tr>
            <tr>
              <td style={tableCellStyle} colSpan="3">Discount</td>
              <td style={tableCellStyle}>- {discountAmount} Rs</td>
            </tr>
            <tr>
              <td style={tableCellStyle} colSpan="3"><strong>Total after Discount</strong></td>
              <td style={tableCellStyle}><strong>{total} Rs</strong></td>
            </tr>
          </tbody>
        </table>
        <p>-------------------------------------</p>
        <p>Payment Method: {paymentMethod}</p>
        {paymentMethod === 'mix' && (
          <div>
            {mixPayment.map((payment, index) => (
              <p key={index} style={{ margin: 0 }}>
                Payment {index + 1}: {payment.method} - {payment.amount} Rs
              </p>
            ))}
          </div>
        )}
      </div>
    );
    
    setBill(billDetails);
};

const tableHeaderStyle = {
  textAlign: 'center',
  padding: '8px',
  borderBottom: '1px solid transparent',
  opacity: 0.9
};

const tableCellStyle = {
  textAlign: 'center',
  padding: '8px 20px',
  borderBottom: '1px solid transparent',
  opacity: 0.9
};


const storeData = async () => {
  const packagePrice = durationPricing[activityType][selectedDuration];

  // Calculate socks total based on selected sizes and activity type
  const socksTotal = needsSocks
    ? Object.entries(socksSizes).reduce((total, [size, qty]) => {
        const costPerPair = socksPricing[activityType][size] || 0;
        return total + costPerPair * qty;
      }, 0)
    : 0;

  // Calculate the total amount and discount
  const discountAmount =
    discountType === 'Rs'
      ? discount
      : (packagePrice * numPeople + socksTotal) * (discount / 100);
  const subtotal = packagePrice * numPeople + socksTotal;
  const totalAmount = subtotal - discountAmount;

  if (paymentMethod === 'mix' && !validateMixPayment(totalAmount)) return;
  if (!validateSocks()) return;

  // Prepare socks details to store
  const socksDetails = needsSocks
    ? Object.keys(socksSizes)
        .filter(size => socksSizes[size] > 0)
        .map(size => ({
          size,
          quantity: socksSizes[size],
          costPerPair: socksPricing[activityType][size],
          totalCost: socksPricing[activityType][size] * socksSizes[size],
        }))
    : [];

  // Create the bill object with all details
  const bill = {
    entry: {
      activityType,
      duration: selectedDuration,
      packagePrice,
      quantity: numPeople,
      totalCost: packagePrice * numPeople,
    },
    socks: socksDetails,
    subtotal,
    discount: discountAmount,
    totalAfterDiscount: totalAmount,
    paymentMethod,
  };

  // Prepare ticket data with bill details
  const ticketData = {
    _type: 'ticket',
    customerName,
    phoneNumber: phone,
    people,
    duration: selectedDuration,
    totalAmount,
    bill,  // Store bill object here
    createdAt: new Date().toISOString(),
  };

  console.log(ticketData);

  // return
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

  const printBill = () => {
    const billElement = billRef.current; // Get the current element using ref
  
    // Check if the billElement is defined before calling html2canvas
    if (billElement) {
      html2canvas(billElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const width = 100; // Width in mm for PDF
        const height = 150; // Height in mm for PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [width, height]
        });
  
        // Add the captured image to PDF
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save("bill.pdf");
      });
    } else {
      console.error("Bill element is not available.");
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
        <div className="form-group">
            <label>Activity</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              {['Trampoline', 'Softplay'].map((activity) => (
                <button
                  key={activity}
                  type="button"
                  onClick={() => setActivityType(activity)}
                  style={{
                    flex: '1',
                    padding: '12px',
                    borderRadius: '4px',
                    border: `2px solid ${activityType === activity ? 'black' : '#ccc'}`,
                    backgroundColor: activityType === activity ? 'black' : 'white',
                    color: activityType === activity ? 'white' : 'black',
                    cursor: 'pointer',
                  }}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
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
              type="number"
              value={phone}
              onChange={(e) => {
                validatePhone()
                setPhone(e.target.value)}
              }
              style={inputStyle}
            />
            {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6%' }}>
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


          <div>
          <label>Discount</label>
          <div style={{"display" : "flex", "gap" : "5%"}}>
          <div style={{ flex: '1' }}>

            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value))}

              style={inputStyle}
              
            />
          </div>
          <div>

          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={inputStyle}>
                <option value="%">%</option>
                <option value="Rs">Rs</option>
              </select>
          </div>
          </div>
            
          </div>

          <button type="button" onClick={storeData} style={buttonStyle}>Submit</button>
          <button type="submit" style={{ ...buttonStyle, marginBottom: '10px' }}>Generate Bill</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="button" onClick={clearAllTickets} style={buttonStyle}>Clear All Tickets</button>
        </form>

        {bill && (
            <div
              ref={billRef} // Use ref here
              style={{
                marginTop: '20px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100mm',  // Match PDF width
                height: '150mm', // Match PDF height
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
              {/* <h2 style={{ textAlign: 'center' }}>Bill Details</h2> */}
              <pre style={{ margin: 0 }}>{bill}</pre>
              <button onClick={printBill} style={buttonStyle}>Print Bill</button>
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
  textAlign:'center',
  marginBottom: '10px',
};
