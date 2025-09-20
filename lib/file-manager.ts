import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { APP_CONFIG } from './config';

export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedAt: Date;
  expiresAt: Date | null;
  path: string;
  hash?: string;
}

export class FileManager {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), APP_CONFIG.upload.uploadDir);
  }

  async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  generateFileName(originalName: string): string {
    const id = crypto.randomBytes(16).toString('hex');
    const sanitized = this.sanitizeFileName(originalName);
    const extension = path.extname(sanitized);
    const baseName = path.basename(sanitized, extension);
    return `${id}_${baseName}${extension}`;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 100);
  }

  async calculateFileHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  isValidFileType(fileName: string): boolean {
    const extension = path.extname(fileName).toLowerCase();
    return APP_CONFIG.upload.allowedExtensions.includes(extension);
  }

  isValidFileSize(size: number): boolean {
    return size <= APP_CONFIG.upload.maxFileSize && size > 0;
  }

  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    await this.ensureUploadDirectory();
    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStats(filePath: string) {
    try {
      return await fs.stat(filePath);
    } catch {
      return null;
    }
  }

  async cleanupExpiredFiles(fileList: FileMetadata[]): Promise<void> {
    const now = new Date();
    const expiredFiles = fileList.filter(
      file => file.expiresAt && file.expiresAt < now
    );

    for (const file of expiredFiles) {
      await this.deleteFile(file.path);
    }
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }
}