import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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