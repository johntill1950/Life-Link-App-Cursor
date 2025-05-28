import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create a Supabase client with the service role key
    const supabase = createRouteHandlerClient({ cookies }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    })

    // Create settings using service role client
    const { error } = await supabase
      .from('settings')
      .insert({
        id: userId,
        notifications_enabled: true,
        location_tracking_enabled: true,
        dark_mode_enabled: false,
        emergency_alerts_enabled: true,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Settings creation error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
} 