import { getSupabaseClient } from './supabase';

export async function fetchUserDocuments(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_docs')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  // Always return an array for UI .map()
  return data ? [data] : [];
}

export async function uploadUserDocument(userId: string, file: File, isAdmin = false) {
  if (file.name !== "README.pdf") {
    throw new Error("Only a file named README.pdf can be uploaded.");
  }
  const supabase = getSupabaseClient();
  const filePath = `user-${userId}/${Date.now()}_README.pdf`;

  // Check if file already exists in storage (optional, for user experience)
  const { data: existingFile } = await supabase.storage
    .from('user-docs')
    .list(`user-${userId}`, { search: file.name });
  if (existingFile && existingFile.length > 0) {
    throw new Error(`File ${file.name} already exists. Please rename it and try again.`);
  }

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('user-docs')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  // Check document ownership logic
  const { data: doc, error: dbError } = await supabase
    .from('user_docs')
    .select('uploaded_by_admin')
    .eq('id', userId)
    .single();

  if (dbError && dbError.code !== 'PGRST116') {
    await supabase.storage.from('user-docs').remove([filePath]);
    throw dbError;
  }

  // If admin is uploading, block if user has already uploaded
  if (isAdmin && doc && doc.uploaded_by_admin === false) {
    await supabase.storage.from('user-docs').remove([filePath]);
    throw new Error("Admin cannot update: user has already uploaded their own document.");
  }

  // Upsert metadata
  await supabase.from('user_docs').upsert({
    id: userId,
    file_name: file.name,
    file_url: filePath,
    file_type: file.type,
    uploaded_at: new Date().toISOString(),
    uploaded_by_admin: isAdmin
  });

  return true;
}

export async function deleteUserDocument(userId: string, fileUrl: string, userRole: string) {
  if (userRole !== 'admin') {
    throw new Error('Only admins can delete documents.');
  }
  const supabase = getSupabaseClient();
  await supabase.storage.from('user-docs').remove([fileUrl]);
  await supabase.from('user_docs').delete().eq('id', userId);
}

export async function getSignedImageUrl(fileUrl: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from('user-docs')
    .createSignedUrl(fileUrl, 3600);
  if (error) throw error;
  return data?.signedUrl;
}

export async function getDownloadUrl(fileUrl: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from('user-docs')
    .createSignedUrl(fileUrl, 3600);
  if (error) throw error;
  return data?.signedUrl;
}

export async function downloadUserDocument(userId: string) {
  const supabase = getSupabaseClient();
  const { data: doc, error } = await supabase
    .from('user_docs')
    .select('file_url')
    .eq('id', userId)
    .single();
  if (error) throw error;
  const fileUrl: string = doc.file_url as string;
  const downloadUrl = await getDownloadUrl(fileUrl);
  return downloadUrl;
}

export async function fetchUserRole(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profile')
    .select('is_admin')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data?.is_admin ? 'admin' : 'user';
}