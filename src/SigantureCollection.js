import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import client from './sanityClient';
import { useParams } from 'react-router-dom';

// Set app element for accessibility
Modal.setAppElement('#root');

export default function SignatureCollection() {
  const { id } = useParams(); // Get the ticket ID from the URL
  const [people, setPeople] = useState([]); // Store people from the ticket
  const [signatures, setSignatures] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(null);
  const canvasRefs = useRef([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    // Fetch ticket data based on ID
    client.fetch(`*[_type == "ticket" && _id == $id]`, { id })
      .then((results) => {
        if (results.length > 0) {
          const ticket = results[0];
          setPeople(ticket.people.map(person => ({ name: person.name, signature: person.signature || null })));
          setSignatures(ticket.people.map(person => ({ name: person.name, signature: person.signature || null })));
        }
      })
      .catch(console.error);
  }, [id]);

  const handleOpenSignature = (index) => {
    setCurrentPersonIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scrolling when modal is open
  };

  const handleSaveSignature = async () => {
    const canvas = canvasRefs.current[currentPersonIndex];
    const dataURL = canvas.toDataURL();
  
    // Close the modal and display the image first
    const newSignatures = [...signatures];
    newSignatures[currentPersonIndex] = { 
      name: people[currentPersonIndex].name, 
      signature: dataURL  // Temporarily use the base64 dataURL
    };
    setSignatures(newSignatures);
    setIsModalOpen(false);  // Close the modal
    document.body.style.overflow = '';  // Restore body scrolling
  
    // Clear the canvas after saving
    clearCanvas();
  
    // Now perform the upload asynchronously
    try {
      const blob = await fetch(dataURL).then((res) => res.blob());
      const file = new File(
        [blob], 
        `${people[currentPersonIndex].name}_signature.png`, 
        { type: 'image/png' }
      );
  
      const imageAsset = await client.assets.upload('image', file, {
        filename: `${people[currentPersonIndex].name}_signature.png`,
      });
  
      // Update the signature with the final image URL
      const uploadedSignatures = [...signatures];
      uploadedSignatures[currentPersonIndex] = {
        name: people[currentPersonIndex].name,
        signature: imageAsset.url,
      };
      setSignatures(uploadedSignatures);
    } catch (error) {
      console.error('Error uploading signature:', error);
    }
  };
  

  const clearCanvas = () => {
    const canvas = canvasRefs.current[currentPersonIndex];
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

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

  const handleSaveAllSignatures = () => {
    const signaturesToSave = people.map((person, index) => ({
      name: person.name,
      signature: signatures[index]?.signature || null,
    }));

    client
      .patch(id) // Patch the ticket document
      .set({ people: signaturesToSave }) // Update the people array with signatures
      .commit()
      .then(() => {
        alert('All signatures saved successfully!');
      })
      .catch(console.error);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Signature Collection</h1>

      {people.map((person, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <label>{person.name}</label>
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

      {/* Collected Signatures Section */}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '20px' }}>Collected Signatures</h2>
        {signatures.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {signatures.map((sig, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                {sig.signature ? (
                  <img src={sig.signature} alt={`Signature of ${sig.name}`} style={{ width: '200px', height: 'auto', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' }} />
                ) : (
                  <div style={{ width: '200px', height: '50px', border: '1px dashed #ccc', borderRadius: '4px', marginRight: '10px' }} />
                )}
                <span>{sig.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No signatures collected yet.</p>
        )}
      </div>

      {/* Save All Signatures Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleSaveAllSignatures}
          style={{
            width: '80%',
            padding: '12px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Save All Signatures
        </button>
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
            width: '90%', // Adjusted width for responsiveness
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
