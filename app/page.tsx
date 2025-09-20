'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Moon, 
  Sun, 
  Upload, 
  Download, 
  Copy, 
  Search, 
  Filter,
  Trash2,
  FileText,
  Image,
  Archive,
  Settings,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive
} from 'lucide-react';

// Mock FileUpload component
const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onUploadSuccess({
            data: {
              id: Math.random().toString(36).substr(2, 9),
              originalName: file.name,
              size: file.size,
              mimeType: file.type,
              extension: file.name.split('.').pop(),
              uploadedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              downloadUrl: `#download-${Math.random().toString(36).substr(2, 9)}`,
              duration: '7days',
            }
          });
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragging ? 'Drop file di sini' : 'Drag & drop file atau klik untuk upload'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Maksimal 100MB • Semua format file didukung
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            id="file-input"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <label htmlFor="file-input">
            <Button 
              className="cursor-pointer" 
              disabled={isUploading}
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Pilih File'}
            </Button>
          </label>
        </div>
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

// Mock FileUploadClient
class FileUploadClient {
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async downloadFile(id, filename) {
    // Simulate download
    console.log(`Downloading file: ${filename}`);
    return true;
  }
}

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    activeFiles: 0,
    expiredFiles: 0
  });

  const uploadClient = new FileUploadClient();

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Update stats when files change
  useEffect(() => {
    const totalFiles = uploadedFiles.length;
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    const activeFiles = uploadedFiles.filter(file => !file.isExpired).length;
    const expiredFiles = uploadedFiles.filter(file => file.isExpired).length;
    
    setStats({ totalFiles, totalSize, activeFiles, expiredFiles });
  }, [uploadedFiles]);

  const handleUploadSuccess = (response) => {
    if (response.data) {
      const newFile = {
        ...response.data,
        isExpired: false,
      };
      setUploadedFiles((prev) => [newFile, ...prev]);
      setMessage({ type: 'success', text: 'File berhasil diupload!', icon: CheckCircle });
      
      // Auto hide success message
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleUploadError = (error) => {
    setMessage({ type: 'error', text: error, icon: AlertCircle });
  };

  const handleDownload = async (file) => {
    const success = await uploadClient.downloadFile(file.id, file.originalName);
    if (!success) {
      setMessage({ type: 'error', text: 'Gagal mendownload file', icon: AlertCircle });
    }
  };

  const handleCopyLink = async (file) => {
    try {
      await navigator.clipboard.writeText(file.downloadUrl);
      setMessage({ type: 'success', text: 'Link berhasil disalin!', icon: CheckCircle });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menyalin link', icon: AlertCircle });
    }
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setMessage({ type: 'success', text: 'File berhasil dihapus', icon: CheckCircle });
    setTimeout(() => setMessage(null), 3000);
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType?.includes('pdf') || mimeType?.includes('document')) return <FileText className="w-4 h-4" />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <Archive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const filteredFiles = uploadedFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && !file.isExpired) ||
                         (filterType === 'expired' && file.isExpired);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeLeft = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}h ${hours}j`;
    return `${hours}j`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Dark Mode Toggle */}
        <header className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              FileVault Pro
            </h1>
            <p className="text-lg text-muted-foreground">
              Professional file upload service dengan keamanan tingkat enterprise
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-purple-600"
              />
              <Moon className="w-4 h-4" />
            </div>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Files</p>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Files</p>
                  <p className="text-2xl font-bold">{stats.activeFiles}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Expired</p>
                  <p className="text-2xl font-bold">{stats.expiredFiles}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Storage Used</p>
                  <p className="text-2xl font-bold">{uploadClient.formatFileSize(stats.totalSize)}</p>
                </div>
                <HardDrive className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Message */}
        {message && (
          <Alert
            variant={message.type === 'success' ? 'default' : 'destructive'}
            className="mb-6 border-l-4 shadow-lg animate-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-center gap-2">
              <message.icon className="h-4 w-4" />
              <div>
                <AlertTitle className="font-semibold">
                  {message.type === 'success' ? 'Berhasil!' : 'Error!'}
                </AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessage(null)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Upload Section */}
          <Card className="lg:col-span-1 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload File
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </CardContent>
          </Card>

          {/* File List */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-green-500/10 to-blue-500/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  File Manager
                </CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Cari file..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="all">Semua</option>
                    <option value="active">Aktif</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-96">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {uploadedFiles.length === 0 
                        ? "Belum ada file yang diupload" 
                        : "Tidak ada file yang sesuai dengan pencarian"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="shadow-sm border hover:shadow-md transition-all duration-200 group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="mt-1">
                                {getFileIcon(file.mimeType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate mb-1 group-hover:text-primary transition-colors">
                                  {file.originalName}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <HardDrive className="w-3 h-3" />
                                    {uploadClient.formatFileSize(file.size)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(file.uploadedAt)}
                                  </span>
                                  {file.expiresAt && (
                                    <span className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {getTimeLeft(file.expiresAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={file.isExpired ? 'destructive' : 'success'}
                              className="ml-2 animate-pulse"
                            >
                              {file.isExpired ? 'Expired' : 'Active'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(file)}
                              disabled={file.isExpired}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(file)}
                              className="hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Link
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 border-red-200"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
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

        {/* API Documentation */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              API Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {/* Upload Endpoint */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    POST
                  </Badge>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                    /api/upload
                  </code>
                </div>
                <p className="text-muted-foreground mb-4">Upload file baru dengan opsi keamanan lengkap</p>

                <Tabs defaultValue="curl" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl" className="mt-4">
                    <pre className="bg-black text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST http://localhost:3000/api/upload \\
  -F "file=@document.pdf" \\
  -F "duration=7days" \\
  -F "password=secure123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </pre>
                  </TabsContent>

                  <TabsContent value="node" className="mt-4">
                    <pre className="bg-black text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
{`import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";

const form = new FormData();
form.append("file", fs.createReadStream("document.pdf"));
form.append("duration", "7days");
form.append("password", "secure123");

const response = await fetch("http://localhost:3000/api/upload", {
  method: "POST",
  body: form,
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});

const result = await response.json();
console.log(result);`}
                    </pre>
                  </TabsContent>

                  <TabsContent value="python" className="mt-4">
                    <pre className="bg-black text-yellow-400 p-4 rounded-lg text-sm overflow-x-auto">
{`import requests

files = {"file": open("document.pdf", "rb")}
data = {
    "duration": "7days",
    "password": "secure123"
}
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.post(
    "http://localhost:3000/api/upload", 
    files=files, 
    data=data,
    headers=headers
)

print(response.json())`}
                    </pre>
                  </TabsContent>
                </Tabs>

                <div className="mt-4">
                  <p className="font-medium mb-2">Response Example:</p>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(
                      {
                        success: true,
                        data: {
                          id: 'abc123def456',
                          originalName: 'document.pdf',
                          size: 2048576,
                          mimeType: 'application/pdf',
                          extension: '.pdf',
                          uploadedAt: '2024-01-01T00:00:00.000Z',
                          expiresAt: '2024-01-08T00:00:00.000Z',
                          downloadUrl: 'http://localhost:3000/api/download/abc123def456',
                          duration: '7days',
                          isPasswordProtected: true,
                          checksumSHA256: 'a1b2c3d4e5f6...',
                        },
                        message: 'File uploaded successfully with encryption',
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              {/* Download Endpoint */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    GET
                  </Badge>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                    /api/download/[id]
                  </code>
                </div>
                <p className="text-muted-foreground mb-4">Download file berdasarkan ID dengan verifikasi keamanan</p>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Query Parameters:</strong></p>
                  <ul className="list-disc list-inside ml-4 text-muted-foreground">
                    <li><code>password</code>: string (jika file dilindungi password)</li>
                    <li><code>token</code>: string (download token untuk verifikasi)</li>
                  </ul>
                </div>
              </div>

              {/* List Files Endpoint */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    GET
                  </Badge>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                    /api/files
                  </code>
                </div>
                <p className="text-muted-foreground mb-4">List file dengan filtering dan pagination advanced</p>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Query Parameters:</strong></p>
                  <ul className="list-disc list-inside ml-4 text-muted-foreground space-y-1">
                    <li><code>page</code>: number (default: 1)</li>
                    <li><code>limit</code>: number (default: 20, max: 100)</li>
                    <li><code>search</code>: string (pencarian berdasarkan nama file)</li>
                    <li><code>status</code>: 'active' | 'expired' | 'all'</li>
                    <li><code>sort</code>: 'name' | 'size' | 'date' | 'type'</li>
                    <li><code>order</code>: 'asc' | 'desc'</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2024 FileVault Pro. All rights reserved. | Powered by enterprise-grade security.</p>
        </footer>
      </div>
    </div>
  );
}