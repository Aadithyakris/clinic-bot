import React, { useState } from 'react';
import axios from 'axios';

const BookedSlots = () => {
  const [date, setDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState('');

  const fetchBookedSlots = async () => {
    if (!date) return setError('Please select a date');
    setError('');

    try {
      const res = await axios.get(`https://clinic-bot-backend.onrender.com/api/slots?date=${date}`);
      const slots = res.data;

      const booked = slots.filter((slot) => slot.isBooked);

      // Optional: Sort booked slots by time
      booked.sort((a, b) => {
        const toMinutes = (t) => {
          const [time, ampm] = t.split(' ');
          let [h, m] = time.split(':').map(Number);
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };
        return toMinutes(a.time) - toMinutes(b.time);
      });

      setBookedSlots(booked);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
      setError('Failed to fetch booked slots');
    }
  };

  return (
    <div>
      <h2>📕 View Booked Slots</h2>

      <label>Select Date:</label><br />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      /><br /><br />

      <button onClick={fetchBookedSlots}>Show Booked Slots</button><br /><br />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {bookedSlots.map((slot) => (
          <li key={slot.id} style={{ marginBottom: '12px' }}>
            <strong>{slot.time}</strong><br />
            Name: {slot.patient?.name || 'N/A'}<br />
            Age: {slot.patient?.age || 'N/A'}<br />
            Contact: {slot.patient?.contact || 'N/A'}
          </li>
        ))}
        {bookedSlots.length === 0 && !error && <p>No booked slots for this date.</p>}
      </ul>
    </div>
  );
};

export default BookedSlots;
