// src/components/QrCodePage.js
import React from 'react';
import QRCode from 'qrcode.react';

const QrCodePage = () => {
  const bookingUrl = 'http://localhost:3000/book'; // change to your deployed URL later

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>📱 Scan to Book Your Appointment</h2>
      <QRCode value={bookingUrl} size={256} />
      <p style={{ marginTop: '10px' }}>{bookingUrl}</p>
    </div>
  );
};

export default QrCodePage;
