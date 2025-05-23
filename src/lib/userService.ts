import { getSupabaseClient } from './supabase';

export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function fetchUserProfile(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertUserProfile(userId: string, profile: any) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('profile')
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
  return true;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

export async function loginUser(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return true;
}

export async function registerUser(email: string, password: string, fullName: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw error;
  return data;
}

export async function checkEmailExists(email: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('profile')
    .select('id')
    .eq('email', email)
    .single();
  return !!data;
} 