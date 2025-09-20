import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileStorage } from '@/app/api/upload/route.ts';

export async function GET(
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

    if (!existsSync(metadata.path)) {
      fileStorage.delete(fileId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Physical file not found',
          code: 'PHYSICAL_FILE_NOT_FOUND'
        }, 
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(metadata.path);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': metadata.mimeType,
        'Content-Length': metadata.size.toString(),
        'Content-Disposition': `attachment; filename="${metadata.originalName}"`,
        'Cache-Control': 'private, no-cache',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
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