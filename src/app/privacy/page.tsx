"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Your Privacy is Our Priority</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              At Life Link, we understand the sensitive nature of health-related data. We are committed to protecting your privacy and ensuring the security of your personal information. This policy outlines how we collect, use, and protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Data Security Measures</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement industry-leading security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>End-to-end encryption for all data transmission</li>
              <li>Secure cloud storage with regular security audits</li>
              <li>Multi-factor authentication for account access</li>
              <li>Regular security updates and patches</li>
              <li>Strict access controls and authentication protocols</li>
              <li>Compliance with international data protection standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Information We Collect</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect only the information necessary to provide our service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Basic profile information (name, contact details)</li>
              <li>Health metrics from your smart device</li>
              <li>Location data (only when an emergency is detected)</li>
              <li>Emergency contact information</li>
              <li>Medical history and notes (provided by you)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your information is used solely for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Monitoring your health metrics</li>
              <li>Alerting emergency contacts when necessary</li>
              <li>Improving our service and user experience</li>
              <li>Maintaining system security and reliability</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Data Protection Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of non-essential data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Third-Party Access</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell or share your personal information with third parties except:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Your designated emergency contacts during emergencies</li>
              <li>Emergency services when necessary</li>
              <li>Service providers who assist in operating our platform (under strict confidentiality)</li>
              <li>When required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your data only as long as necessary to provide our service. You can request data deletion at any time, and we will remove your information from our systems within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about our privacy practices or would like to exercise your data protection rights, please contact our privacy team.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 