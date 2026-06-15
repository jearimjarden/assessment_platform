import { NextResponse } from 'next/server';
import { signupSchema } from '../../../../validators/auth';
import { signup } from '../../../../lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const parseResult = signupSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
  }

  try {
    const user = await signup(parseResult.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
