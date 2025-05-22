'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

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
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setError('Not logged in')
      setLoading(false)
      router.push('/login')
      return
    }
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (error) {
      // If not found, create default settings
      if (error.code === 'PGRST116' || error.message.includes('No rows')) {
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert({
            user_id: user.id,
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
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">Settings</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
        <div className="flex items-center justify-between">
          <span className="dark:text-gray-100">Notifications</span>
          <input
            type="checkbox"
            checked={settings.notifications_enabled}
            onChange={() => handleToggle('notifications_enabled')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="dark:text-gray-100">Location Tracking</span>
          <input
            type="checkbox"
            checked={settings.location_tracking_enabled}
            onChange={() => handleToggle('location_tracking_enabled')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="dark:text-gray-100">Dark Mode</span>
          <input
            type="checkbox"
            checked={settings.dark_mode_enabled}
            onChange={() => handleToggle('dark_mode_enabled')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="dark:text-gray-100">Emergency Alerts</span>
          <input
            type="checkbox"
            checked={settings.emergency_alerts_enabled}
            onChange={() => handleToggle('emergency_alerts_enabled')}
          />
        </div>
      </div>
      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}