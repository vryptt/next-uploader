import { NextRequest, NextResponse } from 'next/server';
import { fileStorage } from '../../upload/route';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const metadata = fileStorage.get(params.id);
  if (!metadata) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
  if (metadata.expiresAt && metadata.expiresAt < new Date()) {
    fileStorage.delete(params.id);
    return NextResponse.json({ success: false, error: 'File expired' }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...metadata,
      downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${metadata.downloadUrl}`
    }
  });
}