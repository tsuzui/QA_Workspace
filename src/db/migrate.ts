import { client } from "./index";

export async function runMigrations() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY NOT NULL,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      repo_url TEXT,
      archived_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS environments (
      id TEXT PRIMARY KEY NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_production INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY NOT NULL,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
      name TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
      feature_id TEXT NOT NULL REFERENCES features(id) ON DELETE RESTRICT,
      case_code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      preconditions TEXT,
      expected_result TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      test_type TEXT NOT NULL DEFAULT 'Functional',
      status TEXT NOT NULL DEFAULT 'Draft',
      automation_state TEXT NOT NULL DEFAULT 'Manual',
      tags TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS test_steps (
      id TEXT PRIMARY KEY NOT NULL,
      test_case_id TEXT NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
      step_number INTEGER NOT NULL,
      action TEXT NOT NULL,
      test_data TEXT,
      expected_result TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Database tables initialized successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
