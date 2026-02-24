import { pgTable, uuid, varchar, timestamp, decimal, pgEnum, text, jsonb } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['ADMIN', 'HR', 'EMPLOYEE']);
export const leaveStatusEnum = pgEnum('leave_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  plan: varchar('plan', { length: 50 }).default('FREE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  cognitoId: varchar('cognito_id', { length: 255 }).notNull().unique(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: roleEnum('role').default('EMPLOYEE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  clockIn: timestamp('clock_in').notNull(),
  clockOut: timestamp('clock_out'),
  metadata: jsonb('metadata'), // IP, Location, Device
});

export const leaves = pgTable('leaves', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: leaveStatusEnum('status').default('PENDING').notNull(),
  reason: text('reason'),
  approvedBy: uuid('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
