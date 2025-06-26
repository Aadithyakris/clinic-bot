import React, { useState } from 'react';
import axios from 'axios';

const SlotList = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`https://clinic-bot-backend.onrender.com/api/slots?date=${date}`);
      setSlots(res.data);
    } catch (err) {
      console.error('Error fetching slots', err);
    }
  };

  return (
    <div>
      <h2>Available Slots</h2>
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        value={date}
      />
      <button onClick={fetchSlots}>Fetch Slots</button>
      <ul>
        {slots.map((slot) => (
          <li key={slot.id}>{slot.time}</li>
        ))}
      </ul>
    </div>
  );
};

export default SlotList;
