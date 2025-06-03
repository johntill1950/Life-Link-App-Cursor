import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { useUser } from '@/lib/useUser';

export default function NotificationManager() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const { user, loading: userLoading } = useUser();

  const requestPermission = useCallback(async () => {
    try {
      if (!user) {
        console.log('User not logged in');
        return;
      }
      console.log('Requesting notification permission...');
      const token = await requestNotificationPermission();
      console.log('Notification permission granted. Token:', token);
      setNotificationToken(token);
      setNotificationPermission('granted');
    } catch (error) {
      console.error('Failed to get notification permission:', error);
      setNotificationPermission('denied');
    }
  }, [user]);

  useEffect(() => {
    console.log('NotificationManager mounted');
    console.log('User loading state:', userLoading);
    console.log('User state:', user);
    console.log('Current notification permission:', Notification.permission);

    // Check current permission status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload: any) => {
      console.log('Received foreground message:', payload);
      if (payload) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/icon.png'
        });
      }
    });

    return () => {
      unsubscribe;
    };
  }, []); // Empty dependency array since we only need to set this up once

  // Debug log before render
  console.log('Rendering NotificationManager:', {
    notificationPermission,
    userLoading,
    user: !!user
  });

  return (
    <div className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50">
      {notificationPermission === 'granted' ? (
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Notifications enabled
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Enable notifications to receive important alerts
          </p>
          <button
            onClick={requestPermission}
            disabled={userLoading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              userLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {userLoading ? 'Loading...' : 'Enable Notifications'}
          </button>
        </>
      )}
    </div>
  );
} 