import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ eventData, size = 200 }) => {
  const eventId = eventData?.id || eventData?._id;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost:3000';

  // Deep link into app so camera scanners open the selected event flow directly.
  const qrData = `${origin}/?eventId=${encodeURIComponent(String(eventId || ''))}`;

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

