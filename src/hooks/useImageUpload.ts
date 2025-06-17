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

      // Upload to our server
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      const result: UploadResult = await response.json();
      console.log('Server response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      if (!result.data?.url) {
        throw new Error('No URL returned from upload');
      }

      return result.data.url;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
      throw error;
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