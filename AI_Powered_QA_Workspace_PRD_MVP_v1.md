# Product Requirements Document (PRD)

# AI-Powered QA Workspace --- MVP v1.0

**Document status:** Draft for implementation\
**Product type:** Personal QA workspace\
**Primary user:** QA Engineer\
**Initial project:** Wavy Chatbot\
**Initial environment:** Development\
**Primary browser executor:** Claude in Chrome\
**Future automation engine:** Playwright\
**Storage strategy:** Local-first (on the user's computer)

------------------------------------------------------------------------

## 1. Product Overview

### 1.1 Vision

Build a local-first QA workspace that centralizes project management,
product requirements, test cases, test execution, evidence, and defect
tracking. The first execution mode uses an AI browser agent through
Claude in Chrome. Once test scenarios and browser locators are
validated, the platform can progressively generate and run Playwright
automation for repeatable regression testing.

The platform is not merely a dashboard or a prompt launcher. It is the
system of record for QA assets and execution history.

### 1.2 Product principles

1.  **QA remains in control.** AI proposes, executes within defined
    boundaries, and reports. QA approves requirements, test cases,
    locator changes, and automation scripts.
2.  **Evidence before conclusions.** A PASS or FAIL must be supported by
    observable evidence and a defined expected result.
3.  **Separate product defects from execution errors.** Browser
    disconnection, agent failures, and missing credentials must not be
    reported as application bugs.
4.  **Local-first and private by default.** Project data, test results,
    screenshots, and logs are stored locally in MVP.
5.  **Automation is incremental.** AI Browser Agent is the initial
    executor. Playwright is introduced after scenarios and locators are
    reviewed.
6.  **Traceability.** Requirements map to test cases; test cases map to
    test runs, results, evidence, defects, and later automation scripts.
7.  **No destructive assumptions.** The agent must not create, update,
    or delete application data unless the test case explicitly
    authorizes that action.

### 1.3 MVP success criteria

A QA user can: - Create and manage multiple projects. - Configure
project environments and base URLs. - Upload and review PRD documents. -
Extract draft requirements and acceptance criteria from PRDs. - Create,
edit, organize, and version test cases. - Link test cases to
requirements. - Create a test run using selected modules or selected
test cases. - Run a sequential batch using Claude in Chrome, subject to
a verified local integration. - Use configured test credentials without
exposing secrets in logs or screenshots. - Save a screenshot for each
test case, execution logs, and additional screenshots when a case
fails. - Continue the batch after a test case fails. - Review results
and re-run failed test cases. - Store all MVP data and evidence locally.

------------------------------------------------------------------------

## 2. Users and Scope

### 2.1 Primary persona

**Personal QA Engineer** - Manages several web application projects. -
Works across Development, Staging, and potentially Production
environments. - Writes and maintains test cases. - Performs functional
testing and regression testing. - Uses an AI browser agent initially and
wants a path to reliable Playwright automation.

### 2.2 In scope for MVP

  -----------------------------------------------------------------------
  Area                                MVP requirement
  ----------------------------------- -----------------------------------
  Workspace                           Single-user local workspace

  Projects                            Multiple projects, isolated data

  Environments                        Multiple URLs per project

  PRD repository                      Upload, view, version, parse
                                      documents

  Requirements                        AI-assisted extraction and review

  Modules/features                    Configurable project hierarchy

  Test cases                          CRUD, steps, expected results,
                                      priority, type

  Traceability                        Requirement-to-test-case mapping

  Test data                           Non-secret test data and account
                                      references

  Secrets                             Secure local credential storage

  Test runs                           Selected modules/cases, batch
                                      queue, run history

  AI execution                        Claude in Chrome integration
                                      proof-of-concept

  Evidence                            Per-case screenshot, execution log,
                                      fail screenshot

  Results                             PASS, FAIL, BLOCKED, ERROR,
                                      SKIPPED, NEEDS_REVIEW

  Defects                             Create and link defect records from
                                      failures

  Reports                             Run summary, pass rate, coverage,
                                      history

  Locator discovery                   Basic inspection and candidate
                                      locator capture, subject to
                                      integration feasibility
  -----------------------------------------------------------------------

### 2.3 Out of scope for MVP

-   Multi-user collaboration and role-based access.
-   Cloud synchronization or hosted database.
-   Fully autonomous production testing.
-   Unbounded agent retries.
-   Parallel execution in a single Chrome session.
-   Automatic creation of defects in Jira/Linear or other external
    systems.
-   Full Playwright execution infrastructure.
-   GitHub push/pull and CI/CD.
-   Docker-based remote execution.
-   Mobile native application testing.
-   AI-generated test cases being automatically approved without QA
    review.

These are potential later phases, not MVP acceptance requirements.

------------------------------------------------------------------------

## 3. Information Architecture

### 3.1 Global navigation

1.  Dashboard
2.  Projects
3.  Workspace Settings

### 3.2 Project navigation

Within each project:

1.  Overview
2.  Environments
3.  PRD Repository
4.  Requirements
5.  Modules & Features
6.  Test Cases
7.  Test Data & Accounts
8.  Test Runs
9.  Locator Repository
10. Defects
11. Reports

The interface may hide or label future-phase features as "Planned" until
implemented. Do not present non-functional controls as if they work.

### 3.3 Project hierarchy

``` text
Workspace
└── Project
    ├── Environments
    ├── PRD Documents
    │   └── Requirements
    ├── Modules
    │   └── Features
    │       └── Test Cases
    │           └── Test Steps
    ├── Test Data & Accounts
    ├── Test Runs
    │   └── Test Run Cases
    │       └── Execution Steps
    ├── Locator Repository
    ├── Defects
    └── Reports
```

The module/feature hierarchy must be configurable. Do not hard-code Wavy
Chatbot's modules into the application.

------------------------------------------------------------------------

## 4. Functional Requirements

### FR-001 --- Workspace and Project Management

The user can: - Create, edit, archive, and delete projects. - Set
project name, description, key, and optional repository URL. - View
project-level test activity and summary. - Keep all records scoped to
their owning project.

Each project has a stable internal ID and a human-readable project key,
such as `WAVY`.

### FR-002 --- Environment Management

The user can configure multiple environments per project.

Environment fields: - Name (Development, Staging, Production, or
custom). - Base URL. - Optional description. - Active/inactive state. -
Optional environment-specific notes.

Requirements: - A test run references one environment. - The selected
environment URL is resolved when the run is created. - The run stores a
snapshot of the URL used, so historical records remain accurate. -
Production environments should display a warning and require explicit
confirmation before execution. - Never infer or silently substitute a
different environment URL.

### FR-003 --- PRD Repository

The user can: - Upload PDF, DOCX, XLSX, and Markdown/text documents
where supported by the implementation. - Add a title, version, status,
and description. - View document metadata and extracted text. - Upload a
revised version while preserving prior versions. - Mark a PRD as Draft,
In Review, Approved, or Archived.

The system must retain the source document and its version metadata.
Parsing failures must be visible and must not silently create incomplete
requirements.

### FR-004 --- Requirement Extraction and Review

AI-assisted PRD analysis may extract: - Requirement ID. - Requirement
title. - Description. - Module/feature association. - Business rules. -
Acceptance criteria. - Validation rules. - Roles/permissions. -
Priority, when explicitly stated. - Source document and page/section
reference.

Rules: - Extracted records are drafts until reviewed by QA. - Do not
invent missing business rules, expected results, or priority. - Mark
unclear or conflicting statements as `Needs Clarification`. - Preserve a
link to the source PRD version and source location. - Allow manual
creation and editing of requirements. - Allow requirements to exist
without a PRD.

### FR-005 --- Module and Feature Management

The user can: - Create, rename, reorder, archive, and delete
modules/features. - Support at least a two-level hierarchy: Module →
Feature. - Assign test cases to a feature. - Filter test cases by module
and feature.

Deleting a module or feature with linked records must require
confirmation and a safe handling strategy (archive or reassignment). Do
not silently cascade-delete test history.

### FR-006 --- Test Case Repository

A test case contains:

  --------------------------------------------------------------------------
  Field                                     Required Description
  --------------------- ---------------------------- -----------------------
  Test Case ID                                   Yes Unique within a project

  Title / Scenario                               Yes What is being verified

  Module / Feature                               Yes Organizational location

  Description                                     No Additional context

  Preconditions                                   No Required state before
                                                     execution

  Test Steps                                     Yes Ordered actions and
                                                     checks

  Test Data                                       No References to data sets
                                                     or safe values

  Expected Result                                Yes Observable expected
                                                     behavior

  Priority                                       Yes Critical, High, Medium,
                                                     Low

  Test Type                                      Yes Functional, Regression,
                                                     Negative, Boundary, UI,
                                                     etc.

  Requirement Links                               No Linked requirement IDs

  Tags                                            No Searchable labels

  Status                                         Yes Draft, Ready,
                                                     Deprecated

  Automation State                               Yes Manual, AI-executable,
                                                     Automation-candidate,
                                                     Automated
  --------------------------------------------------------------------------

Each step should support: - Step number. - Action/instruction. -
Input/test data reference. - Expected observation or checkpoint.

Requirements: - Support manual creation and editing. - Support duplicate
test case. - Support search, filters, sorting, and bulk selection. -
Preserve version history or immutable snapshots for test runs. - Do not
let a test run's historical test case content change when the repository
case is edited later.

### FR-007 --- Requirement Traceability

The system must support: - One requirement linked to multiple test
cases. - One test case linked to multiple requirements. - Coverage
status: Covered, Partially Covered, Not Covered, Needs Review. - A
report showing approved requirements without linked test cases. - A
report showing test cases without requirement links.

A missing PRD or requirement link must not prevent test execution.

### FR-008 --- Test Data and Test Accounts

The user can manage: - Test account name/alias. - Username or email,
where appropriate. - Role. - Environment compatibility. -
Active/inactive status. - Notes. - Associated test cases or use cases.

Credential rules: - Passwords, tokens, and secrets must not be stored as
plaintext in ordinary database fields, test case descriptions, logs,
screenshots, or Git repositories. - Use an OS keychain or a suitable
encrypted local secret store. - The UI should show a masked secret and
provide controlled update actions. - The agent receives only the
credential needed for the current execution. - Do not include secrets in
generated reports or error messages. - Allow the user to select an
account for a test run or define an account requirement for a test case.

### FR-009 --- Test Run Creation

A test run contains: - Run name. - Project. - Environment. - Execution
method. - Scope. - Selected modules/features or selected test cases. -
Selected test account/profile, where applicable. - Description/release
note. - Created time and creator (local user).

Initial example:

  Field            Value
  ---------------- ----------------------------------
  Run name         Regression - November 2026
  Project          Wavy Chatbot
  Environment      Development
  Method           AI Browser Agent
  Scope            Selected Modules
  Execution        Batch, sequential, AI-controlled
  Failure policy   Continue to next test case
  Storage          Local computer

Scope options: - All active test cases. - Selected modules/features. -
Selected test cases. - Failed test cases from a previous run.

When the scope is selected, show the exact test cases included before
the run starts. The user must be able to remove individual cases from
the proposed queue.

### FR-010 --- Test Run Snapshot

When a test run is created, snapshot: - Test case title and ID. -
Preconditions. - Steps and expected results. - Requirement links. - Test
data references (not secret values). - Environment name and resolved
base URL. - Execution method and relevant configuration.

Historical run results must remain reproducible even after the source
test case or project configuration changes.

### FR-011 --- Pre-Execution Readiness Check

Before starting, check: - Local execution bridge is running and
healthy. - Claude in Chrome / supported browser connection is
available. - Correct Chrome profile/session is selected. - Target
environment URL is reachable. - Required test account reference
exists. - Required secrets are available without exposing them. -
Selected test cases have sufficient steps and expected results. -
Evidence directory is writable. - No conflicting run is using the same
browser session.

Show readiness as: - Ready. - Warning. - Blocked.

The user must see the reason for every warning or blocked item. Do not
start a batch if a critical dependency is blocked.

**Important integration constraint:** do not assume a web application
can directly control a personal Chrome extension. Implement a local
execution bridge only through a documented and supported Claude/Chrome
integration. Validate this with a technical proof-of-concept before
committing to the final connector architecture. If the selected
integration cannot support programmatic orchestration, provide a clearly
defined assisted/manual handoff rather than pretending it is automated.

### FR-012 --- Batch Execution Orchestration

Execution behavior: 1. Execute test cases sequentially in a single
browser session by default. 2. Send one bounded test case instruction at
a time. 3. Confirm preconditions before executing steps. 4. Execute
steps in order. 5. Validate each expected result using observable
evidence. 6. Save result and evidence before moving to the next case. 7.
On application FAIL, record the failure and continue to the next case.
8. On executor ERROR, apply a bounded retry policy (default maximum one
retry for recoverable technical errors). 9. On BLOCKED or NEEDS_REVIEW,
record the reason and continue when safe. 10. Stop only when the user
requests Stop, a critical safety condition occurs, or the
browser/session becomes unusable.

Provide controls: - Start. - Pause. - Resume. - Stop. - Re-run failed
cases. - Re-run selected cases.

Pause must prevent the next test case from starting. Stop must stop
scheduling new cases and attempt to end the current operation safely.

### FR-013 --- AI Browser Agent Instructions

For every test case, construct an execution instruction containing: -
Project and environment. - Target base URL. - Test case ID and title. -
Preconditions. - Ordered steps. - Expected results and verification
criteria. - Allowed actions. - Prohibited actions. - Evidence
requirements. - Failure and uncertainty handling.

Agent rules: - Do not invent results. - Do not claim PASS without
checking expected results. - Do not change unrelated data. - Do not
perform destructive actions unless explicitly authorized by the test
case and run configuration. - Do not bypass authentication, CAPTCHA,
access controls, or security protections. - Do not expose credentials in
screenshots, logs, or reports. - Report ambiguity rather than
guessing. - Distinguish product behavior from browser/agent failure.

### FR-014 --- Execution Result and Status Model

Supported statuses:

  -----------------------------------------------------------------------
  Status                              Meaning
  ----------------------------------- -----------------------------------
  PASS                                Expected behavior verified with
                                      sufficient evidence

  FAIL                                Application behavior contradicts
                                      the expected result

  BLOCKED                             Preconditions, access, or
                                      dependency prevent execution

  ERROR                               Browser, bridge, network, or
                                      executor technical failure

  SKIPPED                             Deliberately not executed

  NEEDS_REVIEW                        Evidence or behavior is ambiguous
                                      and requires QA judgment
  -----------------------------------------------------------------------

Do not collapse ERROR into FAIL.

Each result stores: - Test run and test case snapshot IDs. - Status. -
Actual result. - Execution start/end timestamps. - Duration. - Agent
summary. - Step-level observations. - Evidence references. - Error
category and diagnostic information, if applicable. - Retry count.

### FR-015 --- Evidence and Local Storage

Required evidence: - At least one screenshot for each executed test
case. - Execution log for each test case. - Additional screenshot(s)
when a case fails.

Evidence metadata: - File path relative to the workspace. - Type. -
Timestamp. - Related test run. - Related test case execution. - Optional
step number. - Optional description.

Requirements: - Store evidence locally. - Keep secrets and sensitive
fields masked. - Avoid taking screenshots of credential entry unless
values are safely masked. - Show missing or failed evidence capture as
an execution warning/error. - Evidence files must not be overwritten by
a later run. - Provide an evidence viewer and open-folder action.

### FR-016 --- Defect Management

The user can create a defect from a FAIL or NEEDS_REVIEW result.

Defect fields: - Defect ID. - Title. - Project. - Environment. - Related
test case and test run. - Severity. - Priority. - Steps to reproduce. -
Expected result. - Actual result. - Evidence. - Status (Open, In
Progress, Fixed, Retest, Closed, Rejected).

AI may propose a defect title and description, but QA must approve the
defect. Do not automatically classify every failed test as a confirmed
product bug.

### FR-017 --- Dashboard and Reporting

Project dashboard: - Total active test cases. - Total requirements. -
Requirement coverage. - Recent test runs. - Latest
pass/fail/blocked/error counts. - Open defects. - Automation readiness.

Test run report: - Total selected cases. - Executed, passed, failed,
blocked, errored, skipped, needs review. - Pass rate with a clearly
defined denominator. - Start/end time and duration. - Results by
module/feature. - Failed case list. - Evidence links. - Defect links.

Do not calculate pass rate by silently counting BLOCKED, ERROR, or
SKIPPED as PASS.

### FR-018 --- Locator Discovery (MVP foundation / early follow-up)

The system should support capturing candidate browser locators
discovered during AI-assisted browser inspection, subject to what the
supported integration exposes.

Locator record: - Locator ID. - Project. - Page/route. -
Module/feature. - Element description. - Locator strategy. - Locator
expression/value. - Source attributes (role, accessible name, label,
placeholder, test ID, CSS, etc.). - Match count. - Visibility result. -
Last verified timestamp. - Status: Verified, Needs Review, Broken. -
Notes and version history.

Locator validation must establish that the locator identifies the
intended element. A match count of one is useful but is not, by itself,
proof that the locator targets the correct control.

Recommended locator preference: 1. `getByTestId()` 2. `getByRole()` 3.
`getByLabel()` 4. `getByPlaceholder()` 5. `getByText()` 6. CSS locator
7. XPath only as a last resort

Prefer accessible, user-facing locators and stable test IDs. Avoid
brittle selectors based on generated class names, DOM depth, or
positional indexes unless no better option exists.

------------------------------------------------------------------------

## 5. Playwright Automation --- Future Phase

### 5.1 Goal

Convert reviewed and stable test cases into repeatable Playwright tests.
AI may propose scripts and locators, but QA must review and approve them
before they become part of the regression suite.

### 5.2 Proposed lifecycle

``` text
AI Browser Execution
        |
        v
Review actual steps and evidence
        |
        v
Inspect page and discover locator candidates
        |
        v
Validate locators
        |
        v
Generate Playwright script
        |
        v
QA reviews and edits script
        |
        v
Run script locally
        |
        v
Approve for regression
        |
        v
Commit to Git repository (future)
```

### 5.3 Script requirements

-   Use Playwright Test.
-   Use reusable page objects or fixtures where appropriate.
-   Keep test data and secrets outside source code.
-   Use environment variables or secure secret injection.
-   Use explicit assertions for expected results.
-   Capture screenshots on failure and optionally on each test.
-   Save traces/logs when configured.
-   Avoid fixed sleeps where a condition-based wait is possible.
-   Keep scripts readable and traceable to test case IDs.
-   Include script version and linked test case ID.
-   Do not auto-commit or push generated scripts without explicit user
    approval.

### 5.4 Example (illustrative only)

``` ts
import { test, expect } from '@playwright/test';

test('WAVY-AUTH-001 - Valid login', async ({ page }) => {
  await page.goto(process.env.BASE_URL!);

  await page.getByLabel('Username').fill(
    process.env.TEST_USERNAME!
  );

  await page.getByLabel('Password').fill(
    process.env.TEST_PASSWORD!
  );

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/dashboard/);
});
```

The example is illustrative. Actual locators and assertions must be
discovered and validated against the real Wavy Chatbot UI.

------------------------------------------------------------------------

## 6. Non-Functional Requirements

### NFR-001 --- Local-first privacy

Project data and evidence remain on the user's computer in MVP. Clearly
disclose any data sent to an external AI provider as part of
browser-agent operation.

### NFR-002 --- Security

-   Protect secrets using OS keychain or encrypted local storage.
-   Never write passwords/tokens to logs.
-   Validate file uploads and paths.
-   Restrict the local execution bridge to trusted local origins and
    authenticated requests.
-   Do not expose an unauthenticated local control endpoint to the
    network.
-   Require explicit approval for destructive or production actions.

### NFR-003 --- Reliability

-   Persist run state and results incrementally.
-   Recover gracefully after application restart.
-   Mark interrupted runs as Interrupted rather than silently
    successful.
-   Do not lose completed test results if a later test case crashes.
-   Make execution actions idempotent where practical.

### NFR-004 --- Performance

-   Paginate large test case and execution history lists.
-   Load screenshots on demand.
-   Avoid loading all evidence files into memory.
-   Provide progress updates without blocking the UI.

### NFR-005 --- Maintainability

-   Separate UI, domain logic, database access, and browser integration.
-   Keep execution adapters replaceable.
-   Keep project-specific test definitions out of core application code.
-   Include database migrations and backup/restore capability.

### NFR-006 --- Accessibility and usability

-   Keyboard-accessible navigation and controls.
-   Clear focus states and readable contrast.
-   Consistent status labels and icons.
-   Responsive layout for desktop-first use.
-   Avoid unnecessary animation and visual clutter.

------------------------------------------------------------------------

## 7. Suggested Technical Architecture

### 7.1 MVP stack

  -----------------------------------------------------------------------
  Layer                               Suggested technology
  ----------------------------------- -----------------------------------
  Frontend                            Next.js + TypeScript

  UI                                  Tailwind CSS + accessible component
                                      primitives

  Backend                             Next.js server routes or a separate
                                      local Node.js service

  Database                            SQLite

  ORM / migrations                    Prisma or Drizzle (choose one)

  Local evidence                      Workspace file storage

  Secrets                             OS keychain / encrypted local
                                      secret store

  AI browser execution                Supported Claude in Chrome / Claude
                                      Code integration via local bridge

  Future automation                   Playwright Test

  Future version control              GitHub

  Future CI                           GitHub Actions

  Future container                    Docker
  -----------------------------------------------------------------------

Do not add PostgreSQL, Docker, GitHub, queues, or microservices to MVP
unless a demonstrated requirement needs them. Keep the initial
architecture modular without overengineering.

### 7.2 Logical components

``` text
QA Workspace UI
      |
      v
Application / Domain Services
      |
      +------ SQLite Repository
      |
      +------ Local Evidence Manager
      |
      +------ Secret Store Adapter
      |
      +------ Test Run Orchestrator
                    |
                    v
              Executor Adapter
                    |
          +---------+----------+
          |                    |
   Claude Browser Bridge   Future Playwright
          |
          v
     Chrome Session
```

### 7.3 Local execution bridge

The bridge is a critical technical spike, not an assumed capability.

Before implementing the full execution system: 1. Review the current
official Claude in Chrome / Claude Code integration documentation. 2.
Determine what supported interface can receive tasks and return
structured results. 3. Verify whether the integration can be initiated
from a local application. 4. Verify how the active Chrome
profile/session is selected. 5. Verify how screenshots and browser
observations can be returned. 6. Verify how user approval or browser
handoff is represented. 7. Document limitations and failure modes.

If no supported programmatic interface exists for the desired workflow,
implement an assisted mode where the QA app prepares the task and the
user hands it to the supported Claude interface. Do not reverse-engineer
private extension APIs or claim full automation without proof.

------------------------------------------------------------------------

## 8. Proposed Data Model

Core entities:

  Entity                Purpose
  --------------------- --------------------------------------------
  Project               Project workspace
  Environment           Environment URL and settings
  PRDDocument           Source document and version
  Requirement           Extracted or manually authored requirement
  Module                Project module
  Feature               Child of module
  TestCase              Reusable test scenario
  TestStep              Ordered test action/check
  TestCaseRequirement   Many-to-many traceability
  TestAccount           Account alias and role metadata
  SecretReference       Reference to secure credential storage
  TestRun               Execution session
  TestRunCase           Immutable test case snapshot in a run
  ExecutionStep         Actual step-level observations
  TestResult            Final result for a test run case
  Evidence              Screenshot/log file metadata
  Defect                QA defect record
  Locator               Candidate or verified browser locator
  AutomationScript      Future Playwright script metadata

Important relationships: - Project has many environments, modules, PRDs,
requirements, test cases, and test runs. - Module has many features. -
Feature has many test cases. - Requirement and test case have a
many-to-many relationship. - Test run has many test run cases. - Test
run case stores a snapshot of the source test case. - Test run case has
execution steps, one final result, and many evidence records. - Defects
link to relevant results. - Automation scripts link to source test cases
and versions.

------------------------------------------------------------------------

## 9. UX / UI Design Direction --- Strict Anti-AI-Slop Brief

The product must look and feel like a credible professional QA tool, not
a generic AI-generated SaaS dashboard.

### 9.1 Required design skills

The development environment has the following UI skills available.
Before designing or coding the interface, inspect the installed skill
list and read the relevant skill instructions. Use these skills
intentionally:

-   `anti-ui-slop` --- primary design quality gate; avoid generic
    AI-generated layouts and visual clichés.
-   `ui-ux-pro-max` --- UX structure, interaction patterns, visual
    hierarchy, and design system guidance.
-   `qa-plan` --- use for planning QA workflows and testability where
    relevant.
-   `qa-code-review` --- use when reviewing implementation quality.
-   `micro-interaction` --- use sparingly for meaningful state feedback.
-   `glassmorphism` --- optional; use only if it genuinely improves the
    design. Do not apply glass effects everywhere.
-   `gsap-web`, `ascii-animation`, `particle-system`, `shader-glsl`,
    `threejs-animation` --- not required for this product's MVP. Do not
    use decorative animation or WebGL effects unless a clear functional
    reason exists.

If the skills are available through Claude Code, invoke/read them using
the environment's supported skill mechanism. Do not merely mention their
names in code comments. If a skill cannot be found or loaded, report
that limitation and proceed using the design constraints below.

### 9.2 Visual direction

Design a restrained, information-dense professional QA workspace.

Preferred characteristics: - Desktop-first application. - Strong
information hierarchy. - Neutral, low-noise surfaces. - One restrained
accent color. - Clear typography and consistent spacing. - Compact
tables with excellent scanability. - Functional status colors used
consistently. - Clear empty, loading, error, disabled, and success
states. - Practical side navigation and project context. - Strong focus
on execution progress, test results, and evidence.

Avoid: - Generic SaaS landing-page appearance. - Excessive gradients. -
Glassmorphism on every card. - Huge hero headings inside operational
screens. - Unnecessary charts. - Decorative blobs, particles, glowing
borders, and floating shapes. - Excessive rounded cards and nested
containers. - Emoji used as primary navigation icons. - Fake data
presented as real project data. - Buttons that do nothing. - Placeholder
interactions that look implemented. - Overly large whitespace that hides
useful QA information.

### 9.3 UX requirements

-   Optimize common QA tasks for minimal clicks.
-   Make project and environment context persistently visible.
-   Show destructive actions with confirmation.
-   Use tables for structured test case and execution data.
-   Provide search, filtering, sorting, and bulk selection where useful.
-   Keep test run status and current executor state visible.
-   Show evidence close to the result it supports.
-   Make errors actionable and explain what the user can do next.
-   Use progressive disclosure for advanced settings.
-   Do not add animation unless it communicates a meaningful state
    change.
-   Respect reduced-motion preferences.

### 9.4 UI implementation process

1.  Read `anti-ui-slop` and `ui-ux-pro-max` skills before
    implementation.
2.  Define design tokens and component conventions.
3.  Build the application shell and navigation.
4.  Build one complete workflow at a time.
5.  Validate responsive behavior and accessibility.
6.  Review every screen against the anti-AI-slop criteria.
7.  Remove visual elements that do not improve comprehension or task
    completion.

Do not create every screen as a static mockup. Implement functional
workflows backed by real local data.

------------------------------------------------------------------------

## 10. Key Screens

### Screen 1 --- Workspace Dashboard

-   Project list and recent activity.
-   Recent test runs.
-   Quick action to create project or test run.
-   No fabricated analytics when there is no data.

### Screen 2 --- Project Overview

-   Project name and environment selector.
-   Test case and requirement counts.
-   Latest test run.
-   Open defects.
-   Recent activity.

### Screen 3 --- PRD Repository

-   Document list.
-   Upload and version controls.
-   Parsing status.
-   Extracted requirement review.
-   Source preview and reference location.

### Screen 4 --- Requirement Detail

-   Requirement description.
-   Acceptance criteria.
-   Source PRD and version.
-   Linked test cases.
-   Coverage status.
-   Ambiguity/clarification notes.

### Screen 5 --- Test Case Repository

-   Filter by module, feature, priority, type, status, and automation
    state.
-   Table/list view.
-   Create/edit test case.
-   Ordered test steps.
-   Requirement links.
-   Version history.

### Screen 6 --- Create Test Run

-   Run name.
-   Project and environment.
-   Execution method.
-   Scope selection.
-   Module/test case selection.
-   Test account selection.
-   Pre-run summary and readiness check.

### Screen 7 --- Execution Monitor

-   Run progress.
-   Current test case and step.
-   Queue of pending cases.
-   PASS/FAIL/BLOCKED/ERROR counts.
-   Browser connection state.
-   Pause, resume, and stop controls.
-   Live log and evidence preview.

### Screen 8 --- Test Run Report

-   Final summary.
-   Results grouped by module.
-   Failed and blocked cases.
-   Evidence viewer.
-   Defect creation.
-   Re-run failed cases.

### Screen 9 --- Locator Repository (incremental)

-   Page/feature grouping.
-   Locator strategy and expression.
-   Match count and validation status.
-   Last verified date.
-   Review/replace locator workflow.

------------------------------------------------------------------------

## 11. Initial Wavy Chatbot Test Run Configuration

Use this as the initial example configuration. Do not invent real URLs,
modules, credentials, or test cases.

  -----------------------------------------------------------------------
  Field                               Initial value
  ----------------------------------- -----------------------------------
  Project                             Wavy Chatbot

  Run name                            Regression - November 2026

  Environment                         Development

  Execution method                    AI Browser Agent

  Scope                               Selected Modules

  Execution mode                      Batch, sequential

  Login                               AI login using securely stored test
                                      credentials

  Evidence                            Screenshot per test case, execution
                                      log, screenshot on FAIL

  Failure policy                      Continue to next test case

  Storage                             Local computer
  -----------------------------------------------------------------------

Module names and case counts must come from the actual project
repository. If the repository is empty, show an empty state and guide
the user to import/create test cases.

------------------------------------------------------------------------

## 12. MVP Acceptance Test Scenarios

The implementation is not complete until these scenarios pass:

1.  Create a project and configure a Development environment.
2.  Upload a PRD and retain the original file.
3.  Extract draft requirements and review/edit them.
4.  Create a module and feature.
5.  Create a test case with multiple steps and expected results.
6.  Link a test case to one or more requirements.
7.  Create a test run for selected modules.
8.  Verify the selected test case list and snapshots before execution.
9.  Run pre-execution readiness checks.
10. Start a batch and execute cases sequentially.
11. Record a PASS with evidence.
12. Record a FAIL with screenshot and log, then continue to the next
    case.
13. Record an ERROR without misclassifying it as an application defect.
14. Pause and resume a run.
15. Stop a run without losing completed results.
16. Restart the application and inspect prior runs and evidence.
17. Re-run only failed test cases.
18. Confirm that secrets do not appear in logs, screenshots, or reports.
19. Edit a source test case and verify that previous run snapshots
    remain unchanged.
20. Verify that unavailable Claude integration is shown as
    unavailable/assisted mode, not falsely shown as connected.

------------------------------------------------------------------------

## 13. Delivery Plan

### Phase 0 --- Technical feasibility spike

-   Verify supported Claude in Chrome / Claude Code integration.
-   Prototype local handoff and result capture.
-   Verify Chrome profile/session behavior.
-   Verify screenshot and log retrieval.
-   Document limitations.
-   Decide the executor adapter contract.

**Exit criterion:** a real, repeatable proof-of-concept or a clearly
documented assisted-mode fallback.

### Phase 1 --- QA management foundation

-   Workspace and projects.
-   Environment management.
-   PRD repository.
-   Requirement management.
-   Modules/features.
-   Test case repository.
-   Traceability.
-   Local database and backup.

### Phase 2 --- Test Run engine

-   Test run creation.
-   Test case snapshots.
-   Batch queue.
-   Execution state machine.
-   Local evidence manager.
-   Result and report views.
-   Re-run failed cases.

### Phase 3 --- AI browser execution

-   Local executor bridge.
-   Credential handoff.
-   Claude instruction builder.
-   Sequential execution.
-   Structured result parsing.
-   Screenshot and log capture.
-   Error handling and human handoff.

### Phase 4 --- Locator and Playwright preparation

-   Locator discovery.
-   Locator validation.
-   Locator repository.
-   Playwright code generation.
-   Script review and approval.

### Phase 5 --- Regression infrastructure

-   Git integration.
-   Docker execution.
-   CI/CD.
-   Scheduled regression.
-   Historical comparisons.

------------------------------------------------------------------------

## 14. Instructions to the AI Coding Agent

You are acting as a senior product engineer, QA automation architect,
and product UI/UX engineer.

Build the application described in this PRD. Do not jump directly into
coding without first inspecting the existing repository and installed
skills.

### Mandatory first actions

1.  Inspect the current repository structure and identify the existing
    framework, dependencies, and conventions.
2.  Inspect available skills using the environment's supported skill
    discovery command.
3.  Read and apply `anti-ui-slop` and `ui-ux-pro-max` before designing
    the UI.
4.  Read `qa-plan` when planning the QA workflow and `qa-code-review`
    when reviewing the implementation.
5.  Report which skills were successfully loaded. Never claim a skill
    was used if it was not actually read.
6.  Identify the best implementation approach based on the existing
    repository. Do not replace a working stack without a clear reason.
7.  Create an implementation plan with milestones and acceptance
    criteria.
8.  Identify the Claude in Chrome integration feasibility risks before
    implementing a fake or speculative connection.

### Implementation rules

-   Build a working application, not just a landing page or static
    mockup.
-   Use TypeScript and clear domain boundaries where appropriate.
-   Keep UI, business logic, persistence, and browser execution adapters
    separate.
-   Use real local persistence.
-   Add database migrations.
-   Add validation and useful error states.
-   Add tests for critical domain logic and workflows.
-   Do not fabricate project data, browser status, execution results, or
    evidence.
-   Do not use hard-coded fake PASS results.
-   Do not expose secrets.
-   Do not silently ignore failed operations.
-   Do not implement non-functional buttons.
-   Do not overengineer with microservices or cloud infrastructure for
    this local MVP.
-   Do not add Playwright automation before the test run and locator
    foundations are ready.
-   Do not claim Claude in Chrome integration works until it has been
    demonstrated in the actual environment.

### UI quality gate

Before marking a screen complete: - Compare it against `anti-ui-slop`
guidance. - Verify hierarchy, density, spacing, typography, and
interaction clarity. - Remove decorative elements without a functional
purpose. - Check empty, loading, success, warning, and error states. -
Ensure all visible controls perform their stated actions. - Ensure the
interface looks like a purpose-built QA tool rather than a generic
AI-generated dashboard.

### Working method

Work incrementally: 1. Inspect and report. 2. Propose architecture and
implementation plan. 3. Implement the smallest complete vertical slice.
4. Run tests and type checks. 5. Review UI and code. 6. Report completed
work, limitations, and next steps.

Do not attempt to implement every phase in one pass. Start with Phase 0
feasibility and Phase 1 foundation. Ask for clarification only when a
missing decision blocks implementation; otherwise choose a conservative,
reversible default and document it.

------------------------------------------------------------------------

## 15. Open Decisions

The following items need confirmation during implementation: - Exact
Wavy Chatbot Development URL. - Actual module and feature inventory. -
Actual test case import format and existing test case source. -
Supported Claude in Chrome orchestration method in the installed
environment. - Preferred local secret store for the user's operating
system. - Whether PRD parsing should be fully local or may send document
content to an external AI provider. - Whether screenshots should be
retained indefinitely or subject to configurable cleanup.

Do not guess these values. Keep them configurable and document
unresolved decisions.

------------------------------------------------------------------------

**End of PRD**
