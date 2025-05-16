'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">NA</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">NiceAussie</h2>
            <p className="text-gray-500 dark:text-gray-400">john@example.com</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <p className="mt-1 text-gray-900 dark:text-white">John Doe</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Emergency Contact
            </label>
            <p className="mt-1 text-gray-900 dark:text-white">+61 123 456 789</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Member Since
            </label>
            <p className="mt-1 text-gray-900 dark:text-white">March 2024</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/settings')}
          className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Edit Profile
        </button>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full bg-red-50 dark:bg-red-900/50 p-4 rounded-xl shadow text-left text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>

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