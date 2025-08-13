import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  status: text("status").notNull().default("active"), // active, archived, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"), // todo, in-progress, completed, blocked
  priority: text("priority").notNull().default("medium"), // low, medium, high
  projectId: varchar("project_id").notNull().references(() => projects.id),
  assigneeId: varchar("assignee_id").references(() => users.id),
  parentId: varchar("parent_id").references(() => tasks.id),
  dueDate: timestamp("due_date"),
  position: jsonb("position"), // {x: number, y: number} for mind map positioning
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  role: text("role").notNull(), // user, assistant
  projectId: varchar("project_id").notNull().references(() => projects.id),
  userId: varchar("user_id").references(() => users.id),
  metadata: jsonb("metadata"), // for storing function calls, attachments, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  tasks: many(tasks),
  comments: many(comments),
  chatMessages: many(chatMessages),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  chatMessages: many(chatMessages),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
  }),
  subtasks: many(tasks),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  project: one(projects, {
    fields: [chatMessages.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
// Feature Requests - LLM self-prompting system for features
export const featureRequests = pgTable("feature_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  justification: text("justification").notNull(), // Why is this needed?
  efficiency_analysis: text("efficiency_analysis"), // Is this the most efficient way?
  alternatives_considered: text("alternatives_considered"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  status: text("status").notNull().default("pending"), // pending, approved, rejected, implemented
  category: text("category").notNull(), // ui, backend, integration, maintenance, etc.
  tags: text("tags").array().default([]),
  estimated_effort: text("estimated_effort"), // small, medium, large, xl
  notes: text("notes"),
  requested_by: text("requested_by").notNull().default("ai_system"),
  projectId: varchar("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  implementedAt: timestamp("implemented_at"),
});

// Tool Diagnostics - Track all available tools and their usage
export const toolDiagnostics = pgTable("tool_diagnostics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tool_name: text("tool_name").notNull().unique(),
  tool_type: text("tool_type").notNull(), // workstation_organ, workflow_tool, system_tool
  description: text("description"),
  usage_count: integer("usage_count").notNull().default(0),
  error_count: integer("error_count").notNull().default(0),
  last_used: timestamp("last_used"),
  last_error: timestamp("last_error"),
  performance_metrics: jsonb("performance_metrics"), // avg_duration, success_rate, etc.
  status: text("status").notNull().default("active"), // active, deprecated, maintenance
  version: text("version").default("1.0"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workstation Organs - Modular AI workspace components
export const workstationOrgans = pgTable("workstation_organs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // canvas, qr_lab, docs, media_player, shopping_list, maps, procurement
  description: text("description"),
  icon: text("icon"),
  config: jsonb("config"),
  shortcuts: jsonb("shortcuts"), // voice commands, QR triggers
  status: text("status").notNull().default("active"),
  usage_count: integer("usage_count").default(0),
  projectId: varchar("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project Health Tracking - AI monitoring system
export const projectHealth = pgTable("project_health", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  health_score: real("health_score").notNull().default(100), // 0-100
  activity_frequency: text("activity_frequency"), // daily, weekly, monthly, stagnant
  last_interaction: timestamp("last_interaction"),
  ai_notes: text("ai_notes"),
  recommendations: jsonb("recommendations"),
  blockers: jsonb("blockers"),
  completion_estimate: real("completion_estimate"), // 0-100 percentage
  priority_suggestion: text("priority_suggestion"), // low, medium, high
  next_suggested_action: text("next_suggested_action"),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Maintenance Logs - Self-monitoring and improvement
export const aiMaintenanceLogs = pgTable("ai_maintenance_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  maintenance_type: text("maintenance_type").notNull(), // health_check, feature_analysis, system_optimization
  description: text("description").notNull(),
  findings: jsonb("findings"),
  actions_taken: jsonb("actions_taken"),
  recommendations: jsonb("recommendations"),
  efficiency_score: real("efficiency_score"), // before/after analysis
  frequency: text("frequency"), // every 5min, 30min, hour, day
  next_check: timestamp("next_check"),
  status: text("status").notNull().default("completed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// New schema types
export const insertFeatureRequestSchema = createInsertSchema(featureRequests).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  implementedAt: true,
});
export type InsertFeatureRequest = z.infer<typeof insertFeatureRequestSchema>;
export type FeatureRequest = typeof featureRequests.$inferSelect;

export const insertToolDiagnosticsSchema = createInsertSchema(toolDiagnostics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertToolDiagnostics = z.infer<typeof insertToolDiagnosticsSchema>;
export type ToolDiagnostics = typeof toolDiagnostics.$inferSelect;

export const insertWorkstationOrganSchema = createInsertSchema(workstationOrgans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWorkstationOrgan = z.infer<typeof insertWorkstationOrganSchema>;
export type WorkstationOrgan = typeof workstationOrgans.$inferSelect;

export const insertProjectHealthSchema = createInsertSchema(projectHealth).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProjectHealth = z.infer<typeof insertProjectHealthSchema>;
export type ProjectHealth = typeof projectHealth.$inferSelect;

export const insertAiMaintenanceLogSchema = createInsertSchema(aiMaintenanceLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertAiMaintenanceLog = z.infer<typeof insertAiMaintenanceLogSchema>;
export type AiMaintenanceLog = typeof aiMaintenanceLogs.$inferSelect;
