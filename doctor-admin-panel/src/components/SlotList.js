import React, { useState } from 'react';
import axios from 'axios';

const SlotList = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');

  // const fetchSlots = async () => {
  //   try {
  //     const res = await axios.get(`https://clinic-bot-backend.onrender.com/api/slots?date=${date}`);
  //     setSlots(res.data);
  //   } catch (err) {
  //     console.error('Error fetching slots', err);
  //   }
  // };

  const fetchSlots = async () => {
  try {
    const res = await axios.get(`https://clinic-bot-backend.onrender.com/api/slots?date=${date}`);
    
    const sortedSlots = res.data.sort((a, b) => {
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      return parseTime(a.time) - parseTime(b.time);
    });

    setSlots(sortedSlots);
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
