import { NextResponse } from 'next/server';
import { requireRole } from '../../../../lib/middleware';
import { publishAssessmentIfOwner } from '../../../../lib/assessments';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const mentorId = (auth as any).sub as number;
    const updated = await publishAssessmentIfOwner(id, mentorId);
    if (!updated) return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
    return NextResponse.json({ assessment: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
