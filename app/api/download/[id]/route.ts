import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { fileStorage } from '../../upload/route';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const fileId = params.id;
  const metadata = fileStorage.get(fileId);

  if (!metadata) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
  if (metadata.expiresAt && metadata.expiresAt < new Date()) {
    fileStorage.delete(fileId);
    return NextResponse.json({ success: false, error: 'File expired' }, { status: 410 });
  }
  if (!existsSync(metadata.path)) {
    fileStorage.delete(fileId);
    return NextResponse.json({ success: false, error: 'Physical file missing' }, { status: 404 });
  }

  const fileBuffer = await readFile(metadata.path);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': metadata.mimeType,
      'Content-Length': metadata.size.toString(),
      'Content-Disposition': `attachment; filename="${metadata.originalName}"`
    }
  });
}