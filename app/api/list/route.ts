import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    const currentTime = new Date();
    const validFiles = Array.from(fileStorage.values()).filter(file => 
      !file.expiresAt || file.expiresAt > currentTime
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = validFiles.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedFiles.map(file => ({
        id: file.id,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        extension: file.extension,
        uploadedAt: file.uploadedAt,
        expiresAt: file.expiresAt,
        downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${file.downloadUrl}`
      })),
      pagination: {
        page,
        limit,
        total: validFiles.length,
        totalPages: Math.ceil(validFiles.length / limit)
      }
    });

  } catch (error) {
    console.error('List files error:', error);
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

export { fileStorage };