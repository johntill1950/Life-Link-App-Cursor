import { getDatabase, ref, push, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import html2canvas from 'html2canvas';
import { getApps, initializeApp } from 'firebase/app';

interface AlertThresholds {
  heartRate: number;
  oxygen: number;
  movement: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

interface AlertData {
  userId: string;
  userName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  vitals: {
    heartRate: number;
    oxygen: number;
    movement: number;
  };
  timestamp: number;
  screenshot?: string;
}

interface SimulationData {
  thresholds: AlertThresholds;
  vitals: {
    heartRate: number;
    oxygen: number;
    movement: number;
  };
}

class NotificationService {
  private db = null;
  private auth = getAuth();

  constructor() {
    if (typeof window !== 'undefined') {
      let app;
      if (!getApps().length) {
        app = initializeApp({
          // ... your firebaseConfig here, or import from firebase.ts
        });
      } else {
        app = getApps()[0];
      }
      this.db = getDatabase(app);
    }
  }

  // Store alert thresholds
  async setAlertThresholds(thresholds: AlertThresholds) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const thresholdsRef = ref(this.db, `users/${user.uid}/alertThresholds`);
    await set(thresholdsRef, thresholds);
  }

  // Get alert thresholds
  async getAlertThresholds(): Promise<AlertThresholds> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const thresholdsRef = ref(this.db, `users/${user.uid}/alertThresholds`);
    const snapshot = await get(thresholdsRef);
    return snapshot.val() || {
      heartRate: 60,
      oxygen: 95,
      movement: 30
    };
  }

  // Store emergency contacts
  async setEmergencyContacts(contacts: EmergencyContact[]) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const contactsRef = ref(this.db, `users/${user.uid}/emergencyContacts`);
    await set(contactsRef, contacts);
  }

  // Get emergency contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const contactsRef = ref(this.db, `users/${user.uid}/emergencyContacts`);
    const snapshot = await get(contactsRef);
    return snapshot.val() || [];
  }

  // Get simulation data
  async getSimulationData(): Promise<SimulationData | null> {
    try {
      const simulationRef = ref(this.db, 'simulation');
      const snapshot = await get(simulationRef);
      return snapshot.val();
    } catch (error) {
      console.error('Error getting simulation data:', error);
      return null;
    }
  }

  // Create a new alert
  async createAlert(alertData: AlertData): Promise<string> {
    try {
      // Use the vitals provided in alertData directly
      const vitals = alertData.vitals;
      const alertRef = ref(this.db, 'alerts');
      const newAlertRef = push(alertRef);

      await set(newAlertRef, {
        ...alertData,
        vitals,
        status: 'pending',
        createdAt: Date.now()
      });

      return newAlertRef.key || '';
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  // Cancel an alert
  async cancelAlert(alertId: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const alertRef = ref(this.db, `alerts/${alertId}`);
    const snapshot = await get(alertRef);
    const alert = snapshot.val();

    if (alert && alert.userId === user.uid) {
      await set(alertRef, {
        ...alert,
        status: 'cancelled',
        cancelledAt: Date.now()
      });
    }
  }

  // Notify emergency call center
  private async notifyEmergencyCallCenter(alert: AlertData) {
    const callCenterRef = ref(this.db, 'emergencyCallCenter/notifications');
    await push(callCenterRef, {
      ...alert,
      type: 'emergency',
      priority: 'high',
      receivedAt: Date.now()
    });
  }

  // Notify emergency contact
  private async notifyEmergencyContact(contact: EmergencyContact, alert: AlertData) {
    // Store notification in database
    const contactNotificationsRef = ref(this.db, `users/${contact.id}/notifications`);
    await push(contactNotificationsRef, {
      ...alert,
      type: 'emergency_contact',
      priority: 'high',
      receivedAt: Date.now()
    });

    // TODO: Implement email sending
    // This would typically use a service like SendGrid or AWS SES
    console.log(`Sending email to ${contact.email} about emergency alert`);
  }

  // Capture and store screenshot
  async captureScreenshot(): Promise<string> {
    try {
      // Get the dashboard element
      const dashboardElement = document.querySelector('.dashboard-container');
      if (!dashboardElement) {
        throw new Error('Dashboard element not found');
      }

      // Capture the screenshot
      const canvas = await html2canvas(dashboardElement, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        logging: false, // Disable logging
        backgroundColor: '#ffffff' // White background
      });

      // Convert to base64
      const base64Image = canvas.toDataURL('image/png');

      // Store in Firebase Storage (we'll implement this next)
      const imageRef = ref(this.db, `screenshots/${this.auth.currentUser?.uid}/${Date.now()}`);
      await set(imageRef, {
        url: base64Image,
        timestamp: Date.now()
      });

      return base64Image;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return '';
    }
  }
}

export const notificationService = new NotificationService(); 