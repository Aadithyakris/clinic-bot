// src/AdminPanel.js
import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SlotForm from './components/SlotForm';
import SlotList from './components/SlotList';
import BookedSlotList from './components/BookedSlotList';
import QrCodePage from './components/QrCodePage';
import AdminLogin from './components/AdminLogin';

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div>
      <h1>Doctor Admin Panel</h1>
      <nav>
        <Link to="/admin">Generate Slots</Link> |{" "}
        <Link to="/admin/slots">Available Slots</Link> |{" "}
        <Link to="/admin/booked">Booked Slots</Link> |{" "}
        <Link to="/admin/qr">QR Code</Link>
      </nav>
      <hr />
      <Routes>
        <Route path="/admin" element={<SlotForm />} />
        <Route path="/admin/slots" element={<SlotList />} />
        <Route path="/admin/booked" element={<BookedSlotList />} />
        <Route path="/admin/qr" element={<QrCodePage />} />
      </Routes>
    </div>
  );
}

export default AdminPanel;
