import { NextResponse } from 'next/server';
import { requireRole, requireAuth } from '../../../lib/middleware';
import { createAssessment, listPublishedAssessments } from '../../../lib/assessments';
import { createAssessmentSchema } from '../../../validators/assessment';

export async function GET(request: Request) {
  const auth = requireAuth(request as any);
  if (auth instanceof NextResponse) return auth;

  try {
    const rows = await listPublishedAssessments();
    return NextResponse.json({ assessments: rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = createAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const mentorId = (auth as any).sub as number;
    const assessment = await createAssessment(mentorId, parsed.data);
    return NextResponse.json({ assessment }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
