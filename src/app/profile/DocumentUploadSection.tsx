import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function DocumentUploadSection() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [docsLoading, setDocsLoading] = useState(false);

  // Fetch user and docs on mount and on auth state change
  useEffect(() => {
    let authListener: any;
    async function init() {
      setDocsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchDocsForUser(user);
        setError(null);
      } else {
        setError("Please log in to upload documents");
      }
      setDocsLoading(false);
    }
    init();
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchDocsForUser(session.user);
        setError(null);
      } else {
        setUser(null);
        setUploadedDocs([]);
        setError("Please log in to upload documents");
      }
    });
    return () => {
      if (authListener && typeof authListener.subscription?.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  async function fetchDocsForUser(user: any) {
    setDocsLoading(true);
    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });
    if (!error && data) setUploadedDocs(data);
    setDocsLoading(false);
  }

  // Fetch signed URLs for images when uploadedDocs changes
  useEffect(() => {
    async function fetchImageUrls() {
      const urls: { [key: string]: string } = {};
      for (const doc of uploadedDocs) {
        if (doc.file_type.startsWith("image")) {
          const { data, error } = await supabase.storage
            .from("user-documents")
            .createSignedUrl(doc.file_url, 3600);
          if (data?.signedUrl) {
            urls[doc.id] = data.signedUrl;
          }
        }
      }
      setImageUrls(urls);
    }
    if (uploadedDocs.length > 0) fetchImageUrls();
  }, [uploadedDocs]);

  function getFileUrl(fileUrl: string) {
    // Get a signed URL that expires in 1 hour
    return supabase.storage
      .from("user-documents")
      .createSignedUrl(fileUrl, 3600)
      .then(({ data }) => data?.signedUrl)
      .catch(error => {
        console.error("Error getting signed URL:", error);
        return null;
      });
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return; // Prevent double submission
    setUploading(true);
    setUploadSuccess(false);
    setError(null);
    try {
      if (!user) {
        setError("Please log in to upload documents");
        return;
      }
      if (!files.length) {
        setError("Please select at least one file to upload");
        return;
      }
      for (const file of files) {
        console.log("Uploading file:", file.name);
        const filePath = `user-${user.id}/${Date.now()}_${file.name}`;
        
        // First check if file already exists
        const { data: existingFile } = await supabase.storage
          .from("user-documents")
          .list(`user-${user.id}`, {
            search: file.name
          });

        if (existingFile && existingFile.length > 0) {
          setError(`File ${file.name} already exists. Please rename it and try again.`);
          continue;
        }

        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(filePath, file, { 
            cacheControl: "3600", 
            upsert: false 
          });

        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          setError(`Error uploading ${file.name}: ${uploadError.message}`);
          continue;
        }

        console.log("File uploaded successfully, saving metadata");
        const { error: dbError } = await supabase.from("user_documents").insert({
          user_id: user.id,
          file_name: file.name,
          file_url: filePath,
          file_type: file.type,
          uploaded_at: new Date().toISOString(),
        });

        if (dbError) {
          console.error("Error saving document metadata:", dbError);
          setError(`Error saving information for ${file.name}: ${dbError.message}`);
          // Try to clean up the uploaded file if metadata save fails
          await supabase.storage.from("user-documents").remove([filePath]);
        }
      }
      
      if (!error) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        setFiles([]);
        // Reset file input for Chrome
        const fileInput = document.getElementById('file-upload') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
        await fetchDocsForUser(user);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string, fileUrl: string) {
    if (!user) {
      setError("Please log in to delete documents");
      return;
    }
    setDeleting(docId);
    try {
      await supabase.storage.from("user-documents").remove([fileUrl]);
      await supabase.from("user_documents").delete().eq("id", docId);
      await fetchDocsForUser(user);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Error deleting document. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    console.log("Files selected:", selectedFiles.map(f => f.name));
    setFiles(selectedFiles);
    setError(null);
  };

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Upload Documents</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 rounded text-center">
          {error}
        </div>
      )}
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex flex-col">
          <label 
            htmlFor="file-upload" 
            className="mb-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 text-center"
          >
            <span className="text-gray-600 dark:text-gray-300">
              {files.length > 0 
                ? `${files.length} file(s) selected` 
                : "Click to select files or drag and drop"}
            </span>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={!user}
            />
          </label>
          {files.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Selected files: {files.map(f => f.name).join(", ")}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={uploading || files.length === 0 || !user}
          onClick={() => console.log("Upload button clicked")}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      
      {uploadSuccess && (
        <div className="mt-4 p-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100 rounded text-center">
          Documents uploaded successfully!
        </div>
      )}

      <div className="mt-6 min-h-[60px]">
        <div className="space-y-4">
          {uploadedDocs.map(doc => (
            <div key={doc.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex-shrink-0">
                {doc.file_type.startsWith("image") ? (
                  <div className="w-12 h-12 relative">
                    <img
                      src={imageUrls[doc.id] || "/placeholder-image.png"}
                      alt={doc.file_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded">
                    <span className="text-2xl">📄</span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-grow">
                <div className="text-sm font-medium dark:text-gray-100">{doc.file_name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id, doc.file_url)}
                disabled={deleting === doc.id || !user}
                className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {deleting === doc.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
          {uploadedDocs.length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">No documents uploaded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

