import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoles = pgEnum('user_roles', ['ADMIN', 'MENTOR', 'USER']);
export const assessmentStatus = pgEnum('assessment_status', ['DRAFT', 'PUBLISHED']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoles('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  mentorId: integer('mentor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: assessmentStatus('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  orderNumber: integer('order_number').notNull(),
});

export const choices = pgTable('choices', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  score: integer('score').notNull(),
});

export const assessmentAttempts = pgTable('assessment_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assessmentId: integer('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  totalScore: integer('total_score').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const answers = pgTable('answers', {
  id: serial('id').primaryKey(),
  attemptId: integer('attempt_id')
    .notNull()
    .references(() => assessmentAttempts.id, { onDelete: 'cascade' }),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  choiceId: integer('choice_id')
    .notNull()
    .references(() => choices.id, { onDelete: 'cascade' }),
});

export const reportTemplates = pgTable('report_templates', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  minScore: integer('min_score').notNull(),
  maxScore: integer('max_score').notNull(),
  freeReport: text('free_report').notNull(),
  premiumReport: text('premium_report').notNull(),
});

export const userReports = pgTable('user_reports', {
  id: serial('id').primaryKey(),
  attemptId: integer('attempt_id')
    .notNull()
    .references(() => assessmentAttempts.id, { onDelete: 'cascade' }),
  reportTemplateId: integer('report_template_id')
    .notNull()
    .references(() => reportTemplates.id, { onDelete: 'cascade' }),
  premiumUnlocked: boolean('premium_unlocked').notNull().default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
  attempts: many(assessmentAttempts),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  mentor: one(users, {
    fields: [assessments.mentorId],
    references: [users.id],
  }),
  questions: many(questions),
  attempts: many(assessmentAttempts),
  reportTemplates: many(reportTemplates),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  assessment: one(assessments, {
    fields: [questions.assessmentId],
    references: [assessments.id],
  }),
  choices: many(choices),
  answers: many(answers),
}));

export const choicesRelations = relations(choices, ({ one }) => ({
  question: one(questions, {
    fields: [choices.questionId],
    references: [questions.id],
  }),
}));

export const assessmentAttemptsRelations = relations(assessmentAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [assessmentAttempts.userId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [assessmentAttempts.assessmentId],
    references: [assessments.id],
  }),
  answers: many(answers),
  userReports: many(userReports),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  attempt: one(assessmentAttempts, {
    fields: [answers.attemptId],
    references: [assessmentAttempts.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  choice: one(choices, {
    fields: [answers.choiceId],
    references: [choices.id],
  }),
}));

export const reportTemplatesRelations = relations(reportTemplates, ({ one, many }) => ({
  assessment: one(assessments, {
    fields: [reportTemplates.assessmentId],
    references: [assessments.id],
  }),
  userReports: many(userReports),
}));

export const userReportsRelations = relations(userReports, ({ one }) => ({
  attempt: one(assessmentAttempts, {
    fields: [userReports.attemptId],
    references: [assessmentAttempts.id],
  }),
  reportTemplate: one(reportTemplates, {
    fields: [userReports.reportTemplateId],
    references: [reportTemplates.id],
  }),
}));
