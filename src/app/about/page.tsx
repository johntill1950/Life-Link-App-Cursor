export default function AboutPage() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About Life Link</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Life Link is dedicated to providing real-time health monitoring and emergency response
            solutions. We believe in empowering individuals to take control of their health while
            ensuring they have access to immediate assistance when needed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Real-time heart rate monitoring</li>
            <li>Oxygen saturation tracking</li>
            <li>Movement and activity analysis</li>
            <li>Location tracking for emergency response</li>
            <li>Historical data visualization</li>
            <li>Emergency contact integration</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Privacy & Security</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your health data is encrypted and stored securely. We comply with all relevant privacy
            regulations and never share your information without your explicit consent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Contact</h2>
          <p className="text-gray-600 dark:text-gray-300">
            For support or inquiries, please contact us at:
            <br />
            <a
              href="mailto:support@lifelink.app"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@lifelink.app
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Version</h2>
          <p className="text-gray-600 dark:text-gray-300">Life Link v1.0.0</p>
        </div>
      </div>
    </div>
  )
} 