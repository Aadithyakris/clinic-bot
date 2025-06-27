// src/components/BookingForm.js
import React, { useState } from 'react';
import axios from 'axios';

const BookingForm = () => {
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`https://clinic-bot-backend.onrender.com/api/slots?date=${date}`);
      setAvailableSlots(res.data);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    }
  };

  const handleBook = async () => {
    if (!selectedSlotId || !name || !age || !contact) {
      setMessage('❌ Please fill all the fields.');
      return;
    }

    try {
      const res = await axios.post('https://clinic-bot-backend.onrender.com/api/book', {
        slotId: selectedSlotId,
        name,
        age,
        contact,
      });

      setMessage(res.data.message || '✅ Appointment booked!');
    } catch (err) {
      console.error('Booking error:', err);
      setMessage('❌ Failed to book appointment.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Book an Appointment</h2>

      <label>Select Date:</label><br />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={fetchSlots}>Check Slots</button>

      {availableSlots.length > 0 && (
        <>
          <label>Select Time Slot:</label><br />
          <select onChange={(e) => setSelectedSlotId(e.target.value)} value={selectedSlotId}>
            <option value="">-- Select a time --</option>
            {availableSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>{slot.time}</option>
            ))}
          </select><br />
        </>
      )}

      <br />
      <label>Name:</label><br />
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} /><br />

      <label>Age:</label><br />
      <input type="number" value={age} onChange={(e) => setAge(e.target.value)} /><br />

      <label>Contact Number:</label><br />
      <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} /><br /><br />

      <button onClick={handleBook}>Book Slot</button><br /><br />
      {message && <p>{message}</p>}
    </div>
  );
};

export default BookingForm;
