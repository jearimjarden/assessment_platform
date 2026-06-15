import { db } from './db';
import { assessments } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export async function createAssessment(mentorId: number, input: { title: string; description: string }) {
  const [assessment] = await db
    .insert(assessments)
    .values({
      mentorId,
      title: input.title,
      description: input.description,
      status: 'DRAFT',
    })
    .returning({
      id: assessments.id,
      mentorId: assessments.mentorId,
      title: assessments.title,
      description: assessments.description,
      status: assessments.status,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
    });

  return assessment;
}

export async function listAssessmentsByMentor(mentorId: number) {
  const rows = await db
    .select({
      id: assessments.id,
      mentorId: assessments.mentorId,
      title: assessments.title,
      description: assessments.description,
      status: assessments.status,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
    })
    .from(assessments)
    .where(eq(assessments.mentorId, mentorId));

  return rows;
}

export async function getAssessmentById(id: number) {
  const [row] = await db
    .select({
      id: assessments.id,
      mentorId: assessments.mentorId,
      title: assessments.title,
      description: assessments.description,
      status: assessments.status,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
    })
    .from(assessments)
    .where(eq(assessments.id, id));

  return row;
}

export async function updateAssessmentIfOwner(id: number, mentorId: number, patch: { title?: string; description?: string }) {
  const [existing] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, id));

  if (!existing) return null;
  if (existing.mentorId !== mentorId) return null;

  const [updated] = await db
    .update(assessments)
    .set({
      ...(patch.title ? { title: patch.title } : {}),
      ...(patch.description ? { description: patch.description } : {}),
    })
    .where(eq(assessments.id, id))
    .returning({
      id: assessments.id,
      mentorId: assessments.mentorId,
      title: assessments.title,
      description: assessments.description,
      status: assessments.status,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
    });

  return updated;
}

export async function publishAssessmentIfOwner(id: number, mentorId: number) {
  const [existing] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, id));

  if (!existing) return null;
  if (existing.mentorId !== mentorId) return null;

  const [updated] = await db
    .update(assessments)
    .set({ status: 'PUBLISHED' })
    .where(eq(assessments.id, id))
    .returning({
      id: assessments.id,
      mentorId: assessments.mentorId,
      title: assessments.title,
      description: assessments.description,
      status: assessments.status,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
    });

  return updated;
}

export async function deleteAssessmentIfOwner(id: number, mentorId: number) {
  const [existing] = await db
    .select({ id: assessments.id, mentorId: assessments.mentorId })
    .from(assessments)
    .where(eq(assessments.id, id));

  if (!existing) return null;
  if (existing.mentorId !== mentorId) return null;

  await db.delete(assessments).where(eq(assessments.id, id));
  return { id };
}
