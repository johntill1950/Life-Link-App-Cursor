import { useEffect, useState, useRef } from "react";
import { useUser } from "@/lib/useUser";
import { fetchUserDocuments, uploadUserDocument, deleteUserDocument, getSignedImageUrl, getDownloadUrl } from "@/lib/documentService";
import { useRouter } from "next/navigation";

export function DocumentUploadSection() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [docsLoading, setDocsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [downloading, setDownloading] = useState<string | null>(null);
  const { user, loading: userLoading } = useUser();

  const fetchDocsForUser = async () => {
    if (!user) return;
    setDocsLoading(true);
    try {
      const docs = await fetchUserDocuments(user.id);
      setUploadedDocs(docs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents");
    }
    setDocsLoading(false);
  };

  useEffect(() => {
    if (!user && !userLoading) {
      setError("Please log in to upload documents");
      return;
    }
    if (!user) return;
    fetchDocsForUser();
  }, [user, userLoading]);

  useEffect(() => {
    async function fetchImageUrls() {
      const urls: { [key: string]: string } = {};
      for (const doc of uploadedDocs) {
        if (doc.file_type.startsWith("image")) {
          try {
            const signedUrl = await getSignedImageUrl(doc.file_url);
            if (signedUrl) {
              urls[doc.id] = signedUrl;
            }
          } catch (err) {
            console.error("Error getting signed URL for", doc.file_name, err);
          }
        }
      }
      setImageUrls(urls);
    }
    if (uploadedDocs.length > 0) fetchImageUrls();
  }, [uploadedDocs]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return;
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
        try {
          await uploadUserDocument(user.id, file);
        } catch (err: any) {
          console.error("Error uploading file:", err);
          setError(err.message || `Error uploading ${file.name}`);
          continue;
        }
      }

      if (!error) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await fetchDocsForUser();
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
      await deleteUserDocument(docId, fileUrl);
      await fetchDocsForUser();
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

  const handleDownload = async (docId: string, fileUrl: string, fileName: string) => {
    if (!user) {
      setError("Please log in to download documents");
      return;
    }
    setDownloading(docId);
    try {
      const url = await getDownloadUrl(fileUrl, fileName);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download error:", error);
      setError("Error downloading document. Please try again.");
    } finally {
      setDownloading(null);
    }
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
              ref={fileInputRef}
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
              <div className="ml-4 flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(doc.id, doc.file_url, doc.file_name)}
                  disabled={downloading === doc.id || !user}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  {downloading === doc.id ? "Downloading..." : "Download"}
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.file_url)}
                  disabled={deleting === doc.id || !user}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {deleting === doc.id ? "Deleting..." : "Delete"}
                </button>
              </div>
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

