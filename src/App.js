import React, { useState, useRef } from 'react';
import Modal from 'react-modal';

// Set app element for accessibility
Modal.setAppElement('#root'); // Adjust based on your app's root element

export default function SignatureCollection() {
  const [numPeople, setNumPeople] = useState(1);
  const [people, setPeople] = useState([{ name: '', signature: null }]);
  const [signatures, setSignatures] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(null);
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

  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const startDrawing = (x, y) => {
    const canvas = canvasRefs.current[currentPersonIndex];
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const draw = (x, y) => {
    if (!isDrawing.current) return;
    const canvas = canvasRefs.current[currentPersonIndex];
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    const rect = canvasRefs.current[currentPersonIndex].getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startDrawing(x, y);
    
    const mouseMoveHandler = (e) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      draw(x, y);
    };
    
    const mouseUpHandler = () => {
      isDrawing.current = false;
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };
    
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling when drawing
    const rect = canvasRefs.current[currentPersonIndex].getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    startDrawing(x, y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling when drawing
    const rect = canvasRefs.current[currentPersonIndex].getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    draw(x, y);
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
  };

  const handleOpenSignature = (index) => {
    setCurrentPersonIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scrolling when modal is open
  };

  const handleSaveSignature = () => {
    const canvas = canvasRefs.current[currentPersonIndex];
    const dataURL = canvas.toDataURL();
    const newSignatures = [...signatures];
    newSignatures[currentPersonIndex] = { name: people[currentPersonIndex].name, signature: dataURL };
    setSignatures(newSignatures);
    clearCanvas();
    setIsModalOpen(false);
    document.body.style.overflow = ''; // Restore body scrolling
  };

  const clearCanvas = () => {
    const canvas = canvasRefs.current[currentPersonIndex];
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
          
          <button
            onClick={() => handleOpenSignature(index)}
            style={{
              marginTop: '10px',
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
            Open Signature
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

      {/* Signature Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          document.body.style.overflow = ''; // Restore body scrolling when modal is closed
        }}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '90%',  // Adjusted width for responsiveness
            maxWidth: '500px',  // Set a max width
            height: '300px',
            overflow: 'hidden', // Prevent overflow within the modal
            padding: '0', // Remove default padding
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h2 style={{ textAlign: 'center', margin: '10px 0' }}>Sign Here</h2>
          <canvas
            ref={(el) => (canvasRefs.current[currentPersonIndex] = el)}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            width="400"
            height="200"
            style={{
              border: '1px solid #ccc',
              cursor: 'crosshair',
              margin: '0 auto', // Center the canvas
              flex: '1', // Make the canvas fill available space
            }}
          />
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <button
              onClick={handleSaveSignature}
              style={{
                width: '80%', // Fixed width for better visibility
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
        </div>
      </Modal>
    </div>
  );
}
