'use client';

import React, { useState, useRef } from 'react';
import { FileUploadClient, Duration, UploadResponse } from '@/lib/upload-client';

interface FileUploadProps {
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export default function FileUpload({ 
  onUploadSuccess, 
  onUploadError,
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<Duration>('7days');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadClient = new FileUploadClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / 1024 / 1024;
      const error = `Ukuran file melebihi batas maksimum ${maxSizeMB}MB`;
      onUploadError?.(error);
      return;
    }

    // Validasi tipe file
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      const error = `Tipe file ${fileExtension} tidak diizinkan`;
      onUploadError?.(error);
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadClient.uploadFile(
        selectedFile, 
        duration, 
        (progress) => setProgress(progress)
      );

      setUploadResult(result);
      
      if (result.success) {
        onUploadSuccess?.(result);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        onUploadError?.(result.error || 'Upload gagal');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload gagal';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const durationOptions: { value: Duration; label: string }[] = [
    { value: '1hour', label: '1 Jam' },
    { value: '6hours', label: '6 Jam' },
    { value: '12hours', label: '12 Jam' },
    { value: '1day', label: '1 Hari' },
    { value: '7days', label: '7 Hari' },
    { value: '14days', label: '14 Hari' },
    { value: '30days', label: '30 Hari' },
    { value: 'unlimited', label: 'Tanpa Batas' },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            accept={allowedTypes.join(',')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maksimal {uploadClient.formatFileSize(maxFileSize)}. 
            Tipe yang diizinkan: {allowedTypes.join(', ')}
          </p>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durasi Penyimpanan
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value as Duration)}
            disabled={uploading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm"><strong>File:</strong> {selectedFile.name}</p>
            <p className="text-sm"><strong>Ukuran:</strong> {uploadClient.formatFileSize(selectedFile.size)}</p>
            <p className="text-sm"><strong>Tipe:</strong> {selectedFile.type}</p>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            !selectedFile || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? `Mengupload... ${Math.round(progress)}%` : 'Upload File'}
        </button>

        {/* Upload Result */}
        {uploadResult && (
          <div className={`p-3 rounded-md ${
            uploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {uploadResult.success ? (
              <div>
                <p className="font-medium">Upload Berhasil!</p>
                <p className="text-sm mt-1">ID: {uploadResult.data?.id}</p>
                <a 
                  href={uploadResult.data?.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Link Download
                </a>
              </div>
            ) : (
              <div>
                <p className="font-medium">Upload Gagal</p>
                <p className="text-sm mt-1">{uploadResult.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}