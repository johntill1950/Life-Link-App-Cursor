import { getSupabaseClient } from './supabase';

export async function fetchUserDocuments(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadUserDocument(userId: string, file: File) {
  const supabase = getSupabaseClient();
  const filePath = `user-${userId}/${Date.now()}_${file.name}`;
  // Check if file already exists
  const { data: existingFile } = await supabase.storage
    .from('user-documents')
    .list(`user-${userId}`, { search: file.name });
  if (existingFile && existingFile.length > 0) {
    throw new Error(`File ${file.name} already exists. Please rename it and try again.`);
  }
  const { error: uploadError } = await supabase.storage
    .from('user-documents')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;
  const { error: dbError } = await supabase.from('user_documents').insert({
    user_id: userId,
    file_name: file.name,
    file_url: filePath,
    file_type: file.type,
    uploaded_at: new Date().toISOString(),
  });
  if (dbError) {
    // Clean up uploaded file if metadata save fails
    await supabase.storage.from('user-documents').remove([filePath]);
    throw dbError;
  }
  return true;
}

export async function deleteUserDocument(docId: string, fileUrl: string) {
  const supabase = getSupabaseClient();
  await supabase.storage.from('user-documents').remove([fileUrl]);
  await supabase.from('user_documents').delete().eq('id', docId);
}

export async function getSignedImageUrl(fileUrl: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from('user-documents')
    .createSignedUrl(fileUrl, 3600);
  if (error) throw error;
  return data?.signedUrl;
}

export async function getDownloadUrl(fileUrl: string, fileName: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from('user-documents')
    .createSignedUrl(fileUrl, 3600);
  
  if (error) throw error;
  return data?.signedUrl;
} 