import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Pastikan direktori .qa-workspace ada di root proyek
const workspaceDir = path.resolve(process.cwd(), ".qa-workspace");
if (!fs.existsSync(workspaceDir)) {
  fs.mkdirSync(workspaceDir, { recursive: true });
}

const dbPath = path.join(workspaceDir, "qa.db");
const client = createClient({
  url: `file:${dbPath.replace(/\\/g, "/")}`,
});

export const db = drizzle(client, { schema });
export { client };
