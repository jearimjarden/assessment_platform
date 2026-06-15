import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function requireAuth(req: NextRequest) {
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

export function requireRole(req: NextRequest, requiredRole: 'ADMIN' | 'MENTOR' | 'USER') {
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

function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return req.cookies.get('token')?.value;
}
