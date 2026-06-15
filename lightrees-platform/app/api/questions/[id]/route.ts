import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/middleware';
import { updateQuestionIfOwner, deleteQuestionIfOwner } from '@/lib/questions';
import { updateQuestionSchema } from '@/validators/question';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const updated = await updateQuestionIfOwner(id, mentorId, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
  }

  return NextResponse.json({ question: updated }, { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const deleted = await deleteQuestionIfOwner(id, mentorId);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
