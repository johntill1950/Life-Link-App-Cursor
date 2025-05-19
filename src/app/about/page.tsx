'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AboutPage() {
  const [about, setAbout] = useState('')
  const [help, setHelp] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('about_content')
          .select('section, content')
        if (error) throw error
        if (data) {
          const aboutSection = data.find((row: any) => row.section === 'about')
          const helpSection = data.find((row: any) => row.section === 'help')
          setAbout(aboutSection?.content || '')
          setHelp(helpSection?.content || '')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load content')
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [])

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">About Life-Link.app</h2>
      <div className="mb-8">
        <p className="whitespace-pre-wrap">{about}</p>
      </div>
      <h2 className="text-xl font-bold mb-2">How you can help</h2>
      <div>
        <p className="whitespace-pre-wrap">{help}</p>
      </div>
    </div>
  )
}