import { NextResponse } from 'next/server';
import { requireRole } from '../../../../../lib/middleware';
import { publishAssessmentIfOwner } from '../../../../../lib/assessments';

export async function PATCH(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const assessmentIdStr = resolvedParams?.assessmentId ?? (() => {
    const m = new URL(request.url).pathname.match(/\/api\/assessments\/([^\/]+)\/publish/);
    return m ? m[1] : undefined;
  })();

  const id = Number(assessmentIdStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const updated = await publishAssessmentIfOwner(id, mentorId);
  if (!updated) return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });

  return NextResponse.json({ assessment: updated }, { status: 200 });
}
