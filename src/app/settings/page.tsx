'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/useUser'

interface UserSettings {
  id: string
  user_id: string
  notifications_enabled: boolean
  location_tracking_enabled: boolean
  dark_mode_enabled: boolean
  emergency_alerts_enabled: boolean
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser();
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user && !userLoading) {
      setError('Not logged in')
      setLoading(false)
      router.push('/login')
      return
    }
    if (!user) return
    fetchSettings()
  }, [user, userLoading])

  useEffect(() => {
    if (settings) {
      if (settings.dark_mode_enabled) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings?.dark_mode_enabled])

  async function fetchSettings() {
    setLoading(true)
    setError('')
    const supabase = getSupabaseClient()
    const userId = user?.id
    if (!userId) {
      setError('Not logged in')
      setLoading(false)
      router.push('/login')
      return
    }
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error) {
      // If not found, create default settings
      if (error.code === 'PGRST116' || error.message.includes('No rows')) {
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert({
            user_id: userId,
            notifications_enabled: true,
            location_tracking_enabled: true,
            dark_mode_enabled: false,
            emergency_alerts_enabled: true,
          })
          .select()
          .single()
        if (insertError || !newSettings || !newSettings.id) {
          setError('Failed to create settings.')
          setSettings(null)
        } else {
          setSettings(newSettings as unknown as UserSettings)
        }
      } else {
        setError('Failed to load settings.')
        setSettings(null)
      }
    } else {
      if (!data || !data.id) {
        setError('Settings not found.')
        setSettings(null)
      } else {
        setSettings(data as unknown as UserSettings)
      }
    }
    setLoading(false)
  }

  function handleToggle(key: keyof Omit<UserSettings, 'id' | 'user_id' | 'created_at'>) {
    if (!settings) return
    setSettings({ ...settings, [key]: !settings[key] })
  }

  async function handleSave() {
    setError('')
    setSuccess('')
    if (!settings) return
    setLoading(true)
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('settings')
      .update({
        notifications_enabled: settings.notifications_enabled,
        location_tracking_enabled: settings.location_tracking_enabled,
        dark_mode_enabled: settings.dark_mode_enabled,
        emergency_alerts_enabled: settings.emergency_alerts_enabled,
      })
      .eq('id', settings.id)
    if (error) {
      setError('Failed to save settings.')
    } else {
      setSuccess('Settings saved!')
    }
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!settings) return <div>No settings found.</div>

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Notifications</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your health metrics</p>
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
          </div>

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

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Dark Mode</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dark_mode_enabled}
                onChange={() => handleToggle('dark_mode_enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-gray-900 dark:text-white font-medium">Emergency Alerts</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts for critical health conditions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emergency_alerts_enabled}
                onChange={() => handleToggle('emergency_alerts_enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <button
          className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        
        {success && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}