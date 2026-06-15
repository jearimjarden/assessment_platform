import { NextResponse } from 'next/server';
import { requireRole } from '../../../../lib/middleware';
import { createMentor, listMentors } from '../../../../lib/admin';
import { signupSchema } from '../../../../validators/auth';

export async function POST(request: Request) {
  const auth = requireRole(request as any, 'ADMIN');
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const mentor = await createMentor(parsed.data);
    return NextResponse.json({ mentor }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const auth = requireRole(request as any, 'ADMIN');
  if (auth instanceof NextResponse) return auth;

  try {
    const mentors = await listMentors();
    return NextResponse.json({ mentors }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
