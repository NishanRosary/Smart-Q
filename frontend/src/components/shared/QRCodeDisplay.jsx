import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ eventData, size = 200 }) => {
  // Create QR code data as JSON string
  const qrData = JSON.stringify({
    eventId: eventData.id,
    eventTitle: eventData.title,
    date: eventData.date,
    time: eventData.time,
    organizationType: eventData.organizationType,
    location: eventData.location
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#fff',
      borderRadius: '8px'
    }}>
      <QRCodeSVG
        value={qrData}
        size={size}
        level="H"
        includeMargin={true}
      />
      <p style={{ 
        fontSize: '0.875rem', 
        color: '#6B7280', 
        textAlign: 'center',
        maxWidth: '200px'
      }}>
        Scan to book slot for {eventData.title}
      </p>
    </div>
  );
};

export default QRCodeDisplay;

