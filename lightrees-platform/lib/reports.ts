import { db } from './db';
import { assessments, reportTemplates, userReports, assessmentAttempts } from '@src/db/schema';
import { eq, lte, gte } from 'drizzle-orm';

export async function createReportTemplate(mentorId: number, assessmentId: number, input: { minScore: number; maxScore: number; freeReport: string; premiumReport: string }) {
  const [assessment] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, assessmentId));

  if (!assessment || assessment.mentorId !== mentorId) return null;

  const [tpl] = await db
    .insert(reportTemplates)
    .values({ assessmentId, minScore: input.minScore, maxScore: input.maxScore, freeReport: input.freeReport, premiumReport: input.premiumReport })
    .returning({ id: reportTemplates.id, minScore: reportTemplates.minScore, maxScore: reportTemplates.maxScore, freeReport: reportTemplates.freeReport, premiumReport: reportTemplates.premiumReport });

  return tpl;
}

export async function listReportTemplates(mentorId: number, assessmentId: number) {
  const [assessment] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, assessmentId));

  if (!assessment || assessment.mentorId !== mentorId) return null;

  const rows = await db
    .select({ id: reportTemplates.id, minScore: reportTemplates.minScore, maxScore: reportTemplates.maxScore, freeReport: reportTemplates.freeReport, premiumReport: reportTemplates.premiumReport })
    .from(reportTemplates)
    .where(eq(reportTemplates.assessmentId, assessmentId));

  return rows;
}

export async function findTemplateForScore(assessmentId: number, score: number) {
  const [tpl] = await db
    .select({ id: reportTemplates.id, freeReport: reportTemplates.freeReport, premiumReport: reportTemplates.premiumReport })
    .from(reportTemplates)
    .where(eq(reportTemplates.assessmentId, assessmentId))
    .where(lte(reportTemplates.minScore, score))
    .where(gte(reportTemplates.maxScore, score));

  return tpl ?? null;
}

export async function createUserReport(attemptId: number, reportTemplateId: number) {
  const [ur] = await db
    .insert(userReports)
    .values({ attemptId, reportTemplateId, premiumUnlocked: false })
    .returning({ id: userReports.id, premiumUnlocked: userReports.premiumUnlocked, reportTemplateId: userReports.reportTemplateId });

  return ur;
}

export async function getResultForAttempt(userId: number, attemptId: number) {
  const [att] = await db
    .select({ id: assessmentAttempts.id, userId: assessmentAttempts.userId, totalScore: assessmentAttempts.totalScore })
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.id, attemptId));

  if (!att) return { error: 'Attempt not found' };
  if (att.userId !== userId) return { error: 'Forbidden' };

  const [urRow] = await db
    .select({ id: userReports.id, reportTemplateId: userReports.reportTemplateId, premiumUnlocked: userReports.premiumUnlocked })
    .from(userReports)
    .where(eq(userReports.attemptId, attemptId));

  if (!urRow) {
    return { score: att.totalScore, freeReport: null, premiumReport: null };
  }

  const [tpl] = await db
    .select({ freeReport: reportTemplates.freeReport, premiumReport: reportTemplates.premiumReport })
    .from(reportTemplates)
    .where(eq(reportTemplates.id, urRow.reportTemplateId));

  if (!tpl) return { score: att.totalScore, freeReport: null, premiumReport: null };

  return {
    score: att.totalScore,
    freeReport: tpl.freeReport,
    premiumReport: urRow.premiumUnlocked ? tpl.premiumReport : null,
  };
}

export default {};
