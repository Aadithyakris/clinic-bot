// src/components/BookingPage.js
import React, { useState } from 'react';
import axios from 'axios';

const BookingPage = () => {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`https://clinic-bot-backend.onrender.com/api/slots?date=${date}`);
      setSlots(res.data);
    } catch (error) {
      console.error('Error fetching slots', error);
      setMessage('Failed to load slots.');
    }
  };

  const handleBooking = async () => {
    try {
      const res = await axios.post('https://clinic-bot-backend.onrender.com/api/book-slot', {
        slotId: selectedSlotId,
        name,
        age,
        contact
      });
      setMessage(res.data.message);
    } catch (error) {
      console.error('Booking error', error);
      setMessage('Booking failed.');
    }
  };

  return (
    <div>
      <h2>Book Appointment</h2>

      <label>Date:</label><br />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={fetchSlots}>Show Slots</button><br /><br />

      {slots.length > 0 && (
        <>
          <label>Select a Slot:</label><br />
          <select onChange={(e) => setSelectedSlotId(e.target.value)}>
            <option value="">--Select--</option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>{slot.time}</option>
            ))}
          </select><br /><br />
        </>
      )}

      {selectedSlotId && (
        <>
          <label>Name:</label><br />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />

          <label>Age:</label><br />
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} /><br /><br />

          <label>Contact:</label><br />
          <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} /><br /><br />

          <button onClick={handleBooking}>Book</button>
        </>
      )}

      <br /><br />
      {message && <p>{message}</p>}
    </div>
  );
};

export default BookingPage;
