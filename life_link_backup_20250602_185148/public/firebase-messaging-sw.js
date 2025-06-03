importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBu8OOg2z9Y8fAixh-6uWH-r_v07RDHtAs",
  authDomain: "lifelinkapp-8a2dc.firebaseapp.com",
  projectId: "lifelinkapp-8a2dc",
  storageBucket: "lifelinkapp-8a2dc.firebasestorage.app",
  messagingSenderId: "137870644364",
  appId: "1:137870644364:web:38d13885beb1a27f95d7a9",
  measurementId: "G-C03F832TSD",
  databaseURL: "https://lifelinkapp-8a2dc-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 