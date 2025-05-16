'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    darkMode: false,
    emergencyAlerts: true,
    dataSharing: false,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // Here you would typically save the settings to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
      setSuccess('Settings saved successfully')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Receive alerts about your health metrics
            </p>
          </div>
          <button
            onClick={() => handleToggle('notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Location Tracking */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Location Tracking</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Allow the app to track your location
            </p>
          </div>
          <button
            onClick={() => handleToggle('locationTracking')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              settings.locationTracking ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.locationTracking ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark themes
            </p>
          </div>
          <button
            onClick={() => handleToggle('darkMode')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              settings.darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Emergency Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Emergency Alerts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Receive critical health alerts
            </p>
          </div>
          <button
            onClick={() => handleToggle('emergencyAlerts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              settings.emergencyAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.emergencyAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Data Sharing */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Sharing</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share your health data with healthcare providers
            </p>
          </div>
          <button
            onClick={() => handleToggle('dataSharing')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              settings.dataSharing ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.dataSharing ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/50 text-green-500 dark:text-green-400 p-4 rounded-xl">
          {success}
        </div>
      )}
    </div>
  )
} 