import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { FolderGit2, Settings, ShieldCheck, Box } from "lucide-react";

export const metadata: Metadata = {
  title: "QA Workspace — Local-First AI & Automation Platform",
  description: "Personal local-first system of record for QA assets, test cases, and execution runs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container-shell">
          <aside className="sidebar">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "0.02em" }}>QA Workspace</div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>v1.0 • Local-First MVP</div>
              </div>
            </div>

            <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "var(--radius-sm)", color: "var(--text-main)", backgroundColor: "rgba(255, 255, 255, 0.04)" }}>
                <FolderGit2 size={16} color="var(--accent-primary)" />
                <span style={{ fontWeight: 500 }}>Projects</span>
              </Link>

              <div style={{ marginTop: "16px", padding: "0 12px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)" }}>
                Executor Status
              </div>

              <div style={{ margin: "6px 12px", padding: "10px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-warning)" }}></div>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>Assisted Mode</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.4 }}>
                  Claude in Chrome bridge is in manual/assisted handoff. No automated bridge attached.
                </div>
              </div>
            </nav>

            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Box size={14} />
              <span>Storage: SQLite Local</span>
            </div>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
                <span>Personal QA Engineer Workspace</span>
                <span>/</span>
                <span style={{ color: "var(--text-main)", fontWeight: 500 }}>Phase 1 Foundation</span>
              </div>
            </header>

            <div className="content-body">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
