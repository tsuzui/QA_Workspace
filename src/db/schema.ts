import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g. WAVY
  name: text("name").notNull(),
  description: text("description"),
  repoUrl: text("repo_url"),
  archivedAt: integer("archived_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const environments = sqliteTable("environments", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "restrict" }),
  name: text("name").notNull(), // Development, Staging, Production
  baseUrl: text("base_url").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isProduction: integer("is_production", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const modules = sqliteTable("modules", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  code: text("code").notNull(), // e.g. AUTH, CHAT
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const features = sqliteTable("features", {
  id: text("id").primaryKey(),
  moduleId: text("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const testCases = sqliteTable("test_cases", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "restrict" }),
  featureId: text("feature_id")
    .notNull()
    .references(() => features.id, { onDelete: "restrict" }),
  caseCode: text("case_code").notNull().unique(), // e.g. WAVY-AUTH-001
  title: text("title").notNull(),
  description: text("description"),
  preconditions: text("preconditions"),
  expectedResult: text("expected_result").notNull(),
  priority: text("priority").notNull().default("Medium"), // Critical, High, Medium, Low
  testType: text("test_type").notNull().default("Functional"), // Functional, Regression, Negative, Boundary, Validation, State, Permission
  status: text("status").notNull().default("Draft"), // Draft, Ready, Deprecated
  automationState: text("automation_state").notNull().default("Manual"), // Manual, AI_Executable, Automation_Candidate, Automated
  tags: text("tags"),
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const testSteps = sqliteTable("test_steps", {
  id: text("id").primaryKey(),
  testCaseId: text("test_case_id")
    .notNull()
    .references(() => testCases.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  action: text("action").notNull(),
  testData: text("test_data"),
  expectedResult: text("expected_result"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type Project = typeof projects.$inferSelect;
export type Environment = typeof environments.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Feature = typeof features.$inferSelect;
export type TestCase = typeof testCases.$inferSelect;
export type TestStep = typeof testSteps.$inferSelect;
