import { db } from "@/db";
import { projects, environments } from "@/db/schema";
import { createEnvironmentAction, toggleEnvironmentStatusAction, toggleArchiveProjectAction } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import {
  ArrowLeft,
  Globe,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Archive,
  ExternalLink,
  Layers,
  FileText,
  Play
} from "lucide-react";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; envCreated?: string; created?: string }>;
}) {
  const { id } = await params;
  const { error, envCreated, created } = await searchParams;

  const projectRows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (projectRows.length === 0) {
    notFound();
  }
  const project = projectRows[0];

  const envList = await db
    .select()
    .from(environments)
    .where(eq(environments.projectId, id))
    .orderBy(desc(environments.createdAt));

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Breadcrumb & Header */}
      <div>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px" }}>
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, padding: "2px 8px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-sm)", color: "var(--accent-info)" }}>
                {project.key}
              </span>
              <h1 style={{ fontSize: "22px", fontWeight: 700 }}>{project.name}</h1>
              {project.archivedAt && (
                <span className="badge badge-inactive">Archived</span>
              )}
            </div>
            {project.description && (
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                {project.description}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <form action={toggleArchiveProjectAction.bind(null, project.id, !project.archivedAt)}>
              <button type="submit" className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }}>
                <Archive size={14} />
                <span>{project.archivedAt ? "Restore Project" : "Archive"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "10px", color: "#f87171", fontSize: "13px" }}>
          <AlertCircle size={16} />
          <span>{decodeURIComponent(error)}</span>
        </div>
      )}

      {(envCreated || created) && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontSize: "13px" }}>
          <CheckCircle2 size={16} />
          <span>{created ? "Project initialized successfully." : "Environment created successfully."}</span>
        </div>
      )}

      {/* Nav Tabs (Planned Phase Modules explicitly labeled) */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <button className="btn btn-outline" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-strong)", fontSize: "13px", fontWeight: 600 }}>
          <Globe size={15} color="var(--accent-primary)" />
          <span>Environments ({envList.length})</span>
        </button>
        <button className="btn btn-outline" style={{ opacity: 0.6, fontSize: "13px", cursor: "not-allowed" }} title="Next Phase">
          <FileText size={15} />
          <span>PRD & Requirements (Phase 1.2)</span>
        </button>
        <button className="btn btn-outline" style={{ opacity: 0.6, fontSize: "13px", cursor: "not-allowed" }} title="Next Phase">
          <Layers size={15} />
          <span>Modules & Test Cases (Phase 1.3)</span>
        </button>
        <button className="btn btn-outline" style={{ opacity: 0.6, fontSize: "13px", cursor: "not-allowed" }} title="Next Phase">
          <Play size={15} />
          <span>Test Runs (Phase 2)</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>
        {/* Environment List */}
        <div className="panel" style={{ padding: "0" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Configured Environments</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>FR-002 Compliant</span>
          </div>

          {envList.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-dim)" }}>
              <Globe size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>No environments defined</div>
              <div style={{ fontSize: "12px" }}>Add a Development or Staging base URL to execute future browser runs against.</div>
            </div>
          ) : (
            <table className="table-dense">
              <thead>
                <tr>
                  <th>Environment</th>
                  <th>Base URL</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {envList.map((env) => (
                  <tr key={env.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 600 }}>{env.name}</span>
                        {env.isProduction ? (
                          <span className="badge badge-prod">
                            <AlertTriangle size={10} style={{ marginRight: "3px" }} />
                            Production
                          </span>
                        ) : (
                          <span className="badge badge-dev">Non-Prod</span>
                        )}
                      </div>
                      {env.description && (
                        <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                          {env.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <a
                        href={env.baseUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <span>{env.baseUrl}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      {env.isActive ? (
                        <span className="badge badge-active">Active</span>
                      ) : (
                        <span className="badge badge-inactive">Inactive</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <form action={toggleEnvironmentStatusAction.bind(null, project.id, env.id, env.isActive)}>
                        <button type="submit" className="btn btn-outline" style={{ padding: "3px 8px", fontSize: "11px" }}>
                          {env.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Environment Form */}
        <div className="panel">
          <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={16} color="var(--accent-primary)" />
            <span>Add Environment</span>
          </h2>

          <form action={createEnvironmentAction.bind(null, project.id)} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                Environment Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Development, Staging, Local"
                required
                className="input-text"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                Base URL * (http:// or https://)
              </label>
              <input
                type="url"
                name="baseUrl"
                placeholder="http://localhost:3000 or https://dev.app.com"
                required
                className="input-text"
              />
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                Target base URL snapshot will be captured per run.
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                Description (Optional)
              </label>
              <input
                type="text"
                name="description"
                placeholder="e.g. Local dev build on branch main"
                className="input-text"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                <input type="checkbox" name="isActive" defaultChecked />
                <span>Active environment for test execution</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#f87171", cursor: "pointer" }}>
                <input type="checkbox" name="isProduction" />
                <span>Mark as Production (Requires explicit confirmation before runs)</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", marginTop: "6px" }}>
              <Plus size={15} />
              <span>Save Environment</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
