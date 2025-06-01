import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY || '');

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  static async sendEmail({ to, subject, text, html }: EmailData) {
    try {
      const msg = {
        to,
        from: process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL || 'alerts@lifelink.com',
        subject,
        text,
        html,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendEmergencyAlert(contact: { name: string; email: string }, alertData: any) {
    const subject = 'EMERGENCY ALERT: LifeLink User Needs Assistance';
    const text = `
      Emergency Alert for ${alertData.userName}
      
      Location: ${alertData.location.address}
      Coordinates: ${alertData.location.lat}, ${alertData.location.lng}
      
      Vitals:
      - Heart Rate: ${alertData.vitals.heartRate} BPM
      - Oxygen: ${alertData.vitals.oxygen}%
      - Movement: ${alertData.vitals.movement}%
      
      Please respond immediately.
    `;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">EMERGENCY ALERT</h1>
        <p style="font-size: 18px; margin-bottom: 20px;">
          A LifeLink user needs immediate assistance.
        </p>
        
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-bottom: 10px;">User Details</h2>
          <p><strong>Name:</strong> ${alertData.userName}</p>
          <p><strong>Location:</strong> ${alertData.location.address}</p>
          <p><strong>Coordinates:</strong> ${alertData.location.lat}, ${alertData.location.lng}</p>
        </div>
        
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-bottom: 10px;">Vital Signs</h2>
          <p><strong>Heart Rate:</strong> ${alertData.vitals.heartRate} BPM</p>
          <p><strong>Oxygen Level:</strong> ${alertData.vitals.oxygen}%</p>
          <p><strong>Movement:</strong> ${alertData.vitals.movement}%</p>
        </div>
        
        <p style="font-size: 16px; color: #dc2626; font-weight: bold;">
          Please respond to this emergency immediately.
        </p>
      </div>
    `;

    return this.sendEmail({ to: contact.email, subject, text, html });
  }
} 