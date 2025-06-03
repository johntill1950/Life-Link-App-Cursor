import React, { useState } from 'react';
import { requestNotificationPermission } from '../lib/firebase';

const NotificationButton = () => {
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const handleEnableNotifications = async () => {
    try {
      const t = await requestNotificationPermission();
      setToken(t as string);
      setMessage('Notifications enabled!');
    } catch (e: any) {
      setMessage('Failed to enable notifications: ' + e.message);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '1rem auto', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>Notifications</h3>
      <button onClick={handleEnableNotifications}>Enable Notifications</button>
      {message && <div style={{ color: message.includes('Failed') ? 'red' : 'green' }}>{message}</div>}
      {token && <div style={{ wordBreak: 'break-all', fontSize: 12, marginTop: 8 }}>Token: {token}</div>}
    </div>
  );
};

export default NotificationButton; 