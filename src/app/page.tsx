import { db } from "@/db";
import { projects } from "@/db/schema";
import { runMigrations } from "@/db/migrate";
import { createProjectAction } from "./actions";
import Link from "next/link";
import { FolderGit2, Plus, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { desc } from "drizzle-orm";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  // Pastikan tabel siap
  await runMigrations();

  const { error, created } = await searchParams;
  const projectList = await db.select().from(projects).orderBy(desc(projects.createdAt));

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px" }}>
          QA Projects
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Manage your test workspaces, environments, test cases, and execution history.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "10px", color: "#f87171", fontSize: "13px" }}>
          <AlertCircle size={16} />
          <span>{decodeURIComponent(error)}</span>
        </div>
      )}

      {created && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontSize: "13px" }}>
          <CheckCircle2 size={16} />
          <span>Project created successfully.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        {/* Project List */}
        <div className="panel" style={{ padding: "0" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>All Projects ({projectList.length})</span>
          </div>

          {projectList.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-dim)" }}>
              <FolderGit2 size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>No projects yet</div>
              <div style={{ fontSize: "12px" }}>Create your first project using the form on the right to start managing test cases.</div>
            </div>
          ) : (
            <table className="table-dense">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projectList.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-info)" }}>
                      {p.key}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.description && (
                        <div style={{ fontSize: "12px", color: "var(--text-dim)", maxWidth: "320px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.archivedAt ? (
                        <span className="badge badge-inactive">Archived</span>
                      ) : (
                        <span className="badge badge-active">Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/projects/${p.id}`} className="btn btn-outline" style={{ padding: "4px 10px", fontSize: "12px" }}>
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* New Project Form */}
        <div className="panel">
          <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={16} color="var(--accent-primary)" />
            <span>Create New Project</span>
          </h2>

          <form action={createProjectAction} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Wavy Chatbot"
                required
                className="input-text"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                Project Key * (Uppercase, 2-12 chars)
              </label>
              <input
                type="text"
                name="key"
                placeholder="e.g. WAVY"
                maxLength={12}
                required
                style={{ textTransform: "uppercase" }}
                className="input-text"
              />
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                Used as test case prefix (e.g. WAVY-AUTH-001)
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                Description (Optional)
              </label>
              <textarea
                name="description"
                placeholder="Project overview and test scope..."
                rows={2}
                className="input-text"
                style={{ resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                Repository URL (Optional)
              </label>
              <input
                type="url"
                name="repoUrl"
                placeholder="https://github.com/..."
                className="input-text"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", marginTop: "6px" }}>
              <Plus size={15} />
              <span>Create Project</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
