"use client";

import { format } from 'date-fns';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Terms of Service</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing and using Life Link, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Medical Disclaimer</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Life Link is not a medical device and is not intended to diagnose, treat, cure, or prevent any medical condition. The application is designed to monitor and alert emergency contacts in case of potential health concerns, but it is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. User Responsibilities</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              As a user of Life Link, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Wear your smart device correctly and consistently as recommended by the manufacturer</li>
              <li>Keep your device charged and in good working condition</li>
              <li>Maintain accurate and up-to-date emergency contact information</li>
              <li>Allow location tracking for emergency response purposes</li>
              <li>Keep your medical information and emergency contacts updated</li>
              <li>Respond to test alerts and system checks when requested</li>
              <li>Not tamper with or attempt to modify the monitoring system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To the maximum extent permitted by law, Life Link and its creators:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Are not responsible for any false alarms or missed alerts</li>
              <li>Cannot guarantee the accuracy of health metrics or alerts</li>
              <li>Are not liable for any damages arising from the use or inability to use the service</li>
              <li>Are not responsible for the actions or inactions of emergency contacts</li>
              <li>Cannot guarantee the availability or reliability of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Service Limitations</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Life Link's effectiveness depends on:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Proper device placement and maintenance</li>
              <li>Internet connectivity and GPS signal availability</li>
              <li>Battery life and device functionality</li>
              <li>Accuracy of user-provided information</li>
              <li>Response time of emergency contacts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Termination</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to terminate or suspend access to Life Link for any user who violates these terms or engages in misuse of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">7. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may modify these terms at any time. Continued use of Life Link after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 