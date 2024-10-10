import React, { useState, useRef } from 'react';

export default function SignatureCollection() {
  const [numPeople, setNumPeople] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [people, setPeople] = useState([{ name: '', signature: null }]);
  const canvasRefs = useRef([]);

  const handleNumPeopleChange = (e) => {
    const num = parseInt(e.target.value);
    setNumPeople(num);
    setPeople(Array.from({ length: num }, (_, index) => ({ name: '', signature: null })));
    setSignatures([]); // Clear previous signatures when the number of people changes
  };

  const handleNameChange = (index, value) => {
    const newPeople = [...people];
    newPeople[index].name = value;
    setPeople(newPeople);
  };

  const isDrawing = useRef(Array(numPeople).fill(false));
  const lastX = useRef(Array(numPeople).fill(0));
  const lastY = useRef(Array(numPeople).fill(0));

  const handleMouseDown = (index, e) => {
    const canvas = canvasRefs.current[index];
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    isDrawing.current[index] = true;
    const rect = canvas.getBoundingClientRect();
    lastX.current[index] = e.clientX - rect.left;
    lastY.current[index] = e.clientY - rect.top;

    canvas.addEventListener('mousemove', (e) => handleMouseMove(e, index));
  };

  const handleMouseMove = (e, index) => {
    if (!isDrawing.current[index]) return;
    const canvas = canvasRefs.current[index];
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.moveTo(lastX.current[index], lastY.current[index]);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX.current[index] = x;
    lastY.current[index] = y;
  };

  const handleMouseUp = (index) => {
    isDrawing.current[index] = false;
    const canvas = canvasRefs.current[index];
    canvas.removeEventListener('mousemove', (e) => handleMouseMove(e, index));
  };

  const handleSaveSignature = (index) => {
    const canvas = canvasRefs.current[index];
    const dataURL = canvas.toDataURL();
    const newSignatures = [...signatures];
    newSignatures[index] = { name: people[index].name, signature: dataURL };
    setSignatures(newSignatures);
    clearCanvas(index);
  };

  const clearCanvas = (index) => {
    const canvas = canvasRefs.current[index];
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Signature Collection</h1>
      
      <div style={{ marginBottom: '20px' }}>
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
          }}
        />
      </div>

      {people.map((person, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <label htmlFor={`name-${index}`} style={{ display: 'block', marginBottom: '8px' }}>Name</label>
          <input
            id={`name-${index}`}
            type="text"
            value={person.name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            style={{
              padding: '8px',
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            required
          />

          <canvas
            ref={(el) => (canvasRefs.current[index] = el)}
            onMouseDown={(e) => handleMouseDown(index, e)} // Pass event here
            onMouseUp={() => handleMouseUp(index)}
            width="500"
            height="200"
            style={{
              border: '1px solid #ccc',
              marginBottom: '10px',
              cursor: 'crosshair',
            }}
          />

          <button
            onClick={() => handleSaveSignature(index)}
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
            Save Signature
          </button>
        </div>
      ))}

      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '20px' }}>Collected Signatures</h2>
        {signatures.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {signatures.map((sig, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <img src={sig.signature} alt={`Signature of ${sig.name}`} style={{ width: '200px', height: 'auto', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' }} />
                <span>{sig.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No signatures collected yet.</p>
        )}
      </div>
    </div>
  );
}
