'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/useUser'
import { fetchUserSettings, upsertUserSettings } from '@/lib/userService'

const initialSettings = {
  notifications_enabled: true,
  allow_sending_emergency_notifications: true,
  location_tracking_enabled: true,
  allow_receiving_emergency_notifications: true,
}

type SettingsType = typeof initialSettings

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType>({ ...initialSettings })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: userLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 3

    const fetchSettingsData = async () => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchUserSettings(user.id)
        if (mounted) {
          const sanitized: SettingsType = { ...initialSettings, ...data }
          setSettings(sanitized)
        }
      } catch (err: any) {
        if (mounted) {
          setError("Failed to load settings")
        }
      }
      if (mounted) {
        setLoading(false)
      }
    }

    const attemptFetch = async () => {
      if (!user && !userLoading) {
        if (retryCount < maxRetries) {
          retryCount++
          // Wait a bit before retrying
          setTimeout(attemptFetch, 1000)
          return
        }
        router.push('/')
        return
      }
      if (user) {
        await fetchSettingsData()
      }
    }

    attemptFetch()

    return () => {
      mounted = false
    }
  }, [user, userLoading, router])

  function handleToggle(key: keyof SettingsType) {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      if (key === 'location_tracking_enabled' && user) {
        upsertUserSettings(user.id, { location_tracking_enabled: !prev[key] })
      }
      return updated
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    if (!user) {
      setError("Not logged in")
      setSaving(false)
      return
    }
    try {
      await upsertUserSettings(user.id, settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError("Please check all details and save again")
    }
    setSaving(false)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400 space-y-6">
          {/* <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">App Notifications</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive general app notifications (reminders, health updates, etc.)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={() => handleToggle('notifications_enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div> */}

          {/* <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Allow Sending Emergency Notifications</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Allow this device to send emergency alerts to your contacts and call center.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_sending_emergency_notifications}
                onChange={() => handleToggle('allow_sending_emergency_notifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div> */}

          {/* <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Allow Receiving Emergency Notifications</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Allow this device to receive emergency alerts from your contacts or call center.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_receiving_emergency_notifications}
                onChange={() => handleToggle('allow_receiving_emergency_notifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div> */}

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Location Tracking</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Allow tracking of your location for emergency services</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.location_tracking_enabled}
                onChange={() => handleToggle('location_tracking_enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <div className="text-green-600 dark:text-green-400 text-center mt-2">Settings saved!</div>
          )}
        </form>
      </div>
    </div>
  )
}