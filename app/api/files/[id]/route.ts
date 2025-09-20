import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';

export async function GET_INFO(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    const metadata = fileStorage.get(fileId);
    
    if (!metadata) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File not found',
          code: 'FILE_NOT_FOUND'
        }, 
        { status: 404 }
      );
    }

    if (metadata.expiresAt && metadata.expiresAt < new Date()) {
      fileStorage.delete(fileId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'File has expired',
          code: 'FILE_EXPIRED'
        }, 
        { status: 410 }
      );
    }

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
        isExpired: metadata.expiresAt ? metadata.expiresAt < new Date() : false
      }
    });

  } catch (error) {
    console.error('Get file info error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
}