import React, { useState } from 'react';
import axios from 'axios';

const BookedSlots = () => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const fetchBookedSlots = async () => {
    try {
      const res = await axios.get(`https://clinic-bot-backend.onrender.com/api/booked-slots?date=${date}`);
      if (res.data.length === 0) {
        setMessage('No booked slots for this date.');
      } else {
        setMessage('');
      }
      setBookedSlots(res.data);
    } catch (err) {
      console.error('Error fetching booked slots', err);
      setMessage('Error fetching booked slots');
    }
  };

  return (
    <div>
      <h2>Booked Slots</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={fetchBookedSlots}>Fetch Booked Slots</button>
      {message && <p>{message}</p>}
      <ul>
        {bookedSlots.map(slot => (
          <li key={slot.id}>
            ⏰ {slot.time} — 👤 {slot.name} (🎂 {slot.age}) 📞 {slot.contact}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookedSlots;
