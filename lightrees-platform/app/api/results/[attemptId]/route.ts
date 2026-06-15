import { NextResponse } from 'next/server';
import { requireRole } from '../../../../lib/middleware';
import { getResultForAttempt } from '../../../../lib/reports';

export async function GET(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const auth = requireRole(request as any, 'USER');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const attemptId = Number(resolvedParams.attemptId);
  if (Number.isNaN(attemptId)) return NextResponse.json({ error: 'Invalid attempt id' }, { status: 400 });

  const userId = (auth as any).sub as number;
  const result = await getResultForAttempt(userId, attemptId);
  if ((result as any).error) {
    if ((result as any).error === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: (result as any).error }, { status: 404 });
  }

  return NextResponse.json(result, { status: 200 });
}
