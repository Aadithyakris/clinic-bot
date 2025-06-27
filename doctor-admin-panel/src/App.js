import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SlotForm from './components/SlotForm';
import SlotList from './components/SlotList';
import BookedSlotList from './components/BookedSlotList';
import QrCodePage from './components/QrCodePage';
import BookingForm from './components/BookingForm'; // you'll create this in step 5

function App() {
  return (
    <Router>
      <div>
        <h1>Doctor Admin Panel</h1>
        <Routes>
          <Route path="/" element={<SlotForm />} />
          <Route path="/slots" element={<SlotList />} />
          <Route path="/booked" element={<BookedSlotList />} />
          <Route path="/qr" element={<QrCodePage />} />
          <Route path="/book" element={<BookingForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
