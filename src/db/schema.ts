import { pgEnum, pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const userRoles = pgEnum('user_roles', ['ADMIN', 'MENTOR', 'USER']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoles('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
