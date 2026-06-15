import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyToken } from './auth';

type RequestLike = Request | NextRequest;

export function requireAuth(req: RequestLike) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    return verifyToken(token);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export function requireRole(req: RequestLike, requiredRole: 'ADMIN' | 'MENTOR' | 'USER') {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== requiredRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return payload;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

function getTokenFromRequest(req: RequestLike) {
  // Authorization header (Bearer)
  const authHeader = req.headers.get?.('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // NextRequest cookies (server runtime)
  // @ts-ignore
  if (typeof (req as any).cookies?.get === 'function') {
    // @ts-ignore
    return (req as any).cookies.get('token')?.value;
  }

  // Fallback: parse Cookie header from standard Request
  const cookieHeader = req.headers.get?.('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookies) {
      const [k, v] = c.split('=');
      if (k === 'token') return decodeURIComponent(v);
    }
  }

  return null;
}
