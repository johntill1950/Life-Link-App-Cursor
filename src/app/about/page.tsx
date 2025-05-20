'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const DUMMY_ABOUT = `<h2>About Life-Link.app</h2><p>This is <b>dummy about text</b> for demonstration. You can edit this as an admin.</p>`
const DUMMY_HELP = `<h2>Help</h2><ul><li>Contact support at support@example.com</li><li>Read the FAQ</li></ul>`

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function AboutPage() {
  const [about, setAbout] = useState('')
  const [help, setHelp] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Current user:', user)
        console.log('User metadata:', user?.user_metadata)
        console.log('User role:', user?.user_metadata?.role)
        
        // Check if user is admin through profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user?.id)
          .single()
        
        console.log('Profile data:', profileData)
        console.log('Is admin from profile:', profileData?.is_admin)
        
        const isUserAdmin = user?.user_metadata?.role === 'admin' || profileData?.is_admin
        console.log('Final admin status:', isUserAdmin)
        setIsAdmin(isUserAdmin)

        const { data, error } = await supabase
          .from('about_content')
          .select('section, content')
        if (error) throw error
        if (data) {
          const aboutSection = data.find((row: any) => row.section === 'about')
          const helpSection = data.find((row: any) => row.section === 'help')
          setAbout(aboutSection?.content || DUMMY_ABOUT)
          setHelp(helpSection?.content || DUMMY_HELP)
        }
      } catch (err: any) {
        console.error('Error in fetchContent:', err)
        setError(err.message || 'Failed to load content')
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      // First, get the existing records to get their IDs
      const { data: existingData, error: fetchError } = await supabase
        .from('about_content')
        .select('id, section')
      
      if (fetchError) {
        console.error('Error fetching existing data:', fetchError)
        throw fetchError
      }

      console.log('Existing data:', existingData)

      // Find the IDs for about and help sections
      const aboutId = existingData?.find(row => row.section === 'about')?.id
      const helpId = existingData?.find(row => row.section === 'help')?.id

      console.log('About ID:', aboutId, 'Help ID:', helpId)

      // Prepare the data for upsert
      const aboutData = {
        section: 'about',
        content: about,
        last_updated: new Date().toISOString()
      }

      const helpData = {
        section: 'help',
        content: help,
        last_updated: new Date().toISOString()
      }

      // Add IDs if they exist
      if (aboutId) aboutData.id = aboutId
      if (helpId) helpData.id = helpId

      console.log('About data to save:', aboutData)
      console.log('Help data to save:', helpData)

      // Upsert about
      const { error: aboutError } = await supabase
        .from('about_content')
        .upsert(aboutData)

      if (aboutError) {
        console.error('Error saving about section:', aboutError)
        throw aboutError
      }

      // Upsert help
      const { error: helpError } = await supabase
        .from('about_content')
        .upsert(helpData)

      if (helpError) {
        console.error('Error saving help section:', helpError)
        throw helpError
      }

      setSaved(true)
      // Reset saved state after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8">
      <div>
        <label className="block text-sm font-medium mb-1">About</label>
        {/* @ts-expect-error: react-quill has no types for v2+ */}
        {isAdmin ? (
          <ReactQuill value={about} onChange={setAbout} theme="snow" />
        ) : (
          <div className="prose bg-gray-100 p-2 rounded min-h-[120px]" dangerouslySetInnerHTML={{ __html: about }} />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Help</label>
        {/* @ts-expect-error: react-quill has no types for v2+ */}
        {isAdmin ? (
          <ReactQuill value={help} onChange={setHelp} theme="snow" />
        ) : (
          <div className="prose bg-gray-100 p-2 rounded min-h-[120px]" dangerouslySetInnerHTML={{ __html: help }} />
        )}
      </div>
      {isAdmin && (
        <>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {(!saving && !error && saved) && (
            <div className="text-green-600 text-center mt-2">Content saved!</div>
          )}
        </>
      )}
    </div>
  )
}