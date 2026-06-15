import { NextResponse } from 'next/server';
import { requireRole } from '../../../../../lib/middleware';
import { submitAssessmentAttempt } from '../../../../../lib/attempts';

export async function POST(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const auth = requireRole(request as any, 'USER');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const assessmentIdStr = resolvedParams?.assessmentId ?? (() => {
    const m = new URL(request.url).pathname.match(/\/api\/assessments\/([^\/]+)\/attempts/);
    return m ? m[1] : undefined;
  })();

  const assessmentId = Number(assessmentIdStr);
  if (Number.isNaN(assessmentId)) return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });

  const body = await request.json();
  if (!body || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const userId = (auth as any).sub as number;
  try {
    const result = await submitAssessmentAttempt(userId, assessmentId, body.answers);
    if ((result as any).error) return NextResponse.json({ error: (result as any).error }, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
