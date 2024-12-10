import { pgTable } from "drizzle-orm/pg-core";
import { serial, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt'),
    mockId: varchar('mockId').notNull()
});

export const Question = pgTable('question', {
    id: serial('id').primaryKey(),
    MockQuestionJsonResp: text('MockQuestionJsonResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    typeQuestion: varchar('typeQuestion').notNull(),
    company: varchar('company').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt'),
    mockId: varchar('mockId').notNull()
});

export const UserAnswer = pgTable('userAnswer',{
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    question: varchar('question').notNull(),
    correctAns: text('correctAns'),
    userAns: text('userAns'),
    feedback: text('feedback'),
    rating: varchar('rating'),
    userEmail: varchar('userEmail'),
    createdAt: varchar('createdAt')
})

export const Newsletter = pgTable('newsletter',{
    id: serial('id').primaryKey(),
    newName: varchar('newName'),
    newEmail: varchar('newEmail'),
    newMessage: text('newMessage'),
    createdAt: varchar('createdAt')
})

export const UserSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  darkMode: boolean('dark_mode').default(false),
  notifications: boolean('notifications').default(true),
  sound: boolean('sound').default(true),
  voiceResponse: boolean('voice_response').default(false),
  interviewDuration: integer('interview_duration').default(15),
  autoSave: boolean('auto_save').default(true),
  privacyMode: boolean('privacy_mode').default(false),
  volume: integer('volume').default(80),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});