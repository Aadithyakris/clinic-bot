// src/components/QrCodePage.js
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QrCodePage = () => {
  // Replace this with your actual deployed URL
  const bookingUrl = 'https://your-clinic-booking.vercel.app/book';

  return (
    <div>
      <h2>Scan to Book an Appointment</h2>
      <QRCodeSVG value={bookingUrl} size={256} />
      <p>{bookingUrl}</p>
    </div>
  );
};

export default QrCodePage;
