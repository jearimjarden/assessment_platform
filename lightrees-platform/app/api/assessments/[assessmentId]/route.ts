import { NextResponse } from 'next/server';
import { requireRole } from '../../../../lib/middleware';
import { updateAssessmentIfOwner, deleteAssessmentIfOwner } from '../../../../lib/assessments';
import { updateAssessmentSchema } from '../../../../validators/assessment';
import { getPublicAssessmentView } from '../../../../lib/attempts';

export async function PATCH(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const id = Number(resolvedParams.assessmentId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const updated = await updateAssessmentIfOwner(id, mentorId, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
  }

  return NextResponse.json({ assessment: updated }, { status: 200 });
}

export async function GET(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const auth = requireRole(request as any, 'USER');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const assessmentId = Number(resolvedParams.assessmentId);
  if (Number.isNaN(assessmentId)) return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });

  const view = await getPublicAssessmentView(assessmentId);
  if (!view) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

  return NextResponse.json(view, { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const id = Number(resolvedParams.assessmentId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const deleted = await deleteAssessmentIfOwner(id, mentorId);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
