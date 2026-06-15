import { db } from './db';
import {
  assessments,
  questions,
  choices,
  assessmentAttempts,
  answers as answersTable,
} from '../../src/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { findTemplateForScore, createUserReport } from './reports';

export async function getPublicAssessmentView(assessmentId: number) {
  const [assessment] = await db
    .select({ id: assessments.id, title: assessments.title, description: assessments.description, status: assessments.status })
    .from(assessments)
    .where(eq(assessments.id, assessmentId));

  if (!assessment) return null;

  const qs = await db
    .select({ id: questions.id, text: questions.text, orderNumber: questions.orderNumber })
    .from(questions)
    .where(eq(questions.assessmentId, assessmentId));

  const questionIds = qs.map((q) => q.id);

  const ch = questionIds.length
    ? await db
        .select({ id: choices.id, questionId: choices.questionId, text: choices.text })
        .from(choices)
        .where(inArray(choices.questionId, questionIds))
    : [];

  const questionsWithChoices = qs.map((q) => ({
    id: q.id,
    text: q.text,
    choices: ch.filter((c) => c.questionId === q.id).map((c) => ({ id: c.id, text: c.text })),
  }));

  return { assessment, questions: questionsWithChoices };
}

type AnswerInput = { questionId: number; choiceId: number };

export async function submitAssessmentAttempt(userId: number, assessmentId: number, answers: AnswerInput[]) {
  // basic validations
  const [assessment] = await db
    .select({ id: assessments.id })
    .from(assessments)
    .where(eq(assessments.id, assessmentId));
  if (!assessment) return { error: 'Assessment not found' };

  if (!Array.isArray(answers) || answers.length === 0) return { error: 'No answers provided' };

  const questionIds = answers.map((a) => a.questionId);
  const choiceIds = answers.map((a) => a.choiceId);

  // ensure questions belong to assessment
  const qs = await db
    .select({ id: questions.id })
    .from(questions)
    .where(inArray(questions.id, questionIds))
    .where(eq(questions.assessmentId, assessmentId));

  if (qs.length !== new Set(questionIds).size) return { error: 'One or more questions not part of assessment' };

  // ensure choices belong to the provided questions and fetch their scores
  const ch = await db
    .select({ id: choices.id, questionId: choices.questionId, score: choices.score })
    .from(choices)
    .where(inArray(choices.id, choiceIds));

  if (ch.length !== choiceIds.length) return { error: 'One or more choices not found' };

  // ensure each choice maps to its question
  const choiceMap = new Map<number, { questionId: number; score: number }>();
  for (const c of ch) choiceMap.set(c.id, { questionId: c.questionId, score: c.score });

  for (const a of answers) {
    const rec = choiceMap.get(a.choiceId);
    if (!rec || rec.questionId !== a.questionId) return { error: 'Choice does not belong to question' };
  }

  // calculate total score server-side
  const totalScore = answers.reduce((sum, a) => sum + (choiceMap.get(a.choiceId)!.score || 0), 0);

  // insert attempt
  const [attempt] = await db
    .insert(assessmentAttempts)
    .values({ userId, assessmentId, totalScore })
    .returning({ id: assessmentAttempts.id, totalScore: assessmentAttempts.totalScore });

  // insert answers
  await db.insert(answersTable).values(
    answers.map((a) => ({ attemptId: attempt.id, questionId: a.questionId, choiceId: a.choiceId }))
  );

  // Try to find a matching report template and create a user_report
  const tpl = await findTemplateForScore(assessmentId, totalScore);
  if (tpl) {
    await createUserReport(attempt.id, tpl.id);
    return { attemptId: attempt.id, totalScore: attempt.totalScore, report: { freeReport: tpl.freeReport, premiumLocked: true } };
  }

  return { attemptId: attempt.id, totalScore: attempt.totalScore, report: null };
}

export default {};
