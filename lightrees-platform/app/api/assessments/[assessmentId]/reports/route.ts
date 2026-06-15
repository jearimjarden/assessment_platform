import { NextResponse } from 'next/server';
import { requireRole } from '../../../../../lib/middleware';
import { createReportTemplate, listReportTemplates } from '../../../../../lib/reports';

export async function POST(request: Request, { params }: { params: { assessmentId: string } }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const assessmentIdStr = params?.assessmentId ?? (() => {
    const m = new URL(request.url).pathname.match(/\/api\/assessments\/([^\/]+)\/reports/);
    return m ? m[1] : undefined;
  })();
  const assessmentId = Number(assessmentIdStr);
  if (Number.isNaN(assessmentId)) return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });

  const body = await request.json();
  if (!body || typeof body.minScore !== 'number' || typeof body.maxScore !== 'number' || typeof body.freeReport !== 'string' || typeof body.premiumReport !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const mentorId = (auth as any).sub as number;
  const tpl = await createReportTemplate(mentorId, assessmentId, {
    minScore: body.minScore,
    maxScore: body.maxScore,
    freeReport: body.freeReport,
    premiumReport: body.premiumReport,
  });

  if (!tpl) return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });

  return NextResponse.json({ template: tpl }, { status: 201 });
}

export async function GET(request: Request, { params }: { params: { assessmentId: string } }) {
  const auth = requireRole(request as any, 'MENTOR');
  if (auth instanceof NextResponse) return auth;

  const assessmentIdStr = params?.assessmentId ?? (() => {
    const m = new URL(request.url).pathname.match(/\/api\/assessments\/([^\/]+)\/reports/);
    return m ? m[1] : undefined;
  })();
  const assessmentId = Number(assessmentIdStr);
  if (Number.isNaN(assessmentId)) return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });

  const mentorId = (auth as any).sub as number;
  const rows = await listReportTemplates(mentorId, assessmentId);
  if (rows === null) return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });

  return NextResponse.json({ templates: rows }, { status: 200 });
}
