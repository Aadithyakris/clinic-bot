import React, { useState } from 'react';
import axios from 'axios';

const SlotForm = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [numberOfSlots, setNumberOfSlots] = useState('');
  const [message, setMessage] = useState('');

  const handleGenerateSlots = async () => {
    try {
      const response = await axios.post('https://clinic-bot-backend.onrender.com/api/slots/generate', {
        date,
        startTime,
        endTime,
        numberOfSlots: parseInt(numberOfSlots),
      });

      setMessage(response.data.message);
    } catch (error) {
      console.error('Error generating slots:', error);
      setMessage('Failed to generate slots');
    }
  };

  return (
    <div>
      <h2>Generate Slots</h2>

      <label>Date:</label><br />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><br /><br />

      <label>Start Time (e.g. 10:00 AM):</label><br />
      <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="HH:MM AM/PM" /><br /><br />

      <label>End Time (e.g. 12:00 PM):</label><br />
      <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="HH:MM AM/PM" /><br /><br />

      <label>Number of Slots:</label><br />
      <input type="number" value={numberOfSlots} onChange={(e) => setNumberOfSlots(e.target.value)} /><br /><br />

      <button onClick={handleGenerateSlots}>Generate</button><br /><br />
      {message && <p>{message}</p>}
    </div>
  );
};

export default SlotForm;
