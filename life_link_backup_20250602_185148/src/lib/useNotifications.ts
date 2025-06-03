import { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  onMessageListener,
  subscribeToAlerts,
  sendAlert,
  subscribeToUserStatus,
  updateUserStatus
} from './firebase';

export const useNotifications = (userId: string) => {
  const [notification, setNotification] = useState<any>(null);
  const [isTokenFound, setTokenFound] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission()
      .then((token) => {
        setTokenFound(true);
        console.log('Notification token:', token);
        // Here you would typically send this token to your backend
      })
      .catch((err) => {
        console.error('Failed to get notification token:', err);
      });

    // Listen for foreground messages
    onMessageListener()
      .then((payload: any) => {
        setNotification(payload);
        // Handle the notification as needed
      })
      .catch((err) => {
        console.error('Failed to receive message:', err);
      });

    // Subscribe to alerts
    const unsubscribeAlerts = subscribeToAlerts(userId, (data) => {
      if (data) {
        const alertsArray = Object.entries(data).map(([id, alert]: [string, any]) => ({
          id,
          ...alert
        }));
        setAlerts(alertsArray);
      }
    });

    // Subscribe to user status
    const unsubscribeStatus = subscribeToUserStatus(userId, (data) => {
      setUserStatus(data);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeAlerts();
      unsubscribeStatus();
    };
  }, [userId]);

  const sendNewAlert = async (alertData: any) => {
    try {
      await sendAlert(userId, alertData);
    } catch (error) {
      console.error('Failed to send alert:', error);
      throw error;
    }
  };

  const updateStatus = async (status: any) => {
    try {
      await updateUserStatus(userId, status);
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  };

  return {
    notification,
    isTokenFound,
    alerts,
    userStatus,
    sendNewAlert,
    updateStatus
  };
}; 