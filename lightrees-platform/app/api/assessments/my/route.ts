import { NextResponse } from 'next/server';
import { requireRole } from '../../../../lib/middleware';
import { listAssessmentsByMentor } from '../../../../lib/assessments';

export async function GET(request: Request) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  try {
    const mentorId = (auth as any).sub as number;
    const rows = await listAssessmentsByMentor(mentorId);
    return NextResponse.json({ assessments: rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
