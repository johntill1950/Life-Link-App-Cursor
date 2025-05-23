import { getSupabaseClient } from './supabase'

export async function ensureDevAuth() {
  console.log('Starting ensureDevAuth...')
  const supabase = getSupabaseClient()
  const devEmail = 'dev.user@lifelink.app'  // Match the email that's already in the database
  const devPassword = 'dev123'
  
  // Check if we're already logged in
  console.log('Checking for existing user...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('Error checking session:', sessionError)
  }
  
  if (session?.user) {
    console.log('Already logged in as:', session.user.email)
    return session.user
  }

  console.log('No existing session, attempting to sign in...')
  // Try to sign in with development credentials
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: devEmail,
    password: devPassword
  })

  if (signInError) {
    console.log('Sign in failed:', signInError.message)
    console.log('Attempting to sign up...')
    // If sign in fails, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: devEmail,
      password: devPassword,
      options: {
        data: {
          full_name: 'Development User',
          role: 'admin'
        }
      }
    })

    if (signUpError) {
      console.error('Sign up failed:', signUpError)
      throw signUpError
    }

    console.log('Sign up successful:', signUpData)
    // After signup, try to sign in immediately
    const { data: signInAfterSignUp, error: signInAfterSignUpError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword
    })

    if (signInAfterSignUpError) {
      console.error('Error signing in after signup:', signInAfterSignUpError)
      throw signInAfterSignUpError
    }

    // Wait for session to propagate
    await new Promise(res => setTimeout(res, 500))
    // Fetch the user after sign in
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  console.log('Sign in successful:', signInData)
  // Wait for session to propagate
  await new Promise(res => setTimeout(res, 500))
  // Fetch the user after sign in
  const { data: { user } } = await supabase.auth.getUser()
  return user
} 