'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import { FileUploadClient, FileInfo } from '@/lib/upload-client';
import { UploadResponse } from '@/lib/upload-client';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const uploadClient = new FileUploadClient();

  const handleUploadSuccess = (response: UploadResponse) => {
    if (response.data) {
      const newFile: FileInfo = {
        ...response.data,
        isExpired: false
      };
      setUploadedFiles(prev => [newFile, ...prev]);
      setMessage({ type: 'success', text: 'File berhasil diupload!' });
    }
  };

  const handleUploadError = (error: string) => {
    setMessage({ type: 'error', text: error });
  };

  const handleDownload = async (file: FileInfo) => {
    const success = await uploadClient.downloadFile(file.id, file.originalName);
    if (!success) {
      setMessage({ type: 'error', text: 'Gagal mendownload file' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            File Upload Service
          </h1>
          <p className="text-gray-600">
            Upload file dengan keamanan dan fitur lengkap
          </p>
        </header>

        {/* Alert Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button 
                onClick={() => setMessage(null)}
                className="text-sm underline"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Component */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload File</h2>
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          {/* File List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">File Terakhir</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadedFiles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada file yang diupload
                </p>
              ) : (
                uploadedFiles.map((file) => (
                  <div key={file.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {file.originalName}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        file.isExpired 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {file.isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Ukuran: {uploadClient.formatFileSize(file.size)}</p>
                      <p>Upload: {formatDate(file.uploadedAt)}</p>
                      {file.expiresAt && (
                        <p>Expires: {formatDate(file.expiresAt)}</p>
                      )}
                    </div>

                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleDownload(file)}
                        disabled={file.isExpired}
                        className={`px-3 py-1 text-sm rounded ${
                          file.isExpired
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        Download
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(file.downloadUrl)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 rounded"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
          
          <div className="space-y-6">
            {/* Upload Endpoint */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">POST /api/upload</h3>
              <p className="text-sm text-gray-600 mb-2">Upload file baru</p>
              
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Content-Type:</strong> multipart/form-data</p>
                <p><strong>Body:</strong></p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>file: File (required)</li>
                  <li>duration: string (optional, default: "7days")</li>
                </ul>
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium">Contoh Response:</p>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs mt-1 overflow-x-auto">
{JSON.stringify({
  "success": true,
  "data": {
    "id": "abc123...",
    "originalName": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "extension": ".pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "downloadUrl": "http://localhost:3000/api/download/abc123...",
    "duration": "7days"
  },
  "message": "File uploaded successfully"
}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Download Endpoint */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">GET /api/download/[id]</h3>
              <p className="text-sm text-gray-600 mb-2">Download file berdasarkan ID</p>
              
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Response:</strong> File binary atau error JSON</p>
              </div>
            </div>

            {/* List Files Endpoint */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">GET /api/upload</h3>
              <p className="text-sm text-gray-600 mb-2">List semua file (dengan pagination)</p>
              
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Query Parameters:</strong></p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>page: number (default: 1)</li>
                  <li>limit: number (default: 10, max: 100)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
