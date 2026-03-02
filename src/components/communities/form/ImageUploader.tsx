import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  imagePreview: string | null;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
  error?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreview,
  isUploading,
  onUpload,
  onClear,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  if (imagePreview) {
    return (
      <div>
        <div className="relative">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            ×
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#ECC180' }}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: '#C12D32' }}></div>
              <p className="text-sm" style={{ color: '#666' }}>Compressing image...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
              <p className="text-sm" style={{ color: '#666' }}>Upload community logo</p>
              <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - Square format recommended (max 500KB)</p>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};