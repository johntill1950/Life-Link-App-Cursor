import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseInstance
}

// Types for our health monitoring data
export type HealthData = {
  id: string
  user_id: string
  heart_rate: number
  oxygen_saturation: number
  movement: number
  latitude: number
  longitude: number
  timestamp: string
}

export type UserProfile = {
  id: string
  username: string
  email: string
  full_name: string
  emergency_contact: string
  created_at: string
} 