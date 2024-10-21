import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import client from './sanityClient';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';

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

  // Fetch ticket data based on ID
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const results = await client.fetch(`*[_type == "ticket" && _id == $id]`, { id });
        if (results.length > 0) {
          const ticket = results[0];
          const peopleData = ticket.people.map(person => ({
            name: person.name,
            signature: person.signature || null,
          }));
          setPeople(peopleData);
          setSignatures(peopleData);
        }
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      }
    };
  
    fetchTicketData();
  
    // Set up a listener for real-time updates
    const subscription = client.listen(`*[_type == "ticket" && _id == $id]`, { id }).subscribe(update => {
      if (update.operation === 'update') {
        const updatedTicket = update.result;
        const updatedPeople = updatedTicket.people.map(person => ({
          name: person.name,
          signature: person.signature || null,
        }));
        setPeople(updatedPeople);
        setSignatures(updatedPeople);
      }
    });
  
    // Clean up the listener on unmount
    return () => subscription.unsubscribe();
  }, [id]);
  

  // Open signature modal
  const handleOpenSignature = (index) => {
    setCurrentPersonIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scrolling when modal is open
  };

  // Save signature and upload to the server
  const handleSaveSignature = async () => {
    const canvas = canvasRefs.current[currentPersonIndex];
    const dataURL = canvas.toDataURL();

    // Close the modal and display the image first
    const newSignatures = [...signatures];
    newSignatures[currentPersonIndex] = { 
      name: people[currentPersonIndex].name, 
      signature: dataURL  
    };
    setSignatures(newSignatures);
    setIsModalOpen(false);  
    document.body.style.overflow = '';  
    
    // Clear the canvas after saving
    clearCanvas();

    // Upload asynchronously
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
      newSignatures[currentPersonIndex].signature = imageAsset.url;
      setSignatures(newSignatures);

      // Optionally, update the signatures in the backend
      await client.patch(id)
        .set({ people: newSignatures })
        .commit();
    } catch (error) {
      console.error('Error uploading signature:', error);
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRefs.current[currentPersonIndex];
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Handle drawing actions
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
    e.preventDefault();
    const rect = canvasRefs.current[currentPersonIndex].getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    startDrawing(x, y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const rect = canvasRefs.current[currentPersonIndex].getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    draw(x, y);
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
  };

  // Save all signatures to the server
  const printBill = async () => {
    alert("bill print")
    return;
    const signaturesToSave = people.map((person, index) => ({
      name: person.name,
      signature: signatures[index]?.signature || null,
    }));

    try {
      await client.patch(id) 
        .set({ people: signaturesToSave }) 
        .commit();
      alert('All signatures saved successfully!');
    } catch (error) {
      console.error('Error saving signatures:', error);
    }
  };

  return (
    <div>
    <Navbar/>
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
      {/* <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={printBill}
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
          Print Bill
        </button>
      </div> */}

      {/* Modal for Signature */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '300px',
          },
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Sign Here</h2>
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
            margin: '0 auto',
            flex: '1',
          }}
        />
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <button
            onClick={handleSaveSignature}
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
            Save Signature
          </button>
        </div>
      </Modal>
    </div>
    </div>
  );
}
