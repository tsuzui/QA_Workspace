"use client";

import React, { useState } from "react";
import {
  createModuleAction,
  createFeatureAction,
  createTestCaseAction,
  updateTestCaseStatusAction,
  updateTestCaseAutomationAction
} from "@/app/actions";
import {
  Plus,
  Layers,
  FolderTree,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ListOrdered,
  FileCode,
  Tag,
  Trash2
} from "lucide-react";

interface StepRow {
  action: string;
  testData: string;
  expectedResult: string;
}

interface TestRepositoryProps {
  projectId: string;
  projectKey: string;
  modulesList: Array<{ id: string; name: string; code: string }>;
  featuresList: Array<{ id: string; moduleId: string; name: string; description: string | null }>;
  casesList: Array<{
    id: string;
    featureId: string;
    caseCode: string;
    title: string;
    description: string | null;
    preconditions: string | null;
    expectedResult: string;
    priority: string;
    testType: string;
    status: string;
    automationState: string;
    tags: string | null;
    version: number;
    createdAt: Date;
  }>;
  stepsList: Array<{
    id: string;
    testCaseId: string;
    stepNumber: number;
    action: string;
    testData: string | null;
    expectedResult: string | null;
  }>;
}

export function TestRepository({
  projectId,
  projectKey,
  modulesList,
  featuresList,
  casesList,
  stepsList,
}: TestRepositoryProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(casesList[0]?.id || null);
  const [activeSubTab, setActiveSubTab] = useState<"list" | "newCase" | "newModule">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Dynamic step rows for new test case form
  const [steps, setSteps] = useState<StepRow[]>([
    { action: "", testData: "", expectedResult: "" },
  ]);

  const handleAddStep = () => {
    setSteps([...steps, { action: "", testData: "", expectedResult: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, field: keyof StepRow, value: string) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  // Map module code by feature
  const featureToModuleMap = new Map<string, { moduleName: string; moduleCode: string; featureName: string }>();
  featuresList.forEach((f) => {
    const mod = modulesList.find((m) => m.id === f.moduleId);
    if (mod) {
      featureToModuleMap.set(f.id, {
        moduleName: mod.name,
        moduleCode: mod.code,
        featureName: f.name,
      });
    }
  });

  // Filter test cases
  const filteredCases = casesList.filter((c) => {
    const featInfo = featureToModuleMap.get(c.featureId);
    if (filterModule !== "ALL" && featInfo?.moduleCode !== filterModule) return false;
    if (filterPriority !== "ALL" && c.priority !== filterPriority) return false;
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.caseCode.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchTags = c.tags ? c.tags.toLowerCase().includes(q) : false;
      return matchCode || matchTitle || matchTags;
    }
    return true;
  });

  const selectedCase = casesList.find((c) => c.id === selectedCaseId);
  const selectedCaseSteps = selectedCase
    ? stepsList.filter((s) => s.testCaseId === selectedCase.id).sort((a, b) => a.stepNumber - b.stepNumber)
    : [];
  const selectedFeatInfo = selectedCase ? featureToModuleMap.get(selectedCase.featureId) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top action & view switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveSubTab("list")}
            className={`btn ${activeSubTab === "list" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            <FolderTree size={14} />
            <span>Test Case Repository ({casesList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("newCase")}
            className={`btn ${activeSubTab === "newCase" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            <Plus size={14} />
            <span>Create Test Case</span>
          </button>
          <button
            onClick={() => setActiveSubTab("newModule")}
            className={`btn ${activeSubTab === "newModule" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            <Layers size={14} />
            <span>Manage Modules & Features ({modulesList.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MANAGE MODULES & FEATURES */}
      {activeSubTab === "newModule" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Create Module */}
          <div className="panel">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={15} color="var(--accent-primary)" />
              <span>Create Module</span>
            </h3>
            <form action={createModuleAction.bind(null, projectId)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Module Name *
                </label>
                <input type="text" name="name" placeholder="e.g. Authentication & Authorization" required className="input-text" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Module Code * (2-8 chars, e.g. AUTH)
                </label>
                <input type="text" name="code" placeholder="e.g. AUTH" maxLength={8} required style={{ textTransform: "uppercase" }} className="input-text" />
                <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                  Used in case IDs: {projectKey}-[CODE]-001
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", marginTop: "4px" }}>
                <Plus size={14} />
                <span>Save Module</span>
              </button>
            </form>

            <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                Existing Modules
              </div>
              {modulesList.length === 0 ? (
                <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>No modules created yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {modulesList.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <div>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-info)", marginRight: "8px" }}>{m.code}</span>
                        <span>{m.name}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                        {featuresList.filter((f) => f.moduleId === m.id).length} features
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create Feature */}
          <div className="panel">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FolderTree size={15} color="var(--accent-primary)" />
              <span>Create Feature under Module</span>
            </h3>
            {modulesList.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-dim)", fontSize: "12px" }}>
                Create a module first before adding features.
              </div>
            ) : (
              <form action={createFeatureAction.bind(null, projectId)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Parent Module *
                  </label>
                  <select name="moduleId" required className="input-text" style={{ backgroundColor: "var(--bg-main)" }}>
                    {modulesList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} — {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Feature Name *
                  </label>
                  <input type="text" name="name" placeholder="e.g. User Login Form" required className="input-text" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Description (Optional)
                  </label>
                  <input type="text" name="description" placeholder="Feature scope..." className="input-text" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", marginTop: "4px" }}>
                  <Plus size={14} />
                  <span>Save Feature</span>
                </button>
              </form>
            )}

            <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                Existing Features
              </div>
              {featuresList.length === 0 ? (
                <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>No features added yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
                  {featuresList.map((f) => {
                    const mod = modulesList.find((m) => m.id === f.moduleId);
                    return (
                      <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "var(--accent-info)", marginRight: "6px" }}>[{mod?.code}]</span>
                          <span style={{ fontSize: "13px" }}>{f.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CREATE TEST CASE FORM */}
      {activeSubTab === "newCase" && (
        <div className="panel" style={{ maxWidth: "800px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={16} color="var(--accent-primary)" />
            <span>Create Structured Test Case</span>
          </h3>

          {featuresList.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-dim)" }}>
              Please create at least one Module and Feature before defining test cases.
            </div>
          ) : (
            <form action={createTestCaseAction.bind(null, projectId)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                    Target Feature *
                  </label>
                  <select name="featureId" required className="input-text" style={{ backgroundColor: "var(--bg-main)" }}>
                    {featuresList.map((f) => {
                      const mod = modulesList.find((m) => m.id === f.moduleId);
                      return (
                        <option key={f.id} value={f.id}>
                          [{mod?.code}] {f.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                    Priority *
                  </label>
                  <select name="priority" defaultValue="Medium" className="input-text" style={{ backgroundColor: "var(--bg-main)" }}>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                  Test Case Title / Scenario *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Verify login fails with invalid password format"
                  required
                  className="input-text"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                    Test Type *
                  </label>
                  <select name="testType" defaultValue="Functional" className="input-text" style={{ backgroundColor: "var(--bg-main)" }}>
                    <option value="Functional">Functional (Happy Path)</option>
                    <option value="Negative">Negative (Invalid Input)</option>
                    <option value="Boundary">Boundary (Edge Value)</option>
                    <option value="Validation">Validation (Format/Rule)</option>
                    <option value="State">State (Empty/Loaded)</option>
                    <option value="Permission">Permission (Role/Access)</option>
                    <option value="Regression">Regression</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                    Tags (Comma separated)
                  </label>
                  <input type="text" name="tags" placeholder="e.g. auth, smoke, p1" className="input-text" />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                  Preconditions (Optional)
                </label>
                <textarea name="preconditions" placeholder="e.g. User account exists in database and is active" rows={2} className="input-text" style={{ resize: "vertical" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 500 }}>
                  Expected Result (Observable behavior) *
                </label>
                <textarea
                  name="expectedResult"
                  placeholder="e.g. Inline error message 'Invalid credentials' displayed and login button remains active."
                  required
                  rows={2}
                  className="input-text"
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Dynamic Steps */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginTop: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>
                    Ordered Test Steps (Action & Checkpoint) *
                  </label>
                  <button type="button" onClick={handleAddStep} className="btn btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }}>
                    <Plus size={12} />
                    <span>Add Step</span>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {steps.map((st, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 1fr 32px", gap: "8px", alignItems: "center", padding: "8px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        name="stepAction"
                        value={st.action}
                        onChange={(e) => handleStepChange(idx, "action", e.target.value)}
                        placeholder="Action (e.g. Click Login button)"
                        required
                        className="input-text"
                        style={{ padding: "6px 8px", fontSize: "12px" }}
                      />
                      <input
                        type="text"
                        name="stepData"
                        value={st.testData}
                        onChange={(e) => handleStepChange(idx, "testData", e.target.value)}
                        placeholder="Test data reference (optional)"
                        className="input-text"
                        style={{ padding: "6px 8px", fontSize: "12px" }}
                      />
                      <input
                        type="text"
                        name="stepExpected"
                        value={st.expectedResult}
                        onChange={(e) => handleStepChange(idx, "expectedResult", e.target.value)}
                        placeholder="Step observation / check"
                        className="input-text"
                        style={{ padding: "6px 8px", fontSize: "12px" }}
                      />
                      {steps.length > 1 ? (
                        <button type="button" onClick={() => handleRemoveStep(idx)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Remove step">
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button type="submit" className="btn btn-primary">
                  <Plus size={15} />
                  <span>Save Test Case (Initial: Draft)</span>
                </button>
                <button type="button" onClick={() => setActiveSubTab("list")} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* VIEW 3: TEST CASE LIST & DETAIL DRAWER */}
      {activeSubTab === "list" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "20px", alignItems: "start" }}>
          {/* Left Table */}
          <div className="panel" style={{ padding: "0" }}>
            {/* Filter Bar */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search case code, title, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-text"
                style={{ flex: 1, minWidth: "180px", padding: "4px 8px", fontSize: "12px" }}
              />

              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="input-text"
                style={{ width: "auto", padding: "4px 8px", fontSize: "12px", backgroundColor: "var(--bg-main)" }}
              >
                <option value="ALL">All Modules</option>
                {modulesList.map((m) => (
                  <option key={m.id} value={m.code}>{m.code} - {m.name}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input-text"
                style={{ width: "auto", padding: "4px 8px", fontSize: "12px", backgroundColor: "var(--bg-main)" }}
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-text"
                style={{ width: "auto", padding: "4px 8px", fontSize: "12px", backgroundColor: "var(--bg-main)" }}
              >
                <option value="ALL">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Ready">Ready</option>
                <option value="Deprecated">Deprecated</option>
              </select>
            </div>

            {filteredCases.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-dim)" }}>
                <FolderTree size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>No test cases match filter</div>
                <div style={{ fontSize: "12px" }}>Create test cases or adjust your filter query.</div>
              </div>
            ) : (
              <table className="table-dense">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Scenario</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Automation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((c) => {
                    const isSelected = c.id === selectedCaseId;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCaseId(c.id)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected ? "rgba(37, 99, 235, 0.08)" : undefined,
                        }}
                      >
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--accent-info)" }}>
                          {c.caseCode}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: "13px" }}>{c.title}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                            {c.testType}
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: c.priority === "Critical" ? "rgba(239, 68, 68, 0.15)" : c.priority === "High" ? "rgba(245, 158, 11, 0.15)" : "rgba(100, 116, 139, 0.15)",
                              color: c.priority === "Critical" ? "#f87171" : c.priority === "High" ? "#fbbf24" : "#94a3b8",
                            }}
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: c.status === "Ready" ? "rgba(16, 185, 129, 0.15)" : "rgba(100, 116, 139, 0.15)",
                              color: c.status === "Ready" ? "#34d399" : "#94a3b8",
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                            {c.automationState}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Right Detail Panel */}
          <div className="panel">
            {selectedCase ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--accent-info)" }}>
                      {selectedCase.caseCode}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>v{selectedCase.version}</span>
                  </div>
                  <h4 style={{ fontSize: "15px", fontWeight: 600, marginTop: "4px" }}>
                    {selectedCase.title}
                  </h4>
                  {selectedFeatInfo && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Module: <strong>{selectedFeatInfo.moduleName}</strong> &bull; Feature: <strong>{selectedFeatInfo.featureName}</strong>
                    </div>
                  )}
                </div>

                {/* Status & Automation Transition Controls */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "8px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>Status:</div>
                    <select
                      value={selectedCase.status}
                      onChange={(e) => updateTestCaseStatusAction(projectId, selectedCase.id, e.target.value)}
                      className="input-text"
                      style={{ fontSize: "12px", padding: "4px 8px", backgroundColor: "var(--bg-surface)" }}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Ready">Ready (Reviewed)</option>
                      <option value="Deprecated">Deprecated</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>Automation:</div>
                    <select
                      value={selectedCase.automationState}
                      onChange={(e) => updateTestCaseAutomationAction(projectId, selectedCase.id, e.target.value)}
                      className="input-text"
                      style={{ fontSize: "12px", padding: "4px 8px", backgroundColor: "var(--bg-surface)" }}
                    >
                      <option value="Manual">Manual</option>
                      <option value="AI_Executable">AI Executable</option>
                      <option value="Automation_Candidate">Automation Candidate</option>
                      <option value="Automated">Automated</option>
                    </select>
                  </div>
                </div>

                {selectedCase.preconditions && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Preconditions
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "2px", color: "var(--text-main)" }}>
                      {selectedCase.preconditions}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Expected Result
                  </div>
                  <div style={{ fontSize: "12px", marginTop: "2px", color: "var(--accent-success)", fontWeight: 500 }}>
                    {selectedCase.expectedResult}
                  </div>
                </div>

                {/* Steps List */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                    Ordered Steps ({selectedCaseSteps.length})
                  </div>
                  {selectedCaseSteps.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>No steps defined.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {selectedCaseSteps.map((s) => (
                        <div key={s.id} style={{ padding: "8px 10px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-dim)" }}>
                              {s.stepNumber}.
                            </span>
                            <span style={{ fontWeight: 500 }}>{s.action}</span>
                          </div>
                          {s.testData && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", paddingLeft: "16px" }}>
                              Data: <span style={{ fontFamily: "var(--font-mono)" }}>{s.testData}</span>
                            </div>
                          )}
                          {s.expectedResult && (
                            <div style={{ fontSize: "11px", color: "#60a5fa", marginTop: "2px", paddingLeft: "16px" }}>
                              Check: {s.expectedResult}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: "12px" }}>
                Select a test case to view its full details and step definitions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
