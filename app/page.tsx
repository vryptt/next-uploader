'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import { FileUploadClient, FileInfo, UploadResponse } from '@/lib/upload-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const uploadClient = new FileUploadClient();

  const handleUploadSuccess = (response: UploadResponse) => {
    if (response.data) {
      const newFile: FileInfo = {
        ...response.data,
        isExpired: false,
      };
      setUploadedFiles((prev) => [newFile, ...prev]);
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">File Upload Service</h1>
          <p className="text-muted-foreground">Upload file dengan keamanan dan fitur lengkap</p>
        </header>

        {/* Alert Message */}
        {message && (
          <Alert
            variant={message.type === 'success' ? 'default' : 'destructive'}
            className="mb-6 flex justify-between"
          >
            <div>
              <AlertTitle>{message.type === 'success' ? 'Berhasil' : 'Error'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </CardContent>
          </Card>

          {/* File List */}
          <Card>
            <CardHeader>
              <CardTitle>File Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {uploadedFiles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Belum ada file yang diupload
                  </p>
                ) : (
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <Card key={file.id} className="shadow-none border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium truncate">{file.originalName}</h3>
                            <Badge
                              variant={file.isExpired ? 'destructive' : 'secondary'}
                            >
                              {file.isExpired ? 'Expired' : 'Active'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Ukuran: {uploadClient.formatFileSize(file.size)}</p>
                            <p>Upload: {formatDate(file.uploadedAt)}</p>
                            {file.expiresAt && <p>Expires: {formatDate(file.expiresAt)}</p>}
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(file)}
                              disabled={file.isExpired}
                            >
                              Download
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(file.downloadUrl)}
                            >
                              Copy Link
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* API Docs */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {/* Upload Endpoint */}
            <div>
              <h3 className="font-medium">POST /api/upload</h3>
              <p className="text-muted-foreground mb-2">Upload file baru</p>

              {/* Tabs for Example */}
              <Tabs defaultValue="curl" className="mt-3">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>

                <TabsContent value="curl">
                  <pre className="bg-black text-white p-3 rounded text-xs overflow-x-auto">
{`curl -X POST http://localhost:3000/api/upload \\
  -F "file=@document.pdf" \\
  -F "duration=7days"`}
                  </pre>
                </TabsContent>

                <TabsContent value="node">
                  <pre className="bg-black text-white p-3 rounded text-xs overflow-x-auto">
{`import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";

const form = new FormData();
form.append("file", fs.createReadStream("document.pdf"));
form.append("duration", "7days");

fetch("http://localhost:3000/api/upload", {
  method: "POST",
  body: form
})
  .then(res => res.json())
  .then(console.log);`}
                  </pre>
                </TabsContent>

                <TabsContent value="python">
                  <pre className="bg-black text-white p-3 rounded text-xs overflow-x-auto">
{`import requests

files = {
  "file": open("document.pdf", "rb")
}
data = {
  "duration": "7days"
}

res = requests.post("http://localhost:3000/api/upload", files=files, data=data)
print(res.json())`}
                  </pre>
                </TabsContent>
              </Tabs>

              <p className="mt-4 font-medium">Contoh Response:</p>
              <pre className="bg-black text-white p-3 rounded text-xs mt-1 overflow-x-auto">
                {JSON.stringify(
                  {
                    success: true,
                    data: {
                      id: 'abc123...',
                      originalName: 'document.pdf',
                      size: 1024000,
                      mimeType: 'application/pdf',
                      extension: '.pdf',
                      uploadedAt: '2024-01-01T00:00:00.000Z',
                      expiresAt: '2024-01-08T00:00:00.000Z',
                      downloadUrl: 'http://localhost:3000/api/download/abc123...',
                      duration: '7days',
                    },
                    message: 'File uploaded successfully',
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Download Endpoint */}
            <div>
              <h3 className="font-medium">GET /api/download/[id]</h3>
              <p className="text-muted-foreground mb-2">Download file berdasarkan ID</p>
              <div className="bg-muted p-3 rounded">
                <p><strong>Response:</strong> File binary atau error JSON</p>
              </div>
            </div>

            {/* List Files Endpoint */}
            <div>
              <h3 className="font-medium">GET /api/upload</h3>
              <p className="text-muted-foreground mb-2">List semua file (dengan pagination)</p>
              <div className="bg-muted p-3 rounded">
                <p><strong>Query Parameters:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>page: number (default: 1)</li>
                  <li>limit: number (default: 10, max: 100)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}