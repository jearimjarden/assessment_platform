import { NextResponse } from 'next/server';
import { requireRole } from '../../../../../lib/middleware';
import { createQuestion, listQuestionsByAssessment } from '../../../../../lib/questions';
import { createQuestionSchema } from '../../../../../validators/question';

export async function POST(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const assessmentId = Number(resolvedParams.assessmentId);
  if (Number.isNaN(assessmentId)) {
    return NextResponse.json({ error: 'Invalid assessmentId' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const question = await createQuestion(mentorId, assessmentId, parsed.data);
  if (!question) {
    return NextResponse.json({ error: 'Assessment not found or not owned' }, { status: 404 });
  }

  return NextResponse.json({ question }, { status: 201 });
}

export async function GET(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const assessmentId = Number(resolvedParams.assessmentId);
  if (Number.isNaN(assessmentId)) {
    return NextResponse.json({ error: 'Invalid assessmentId' }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const questions = await listQuestionsByAssessment(mentorId, assessmentId);
  if (questions === null) {
    return NextResponse.json({ error: 'Assessment not found or not owned' }, { status: 404 });
  }

  return NextResponse.json({ questions }, { status: 200 });
}
