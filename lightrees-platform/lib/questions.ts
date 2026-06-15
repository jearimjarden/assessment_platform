import { db } from './db';
import { assessments, choices, questions } from '@src/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function createQuestion(mentorId: number, assessmentId: number, input: { text: string; orderNumber: number; choices: Array<{ text: string; score: number }> }) {
  const [assessment] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, assessmentId));

  if (!assessment || assessment.mentorId !== mentorId) return null;

  const [question] = await db
    .insert(questions)
    .values({
      assessmentId,
      text: input.text,
      orderNumber: input.orderNumber,
    })
    .returning({
      id: questions.id,
      assessmentId: questions.assessmentId,
      text: questions.text,
      orderNumber: questions.orderNumber,
    });

  const insertedChoices = await db
    .insert(choices)
    .values(
      input.choices.map((choice) => ({
        questionId: question.id,
        text: choice.text,
        score: choice.score,
      }))
    )
    .returning({
      id: choices.id,
      text: choices.text,
      score: choices.score,
    });

  return {
    ...question,
    choices: insertedChoices,
  };
}

export async function listQuestionsByAssessment(mentorId: number, assessmentId: number) {
  const [assessment] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, assessmentId));

  if (!assessment || assessment.mentorId !== mentorId) return null;

  const allQuestions = await db
    .select({
      id: questions.id,
      assessmentId: questions.assessmentId,
      text: questions.text,
      orderNumber: questions.orderNumber,
    })
    .from(questions)
    .where(eq(questions.assessmentId, assessmentId));

  if (allQuestions.length === 0) return [];

  const questionIds = allQuestions.map((question) => question.id);

  const allChoices = await db
    .select({
      id: choices.id,
      questionId: choices.questionId,
      text: choices.text,
      score: choices.score,
    })
    .from(choices)
    .where(inArray(choices.questionId, questionIds));

  return allQuestions.map((question) => ({
    ...question,
    choices: allChoices.filter((choice) => choice.questionId === question.id),
  }));
}

export async function updateQuestionIfOwner(questionId: number, mentorId: number, patch: { text?: string; orderNumber?: number }) {
  const [question] = await db
    .select({ id: questions.id, assessmentId: questions.assessmentId })
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!question) return null;

  const [assessment] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, question.assessmentId));

  if (!assessment || assessment.mentorId !== mentorId) return null;

  const [updated] = await db
    .update(questions)
    .set({
      ...(patch.text ? { text: patch.text } : {}),
      ...(patch.orderNumber !== undefined ? { orderNumber: patch.orderNumber } : {}),
    })
    .where(eq(questions.id, questionId))
    .returning({
      id: questions.id,
      assessmentId: questions.assessmentId,
      text: questions.text,
      orderNumber: questions.orderNumber,
    });

  return updated;
}

export async function deleteQuestionIfOwner(questionId: number, mentorId: number) {
  const [question] = await db
    .select({ id: questions.id, assessmentId: questions.assessmentId })
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!question) return null;

  const [assessment] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, question.assessmentId));

  if (!assessment || assessment.mentorId !== mentorId) return null;

  await db.delete(choices).where(eq(choices.questionId, questionId));
  await db.delete(questions).where(eq(questions.id, questionId));

  return { id: questionId };
}
