'use client';

import React, { useState, useRef } from 'react';
import { FileUploadClient, Duration, UploadResponse } from '@/lib/upload-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
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

    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / 1024 / 1024;
      const error = `Ukuran file melebihi batas maksimum ${maxSizeMB}MB`;
      onUploadError?.(error);
      return;
    }

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
        if (fileInputRef.current) fileInputRef.current.value = '';
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
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="file">Pilih File</Label>
          <Input
            ref={fileInputRef}
            type="file"
            id="file"
            onChange={handleFileSelect}
            disabled={uploading}
            accept={allowedTypes.join(',')}
          />
          <p className="text-xs text-muted-foreground">
            Maksimal {uploadClient.formatFileSize(maxFileSize)}. <br />
            Tipe yang diizinkan: {allowedTypes.join(', ')}
          </p>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <Label>Durasi Penyimpanan</Label>
          <Select value={duration} onValueChange={(val) => setDuration(val as Duration)} disabled={uploading}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Durasi" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
            <p><strong>File:</strong> {selectedFile.name}</p>
            <p><strong>Ukuran:</strong> {uploadClient.formatFileSize(selectedFile.size)}</p>
            <p><strong>Tipe:</strong> {selectedFile.type || 'Tidak diketahui'}</p>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && <Progress value={progress} className="w-full" />}

        {/* Upload Button */}
        <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
          {uploading ? `Mengupload... ${Math.round(progress)}%` : 'Upload File'}
        </Button>

        {/* Upload Result */}
        {uploadResult && (
          <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
            <AlertTitle>{uploadResult.success ? 'Upload Berhasil' : 'Upload Gagal'}</AlertTitle>
            <AlertDescription>
              {uploadResult.success ? (
                <div className="space-y-1">
                  <p>ID: {uploadResult.data?.id}</p>
                  <a
                    href={uploadResult.data?.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Link Download
                  </a>
                </div>
              ) : (
                <p>{uploadResult.error}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}