'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/useUser'
import { fetchUserSettings, upsertUserSettings } from '@/lib/userService'

const initialSettings = {
  location_tracking_enabled: false,
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
          if (!data) {
            await upsertUserSettings(user.id, initialSettings)
            setSettings(initialSettings)
          } else {
            const sanitized: SettingsType = { ...initialSettings, ...data }
            setSettings(sanitized)
          }
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

  const handleToggle = async (key: keyof SettingsType) => {
    const newValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newValue }))
    
    if (user) {
      try {
        await upsertUserSettings(user.id, { [key]: newValue })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (err) {
        setError("Failed to save setting")
      }
    }
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Location Services</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {settings.location_tracking_enabled 
                  ? "Location tracking is enabled. Your location will be visible to emergency contacts."
                  : "Location tracking is disabled. Your location will not be visible to emergency contacts."}
              </p>
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
          {saved && (
            <div className="text-green-600 dark:text-green-400 text-center mt-2">Setting updated!</div>
          )}
        </div>
      </div>
    </div>
  )
} 