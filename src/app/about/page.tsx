"use client"

import { useEffect, useState } from 'react'
import { useSupabase } from '../../components/SupabaseProvider'
import { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from "next/navigation";
import { useUser } from '@/lib/useUser';

const DUMMY_ABOUT = `<h2>About Life-Link.app</h2><p>This is <b>dummy about text</b> for demonstration. You can edit this as an admin.</p>`
const DUMMY_HELP = `<h2>Help</h2><ul><li>Contact support at support@example.com</li><li>Read the FAQ</li></ul>`

const TEXT_SIZES = [
  { label: 'Small', prose: 'prose', editor: 'about-text-sm', fontSize: '1rem' },
  { label: 'Medium', prose: 'prose-lg', editor: 'about-text-md', fontSize: '1.125rem' },
  { label: 'Large', prose: 'prose-xl', editor: 'about-text-lg', fontSize: '1.25rem' },
  { label: 'Extra Large', prose: 'prose-2xl', editor: 'about-text-xl', fontSize: '1.5rem' },
];
const DEFAULT_TEXT_SIZE = TEXT_SIZES[1].prose; // Medium

export default function AboutPage() {
  const [about, setAbout] = useState('')
  const [help, setHelp] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();
  const supabase = useSupabase() as SupabaseClient | null;
  const { user, loading: userLoading } = useUser();
  const [textSize, setTextSize] = useState(DEFAULT_TEXT_SIZE);
  const [editorSize, setEditorSize] = useState(TEXT_SIZES[1].editor);
  const [editorFontSize, setEditorFontSize] = useState(TEXT_SIZES[1].fontSize);

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/');
      return;
    }
    if (!user) return;
    setIsLoading(true);
    setError(null);
    let profileData = null;
    (async () => {
      try {
        if (!supabase) throw new Error('Supabase client not available');
        if (user?.id) {
          const { data } = await supabase
            .from('profile')
            .select('is_admin')
            .eq('id', user.id)
            .single()
          profileData = data;
        }
        const isUserAdmin = user?.user_metadata?.role === 'admin' || profileData?.is_admin
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
        setError(err.message || 'Failed to load content')
      } finally {
        setIsLoading(false)
      }
    })();
  }, [user, userLoading, supabase, router]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('aboutTextSize') : null;
    if (stored && TEXT_SIZES.some(s => s.prose === stored)) {
      setTextSize(stored);
    }
  }, []);

  useEffect(() => {
    const sizeObj = TEXT_SIZES.find(s => s.prose === textSize) || TEXT_SIZES[1];
    setEditorSize(sizeObj.editor);
    setEditorFontSize(sizeObj.fontSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aboutTextSize', textSize);
    }
  }, [textSize]);

  if (userLoading) return <div>Loading...</div>;
  if (!user) return null;
  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-8 pb-24">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400">
          <div className="mb-6 flex items-center gap-2">
            <label className="font-medium text-gray-900 dark:text-white">Text Size:</label>
            <select
              value={textSize}
              onChange={e => setTextSize(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TEXT_SIZES.map(size => (
                <option key={size.prose} value={size.prose}>{size.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">About</label>
              <div className={`${textSize} prose dark:prose-invert bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg min-h-[120px]`} dangerouslySetInnerHTML={{ __html: about }} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Help</label>
              <div className={`${textSize} prose dark:prose-invert bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg min-h-[120px]`} dangerouslySetInnerHTML={{ __html: help }} />
            </div>
          </div>
        </div>

        <style jsx global>{`
          .ql-container, .ql-editor, .ql-toolbar {
            z-index: 1 !important;
          }
          .ql-container {
            min-height: 12em;
            height: 12em;
            max-height: 40em;
            resize: vertical;
            overflow-y: auto;
            border-radius: 0.5rem;
          }
          /* Dark mode styles for ReactQuill */
          html.dark .ql-container {
            background: #18181b;
            color: #f3f4f6;
            border-color: #27272a;
          }
          html.dark .ql-toolbar {
            background: #23272f;
            border-color: #27272a;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
          }
          html.dark .ql-editor {
            background: #18181b;
            color: #f3f4f6;
          }
          html.dark .ql-editor p,
          html.dark .ql-editor span,
          html.dark .ql-editor h1,
          html.dark .ql-editor h2,
          html.dark .ql-editor h3,
          html.dark .ql-editor h4,
          html.dark .ql-editor h5,
          html.dark .ql-editor h6 {
            color: #f3f4f6;
          }
          html.dark .prose {
            background: #23272f;
            color: #f3f4f6;
          }
          .ql-toolbar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
          }
        `}</style>
      </div>
    </div>
  )
}