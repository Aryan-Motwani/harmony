import React, { useState } from 'react';

export default function Form() {
  const [numPeople, setNumPeople] = useState(1);
  const [people, setPeople] = useState([{ name: '', age: '' }]);
  const [selectedPackage, setSelectedPackage] = useState('medium');
  const [needsSocks, setNeedsSocks] = useState(false);
  const [bill, setBill] = useState('');

  const packagePricing = {
    low: 100,
    medium: 200,
    high: 300,
  };

  const handleNumPeopleChange = (e) => {
    const num = parseInt(e.target.value);
    setNumPeople(num);
    setPeople(Array(num).fill({ name: '', age: '' }));
  };

  const handlePersonChange = (index, field, value) => {
    const newPeople = [...people];
    newPeople[index] = { ...newPeople[index], [field]: value };
    setPeople(newPeople);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let totalAdults = 0;
    let totalChildren = 0;
    let adultCount = 0;
    let childCount = 0;
    let socksTotal = 0;

    people.forEach(person => {
      const age = parseInt(person.age);
      const packagePrice = packagePricing[selectedPackage];
      let personPrice = age < 18 ? packagePrice / 2 : packagePrice;

      if (age < 18) {
        totalChildren += personPrice;
        childCount++;
      } else {
        totalAdults += personPrice;
        adultCount++;
      }

      if (needsSocks) {
        socksTotal += 30;
      }
    });

    const total = totalAdults + totalChildren + socksTotal;

    const billDetails = `${adultCount} adults - ${totalAdults} Rs\n${childCount} children - ${totalChildren} Rs\n${numPeople} socks - ${socksTotal} Rs\nTotal: ${total} Rs`;
    setBill(billDetails);
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Health and Harmony</h1>
        <p style={{ fontSize: '16px', color: 'gray' }}>Trampoline Park Customer Information</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label htmlFor="numPeople" style={{ display: 'block', marginBottom: '8px' }}>Number of People</label>
          <input
            id="numPeople"
            type="number"
            min="1"
            value={numPeople}
            onChange={handleNumPeopleChange}
            style={{
              padding: '8px',
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {people.map((person, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor={`name-${index}`} style={{ display: 'block', marginBottom: '8px' }}>Name</label>
              <input
                id={`name-${index}`}
                value={person.name}
                onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                style={{
                  padding: '8px',
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div>
              <label htmlFor={`age-${index}`} style={{ display: 'block', marginBottom: '8px' }}>Age</label>
              <input
                id={`age-${index}`}
                type="number"
                min="1"
                value={person.age}
                onChange={(e) => handlePersonChange(index, 'age', e.target.value)}
                style={{
                  padding: '8px',
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        ))}

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Package Selection</label>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px' }}>
            {['low', 'medium', 'high'].map((pkg) => (
              <button
                key={pkg}
                type="button"
                onClick={() => setSelectedPackage(pkg)}
                style={{
                  padding: '25px',
                  borderRadius: '4px',
                  border: `2px solid ${selectedPackage === pkg ? 'black' : '#ccc'}`,
                  backgroundColor: selectedPackage === pkg ? 'black' : 'white',
                  color: selectedPackage === pkg ? 'white' : 'black',
                  cursor: 'pointer',
                  width: '150px',
                  gap: '10px',
                }}
              >
                {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            id="socks"
            type="checkbox"
            checked={needsSocks}
            onChange={(e) => setNeedsSocks(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <label htmlFor="socks">I need socks</label>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Submit
        </button>
      </form>

      {bill && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Bill Details</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{bill}</pre>
        </div>
      )}
    </div>
  );
}
