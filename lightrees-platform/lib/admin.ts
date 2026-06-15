import bcrypt from 'bcryptjs';
import { db, users } from './db';
import { eq } from 'drizzle-orm';

export async function createMentor(input: { name: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'MENTOR',
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return user;
}

export async function listMentors() {
  const mentors = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.role, 'MENTOR'));

  return mentors;
}
