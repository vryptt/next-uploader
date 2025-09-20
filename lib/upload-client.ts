export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    extension: string;
    uploadedAt: string;
    expiresAt: string | null;
    downloadUrl: string;
    duration: string;
  };
  error?: string;
  code?: string;
  allowedTypes?: string[];
  allowedDurations?: string[];
  message?: string;
}

export interface FileInfo {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedAt: string;
  expiresAt: string | null;
  downloadUrl: string;
  isExpired: boolean;
}

export type Duration = '1hour' | '6hours' | '12hours' | '1day' | '7days' | '14days' | '30days' | 'unlimited';

export class FileUploadClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api';
  }

  async uploadFile(
    file: File,
    duration: Duration = '7days',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('duration', duration);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              onProgress(progress);
            }
          });
        }

        xhr.addEventListener('load', () => {
          try {
            const response: UploadResponse = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
            console.error(error)
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${this.baseUrl}/upload`);
        xhr.send(formData);
      });

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'CLIENT_ERROR'
      };
    }
  }

  async getFileInfo(fileId: string): Promise<{ success: boolean; data?: FileInfo; error?: string; code?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${fileId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'CLIENT_ERROR'
      };
    }
  }

  async listFiles(page = 1, limit = 10): Promise<{
    success: boolean;
    data?: FileInfo[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    error?: string;
    code?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/upload?page=${page}&limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'CLIENT_ERROR'
      };
    }
  }

  getDownloadUrl(fileId: string): string {
    return `${this.baseUrl}/download/${fileId}`;
  }

  async downloadFile(fileId: string, fileName?: string): Promise<boolean> {
    try {
      const link = document.createElement('a');
      link.href = this.getDownloadUrl(fileId);
      if (fileName) {
        link.download = fileName;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      console.error('Download failed:', err);
      return false;
    }
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDuration(duration: Duration): string {
    const durations: Record<Duration, string> = {
      '1hour': '1 Jam',
      '6hours': '6 Jam',
      '12hours': '12 Jam',
      '1day': '1 Hari',
      '7days': '7 Hari',
      '14days': '14 Hari',
      '30days': '30 Hari',
      'unlimited': 'Tanpa Batas'
    };
    return durations[duration];
  }
}