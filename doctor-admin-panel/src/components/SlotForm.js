import React, { useState } from 'react';
import axios from 'axios';

const SlotForm = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [numberOfSlots, setNumberOfSlots] = useState('');
  const [message, setMessage] = useState('');

  // Format input like "930am" -> "09:30 AM"
  const formatTimeInput = (input) => {
    const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
    const timeMatch = cleaned.match(/^(\d{1,2})(\d{2})?(AM|PM)$/);

    if (!timeMatch) return input;

    let [_, hourStr, minuteStr, ampm] = timeMatch;
    let hour = hourStr.padStart(2, '0');
    let minute = minuteStr || '00';

    return `${hour}:${minute} ${ampm}`;
  };

  const handleGenerateSlots = async () => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;

    if (!timeRegex.test(startTime)) {
      setMessage('❌ Invalid start time. Use format HH:MM AM/PM (e.g. 10:30 AM)');
      return;
    }

    if (!timeRegex.test(endTime)) {
      setMessage('❌ Invalid end time. Use format HH:MM AM/PM (e.g. 12:00 PM)');
      return;
    }

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
      setMessage('❌ Failed to generate slots');
    }
  };

  return (
    <div>
      <h2>Generate Slots</h2>

      <label>Date:</label><br />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><br /><br />

      <label>Start Time (e.g. 10:00 AM):</label><br />
      <input
        type="text"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        onBlur={() => setStartTime(formatTimeInput(startTime))}
        placeholder="HH:MM AM/PM"
      /><br /><br />

      <label>End Time (e.g. 12:00 PM):</label><br />
      <input
        type="text"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        onBlur={() => setEndTime(formatTimeInput(endTime))}
        placeholder="HH:MM AM/PM"
      /><br /><br />

      <label>Number of Slots:</label><br />
      <input type="number" value={numberOfSlots} onChange={(e) => setNumberOfSlots(e.target.value)} /><br /><br />

      <button onClick={handleGenerateSlots}>Generate</button><br /><br />
      {message && <p>{message}</p>}
    </div>
  );
};

export default SlotForm;
