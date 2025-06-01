import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu8OOg2z9Y8fAixh-6uWH-r_v07RDHtAs",
  authDomain: "lifelinkapp-8a2dc.firebaseapp.com",
  projectId: "lifelinkapp-8a2dc",
  storageBucket: "lifelinkapp-8a2dc.firebasestorage.app",
  messagingSenderId: "137870644364",
  appId: "1:137870644364:web:38d13885beb1a27f95d7a9",
  measurementId: "G-C03F832TSD",
  databaseURL: "https://lifelinkapp-8a2dc-default-rtdb.asia-southeast1.firebasedatabase.app"
};

let app = null;
let auth = null;
let messaging = null;
let database = null;
let analytics = null;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
  }
  database = getDatabase(app);
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Error initializing Firebase analytics:', error);
  }
}

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  try {
    console.log('Checking notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission status:', permission);
    
    if (permission === 'granted' && messaging) {
      // Wait for authentication
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe(); // Stop listening to auth changes
          
          if (user) {
            try {
              console.log('Getting FCM token...');
              const token = await getToken(messaging, {
                vapidKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuHkr3KDUbmIUeN0lku3QJ89P8'
              });
              console.log('FCM token received:', token);
              resolve(token);
            } catch (error) {
              console.error('Error getting FCM token:', error);
              reject(error);
            }
          } else {
            console.log('User not authenticated');
            reject(new Error('User not authenticated'));
          }
        });
      });
    } else {
      console.log('Notification permission denied or messaging not available');
      throw new Error('Notification permission denied or messaging not available');
    }
  } catch (error) {
    console.error('Error getting notification token:', error);
    throw error;
  }
};

// Handle incoming messages when app is in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        resolve(payload);
      });
    } else {
      console.log('Messaging not available');
      resolve(null);
    }
  });

// Real-time communication functions
export const subscribeToAlerts = (userId: string, callback: (data: any) => void) => {
  const alertsRef = ref(database, `alerts/${userId}`);
  return onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const sendAlert = async (userId: string, alertData: any) => {
  const alertsRef = ref(database, `alerts/${userId}`);
  const newAlertRef = push(alertsRef);
  await set(newAlertRef, {
    ...alertData,
    timestamp: Date.now()
  });
};

export const subscribeToUserStatus = (userId: string, callback: (data: any) => void) => {
  const statusRef = ref(database, `userStatus/${userId}`);
  return onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const updateUserStatus = async (userId: string, status: any) => {
  const statusRef = ref(database, `userStatus/${userId}`);
  await set(statusRef, {
    ...status,
    lastUpdated: Date.now()
  });
};

// Authentication helpers
export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return signOut(auth);
};

// Passwordless email link sign-in helpers
const actionCodeSettings = {
  url: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/dashboard' // Dev
    : 'https://life-link.app/dashboard', // Prod
  handleCodeInApp: true,
};

export const sendSignInEmailLink = async (email: string) => {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

export const completeSignInWithEmailLink = async () => {
  if (typeof window === 'undefined') return null;
  const email = window.localStorage.getItem('emailForSignIn');
  if (email && isSignInWithEmailLink(auth, window.location.href)) {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
    return result;
  }
  return null;
};

export { messaging, database }; 