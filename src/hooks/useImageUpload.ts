import { useState } from 'react';

interface UploadResult {
  success: boolean;
  data?: {
    url: string;
    displayUrl: string;
    thumbUrl?: string;
    mediumUrl?: string;
    deleteUrl?: string;
    title?: string;
    size?: number;
    time?: number;
  };
  error?: string;
}

// Get the base URL based on the environment
const getBaseUrl = () => {
  // If running locally
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  // In production, use the same origin as the client
  return window.location.origin;
};

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      console.log('Starting upload for file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Get the correct API URL
      const baseUrl = getBaseUrl();
      console.log('Using API base URL:', baseUrl);

      // Upload to our server
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        // Add credentials to handle cookies/auth if needed
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      const result: UploadResult = await response.json();
      console.log('Server response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      if (!result.data?.url) {
        throw new Error('No URL returned from upload');
      }

      return result.data.url;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    error,
    uploadProgress
  };
}; 