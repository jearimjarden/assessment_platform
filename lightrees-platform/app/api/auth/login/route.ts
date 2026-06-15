import { NextResponse } from 'next/server';
import { loginSchema } from '../../../../validators/auth';
import { login } from '../../../../lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const parseResult = loginSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
  }

  try {
    const result = await login(parseResult.data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
