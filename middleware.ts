import { NextRequest, NextResponse } from 'next/server';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/upload')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'vrypt';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 10;

    const key = `rate_limit_${ip}`;
    const current = rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    } else if (current.count >= maxRequests) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests', 
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        }, 
        { status: 429 }
      );
    } else {
      current.count++;
      rateLimitStore.set(key, current);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};