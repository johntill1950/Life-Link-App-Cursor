import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
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