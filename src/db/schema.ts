import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const viewTypeEnum = pgEnum('view_type', [
  'ideas',
  'bugs',
  'optimizaciones',
  'implementaciones'
]);

export const statusEnum = pgEnum('status', [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done'
]);

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'member',
  'viewer'
]);

export const inviteStatusEnum = pgEnum('invite_status', [
  'pending',
  'accepted',
  'rejected'
]);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  avatarUrl: text('avatar_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Sessions Table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
});

// Projects Table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Project Members Table
export const projectMembers = pgTable('project_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Project Invitations Table
export const projectInvitations = pgTable('project_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  role: memberRoleEnum('role').default('member').notNull(),
  status: inviteStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Items Table (unified for all 4 sheet views)
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  viewType: viewTypeEnum('view_type').notNull(),
  
  // Dynamic / Sheet-specific fields
  title: text('title').notNull(),                  // Idea, Problema, Mejora, or Funcionalidad
  context: text('context'),                       // Contexto (Ideas)
  location: text('location'),                     // Dónde se aplica (Ideas) / Módulo (Bugs)
  severity: text('severity'),                     // Severidad (Bugs: Alta, Media, Baja, Crítica)
  impact: text('impact'),                         // Impacto (Optimizaciones: Alto, Medio, Bajo)
  effort: text('effort'),                         // Esfuerzo (Optimizaciones: Alto, Medio, Bajo)
  priority: text('priority'),                     // Prioridad (Implementaciones: P1, P2, P3)
  sprint: text('sprint'),                         // Sprint/Fase (Implementaciones)
  
  status: text('status').default('backlog').notNull(), // Estado selector
  notes: text('notes'),                           // Notas

  creatorId: uuid('creator_id').references(() => users.id, { onDelete: 'set null' }),
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Attachments Table (Image uploads per item)
export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  ownedProjects: many(projects),
  memberships: many(projectMembers),
  createdItems: many(items, { relationName: 'created_items' }),
  assignedItems: many(items, { relationName: 'assigned_items' }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  members: many(projectMembers),
  invitations: many(projectInvitations),
  items: many(items),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const projectInvitationsRelations = relations(projectInvitations, ({ one }) => ({
  project: one(projects, {
    fields: [projectInvitations.projectId],
    references: [projects.id],
  }),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  project: one(projects, {
    fields: [items.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [items.creatorId],
    references: [users.id],
    relationName: 'created_items',
  }),
  assignee: one(users, {
    fields: [items.assigneeId],
    references: [users.id],
    relationName: 'assigned_items',
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  item: one(items, {
    fields: [attachments.itemId],
    references: [items.id],
  }),
}));

// TypeScript Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
export type ProjectInvitation = typeof projectInvitations.$inferSelect;
export type NewProjectInvitation = typeof projectInvitations.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
