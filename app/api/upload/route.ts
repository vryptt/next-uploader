import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';

interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedAt: Date;
  expiresAt: Date | null;
  downloadUrl: string;
  path: string;
}

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.json', '.xml',
  '.zip', '.rar', '.7z',
  '.mp3', '.mp4', '.avi', '.mov', '.wav',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DURATION_OPTIONS = {
  '1hour': 60 * 60 * 1000,
  '6hours': 6 * 60 * 60 * 1000,
  '12hours': 12 * 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
  '7days': 7 * 24 * 60 * 60 * 1000,
  '14days': 14 * 24 * 60 * 60 * 1000,
  '30days': 30 * 24 * 60 * 60 * 1000,
  'unlimited': null
};

const uploadSchema = z.object({
  duration: z.enum(['1hour', '6hours', '12hours', '1day', '7days', '14days', '30days', 'unlimited']).optional().default('7days')
});

const fileStorage = new Map<string, FileMetadata>();

function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

function getFileExtension(fileName: string): string {
  return path.extname(fileName).toLowerCase();
}

function isValidFileType(extension: string): boolean {
  return ALLOWED_EXTENSIONS.includes(extension);
}

function calculateExpiryDate(duration: keyof typeof DURATION_OPTIONS): Date | null {
  const durationMs = DURATION_OPTIONS[duration];
  if (durationMs === null) return null;
  return new Date(Date.now() + durationMs);
}

async function ensureUploadDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const durationParam = formData.get('duration') as string;

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No file provided',
          code: 'NO_FILE'
        }, 
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE'
        }, 
        { status: 400 }
      );
    }

    const extension = getFileExtension(file.name);
    if (!isValidFileType(extension)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File type ${extension} is not allowed`,
          code: 'INVALID_FILE_TYPE',
          allowedTypes: ALLOWED_EXTENSIONS
        }, 
        { status: 400 }
      );
    }

    const validationResult = uploadSchema.safeParse({ 
      duration: durationParam || 'undefined' 
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid duration parameter',
          code: 'INVALID_DURATION',
          allowedDurations: Object.keys(DURATION_OPTIONS)
        }, 
        { status: 400 }
      );
    }

    const { duration } = validationResult.data;

    const fileId = generateId();
    const sanitizedName = sanitizeFileName(file.name);
    const fileName = `${fileId}_${sanitizedName}`;
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, fileName);
    const expiresAt = calculateExpiryDate(duration);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create metadata
    const metadata: FileMetadata = {
      id: fileId,
      originalName: file.name,
      fileName,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      extension,
      uploadedAt: new Date(),
      expiresAt,
      downloadUrl: `/api/download/${fileId}`,
      path: filePath
    };

    // Store metadata (dalam production, simpan ke database)
    fileStorage.set(fileId, metadata);

    // Response success
    return NextResponse.json({
      success: true,
      data: {
        id: metadata.id,
        originalName: metadata.originalName,
        size: metadata.size,
        mimeType: metadata.mimeType,
        extension: metadata.extension,
        uploadedAt: metadata.uploadedAt,
        expiresAt: metadata.expiresAt,
        downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${metadata.downloadUrl}`,
        duration: duration
      },
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
