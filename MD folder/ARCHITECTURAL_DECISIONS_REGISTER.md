# Architectural Decisions Register (ADR)
## Student Skill Intelligence Platform (SSIP)

**Document Version:** 1.1  
**Status:** Active Working Register (Pre-Phase 1 Baseline)  
**Last Updated:** November 2026  
**Purpose:** Formal record of open architectural decisions, provisional MVP assumptions, institutional owners, impact analysis, and required freeze milestones.

---

## 1. Register Overview & Governance Principles

The Student Skill Intelligence Platform (SSIP) operates on a strict separation between:
1. **Institutionally Approved Architecture:** Permanent architectural requirements (e.g., stateless ephemeral processing of student assessment data, modular monolith, Jeppiaar University baseline structure, 3-level proficiency model for MVP).
2. **Provisional MVP Assumptions:** Working engineering decisions adopted to unblock development without pre-empting institutional authority. Every provisional assumption must be documented with an exit/replacement strategy so that institutional policy changes do not require codebase rewrites.

---

## 2. Decision Register Matrix

| ADR ID | Decision Title | Status | Current MVP Provisional Assumption | Institutional Decision Owner | Architectural Impact | Decision Deadline / Freeze Point | Replacement / Migration Strategy |
|:---:|---|:---:|---|---|---|:---:|---|
| **ADR-001** | Student Identity & Identifier Resolution | **Provisional** | Treat uploaded/submitted student IDs as session-scoped ephemeral references (`session_student_ref`). Do not persist into relational database. Use a server-held secret key for HMAC. | Dean of Academic Affairs / Registrar | Affects upload validation schema, duplicate detection, and cross-session record linking. | **Phase 3** (Before Ingestion Engine lock) | If institutional roll numbers are approved, swap session hashing with an encrypted pseudonymization filter prior to processing. |
| **ADR-002** | Governance Proposal Persistence & Audit Scope | **Provisional** | Proposals and Dean decisions are ephemeral and stored strictly within the active session cache. They expire with the session. | Dean & Heads of Departments (HOD Council) | Affects database schema, audit logging, retention compliance, and proposal history views. | **Phase 7** (Before Governance implementation) | If permanent proposal audit is mandated, introduce an isolated `governance_records` table with anonymized aggregate metrics only (no student records). |
| **ADR-003** | Platform Authentication & User Provisioning | **Provisional** | Application-managed JWT authentication with securely provisioned credentials for Dean and HOD accounts. | University IT Director / Systems Admin | Affects login UI, session security, password rotation, and SSO middleware. | **Phase 2** (Before Auth Module implementation) | If SAML 2.0 / OAuth2 / LDAP is mandated, replace the local auth router with an institutional identity provider adapter; retain RBAC claims. |
| **ADR-004** | Export Package Retention Lifespan | **Provisional** | Server-side export files expire concurrently with their parent session or after a strict 24-hour TTL, whichever comes first. | Dean / Compliance Officer | Affects disk storage, download link validation, and cleanup background tasks. | **Phase 7** (Before Export implementation) | If extended offline archive retention is required, move export packages to an encrypted, isolated object store with time-bounded presigned URLs. |
| **ADR-005** | Complete Archive Security & Original Upload Inclusion | **Provisional** | Generate standard ZIP packages containing manifest, reports, and analytical JSON. Exclude original uploads and student PII by default. | University Information Security Officer | Affects export worker pipeline, privacy compliance, and storage. | **Phase 7** (Before Export implementation) | If raw original file export is required, implement a separately authorized export mode with explicit audit logs and separate retention rules. |
| **ADR-006** | Duplicate Submission & Revision Policy | **Provisional** | Within a single upload batch: flag duplicate student IDs as validation warnings and retain the latest row. In student web forms: reject duplicate submissions for an active session. | HODs & Examination Office | Affects ingestion validation engine, error reporting, and row rejection statistics. | **Phase 3** (Before Ingestion validation lock) | Ingestion validation rules are parameterized via `DUPLICATE_SUBMISSION_POLICY` enum (`REJECT_ALL`, `OVERWRITE_LATEST`, `VERSION_HISTORY`). |
| **ADR-007** | Proficiency Scale Extension Approval | **Provisional** | Strictly lock the MVP to three tiers: **Beginner**, **Intermediate**, and **Expert**. Defer the 5-tier extension. | Academic Council / Curriculum Committee | Affects proficiency calculations, UI charts, and export templates. | **Phase 4** (Before Analytics Engine lock) | Internal proficiency calculation services will use an abstracted scale mapper (`ProficiencyLevelMapper`) allowing future configuration without refactoring math formulas. |
| **ADR-008** | Academic Benchmark Ownership & Baseline Approval | **Provisional** | Programme-to-skill benchmarks are seeded as `DRAFT`. Require an explicit approval action before the analysis engine can use them. | Academic Council & Board of Studies | Affects gap score calculations, recommendation triggering, and institutional comparisons. | **Phase 4** (Before Gap Engine implementation) | Store benchmarks with explicit `version_id`, `approved_by`, and `effective_date`. Engine reads only approved version snapshots. |

---

## 3. Detailed Decision Records

### ADR-001: Student Identity & Identifier Resolution
* **Context:** The university uses institutional student roll numbers (e.g., `21CS001`). If raw roll numbers are stored, the platform violates the zero-retention privacy constraint. Furthermore, using a public session identifier or public salt as an HMAC key is vulnerable to offline dictionary/guessing attacks.
* **Provisional Rule for MVP:**
  1. The ingestion pipeline accepts `student_identifier` in CSV/Excel.
  2. Each assessment session generates a cryptographically strong, 256-bit random secret (`session_hmac_secret`) via CSPRNG during creation. This secret is held exclusively on the server in volatile memory/Redis and is **strictly separated from the public session ID**.
  3. The ingestion validator immediately computes:
     $$\text{session\_student\_ref} = \text{HMAC-SHA256}_{K = \text{session\_hmac\_secret}}(\text{student\_identifier})$$
  4. The raw roll number is discarded from working memory immediately after validation summary generation.
  5. Only `session_student_ref` is utilized during analytical aggregation. When the session is cleaned, `session_hmac_secret` is permanently destroyed.
* **Decision Deadline:** Must be confirmed before beginning `TASK-03-03` (Phase 3).

---

### ADR-002: Governance Proposal Persistence & Audit Scope
* **Context:** Heads of Departments (HODs) can propose student development initiatives (workshops/bootcamps) based on skill gap findings, which the Dean reviews.
* **Architectural Clarification on Lifecycles:**
  1. **Session Expiry:** When a session reaches its expiration timestamp, active proposal and decision data becomes immediately unavailable via the API and UI.
  2. **Session Cleanup:** During the subsequent cleanup pass, all temporary proposal and decision records in the session cache are physically erased.
  3. **Downloaded Reports:** Copies of analytical reports or proposals already downloaded by authorized users prior to session expiry exist offline and are outside server deletion control.
* **Provisional Rule for MVP:**
  - Proposals and Dean decisions are ephemeral and stored strictly in the session cache.
  - Proposals reference aggregate department metrics and event types; they **never reference individual student identifiers**.
  - Users must preserve approved proposals prior to session expiration by downloading formal PDF/Excel reports. The UI and documentation must clearly communicate that server records expire with the session.
* **Decision Deadline:** Must be confirmed before beginning `TASK-07-01` (Phase 7).

---

### ADR-003: Platform Authentication & Credential Management
* **Context:** Integrating institutional Active Directory / LDAP / OAuth requires infrastructure whitelisting and network configurations outside the immediate sandbox scope.
* **Provisional Rule for MVP:**
  1. Backend provides standalone JWT authentication.
  2. Initial administrative, Dean, and HOD credentials are provisioned via secure command-line seed script (`scripts/seed_accounts.py`) generating cryptographically random initial passwords.
  3. Passwords hashed using Argon2id / bcrypt with individual salts.
  4. Passwords are never hardcoded in source control.
  5. Users must change their password upon initial login (`must_change_password=True`).
* **Decision Deadline:** Must be confirmed before beginning `TASK-02-05` (Phase 2).

---

### ADR-004: Export Retention Lifespan
* **Context:** Generated analytical reports (Excel, CSV, PDF, ZIP) reside on the backend filesystem while awaiting download.
* **Provisional Rule for MVP:**
  1. Export files are stored in a protected temporary filesystem directory (`/tmp/ssip_exports/` or OS equivalent).
  2. Download links use cryptographically random single-use tokens with a maximum TTL of 24 hours.
  3. When an assessment session enters `Cleaning` state, all associated export files are immediately unlinked from disk.
* **Decision Deadline:** Must be confirmed before beginning `TASK-07-04` (Phase 7).

---

### ADR-005: Complete Archive Security & Original Upload Inclusion
* **Context:** Earlier export concepts mentioned packaging raw uploaded datasets. However, raw upload files contain student personal identifiers, which directly conflicts with the zero-retention privacy policy and the anonymized export model.
* **Provisional Rule for MVP:**
  1. Complete Analysis Packages (.zip) generated by default **strictly exclude original uploaded files** and raw student identifiers.
  2. The default ZIP contains only:
     - `manifest.json` (SHA-256 file hashes, session metadata, export timestamp)
     - `analysis_summary.json` (anonymized cohort statistics)
     - `department_analysis.csv`
     - `skill_gaps.csv`
     - `recommendations.csv`
     - `executive_report.pdf`
  3. Any packaging of original uploaded files is treated as a separate, highly privileged export mode requiring explicit administrative authorization, separate audit logging, and custom retention limits.
* **Decision Deadline:** Must be confirmed before beginning `TASK-07-07` (Phase 7).

---

### ADR-006: Duplicate Submission & Revision Policy
* **Context:** Students or upload files may submit duplicate entries for the same student-skill pair.
* **Provisional Rule for MVP:**
  1. **Batch Upload:** If multiple rows contain identical `(student_identifier, skill_name)`:
     - The validation pipeline emits a `VALIDATION_WARNING`.
     - The engine keeps the last encountered row by default.
  2. **Student Web Form:** If an active session receives a submission with an existing `student_identifier`:
     - Submission is rejected with an informative message (`"Submission already received for this session"`), preventing unintended overwrites.
* **Decision Deadline:** Must be confirmed before beginning `TASK-03-04` (Phase 3).

---

### ADR-007: Proficiency Scale Lock
* **Context:** `PROFICIENCY_FRAMEWORK.md` outlines both a 3-tier model (Beginner, Intermediate, Expert) and a theoretical 5-tier extension (adding Elementary and Advanced).
* **Provisional Rule for MVP:**
  1. MVP is locked exclusively to 3 tiers:
     - Tier 1: **Beginner** (Foundational awareness / guided practice)
     - Tier 2: **Intermediate** (Independent practical application)
     - Tier 3: **Expert** (Advanced proficiency / complex execution)
  2. Internal calculations map these to numeric values: $\{ \text{Beginner: 1.0, Intermediate: 2.0, Expert: 3.0} \}$.
* **Decision Deadline:** Frozen for MVP. Reassessment deferred to post-MVP roadmap.

---

### ADR-008: Academic Benchmark Ownership & Baseline Approval
* **Context:** Gap calculations compare actual cohort proficiency against target benchmarks. Seeding candidate benchmarks from programme mappings does not make them institutionally approved.
* **Provisional Rule for MVP:**
  1. Seeded candidate benchmarks derived from `DEPARTMENT_SKILL_MAPPING.md` are tagged with status **`DRAFT`**.
  2. The Skill Gap Analysis Engine will **only** compute gap metrics against benchmarks that have been transitioned to **`APPROVED`** by an authorized Dean or Academic Council sign-off.
  3. If a department or programme has only `DRAFT` benchmarks, the analytics view flags the status as `"Benchmark Pending Approval"` and suppresses gap scoring to prevent misleading metrics.
  4. Every benchmark record maintains `version_number`, `approved_by`, and `approved_at` timestamps.
* **Decision Deadline:** Must be confirmed before beginning `TASK-04-03` (Phase 4).

---

## 4. Zero-Retention Comprehensive Boundary Checklist

Zero-retention cannot be achieved by Redis key expiration alone. The following technical boundaries are mandatory across all application layers:

- [ ] **Boundary 1 (Storage):** No student assessment records or roll numbers written to PostgreSQL.
- [ ] **Boundary 2 (Cache):** Ephemeral Redis keys have mandatory TTL; Redis persistence (AOF and RDB snapshots) disabled for temporary db instances.
- [ ] **Boundary 3 (Filesystem):** Uploaded multipart temporary files deleted immediately after parsing into ephemeral memory. Original upload files excluded from default export archives (ADR-005).
- [ ] **Boundary 4 (Logging):** Application logs, access logs, and exception tracebacks strictly sanitize/redact student identifiers, skill records, and payload bodies.
- [ ] **Boundary 5 (Telemetry & Errors):** Error monitoring (Sentry/custom) configured with PII scrubbers for request bodies.
- [ ] **Boundary 6 (Exports):** Generated server-side export files purged automatically upon session expiration or after 24h.
- [ ] **Boundary 7 (Browser):** The frontend stores only short-lived session authentication tokens or session IDs in `sessionStorage`. Raw student records and analytical datasets reside strictly in volatile component/store memory (React state) and are never written to `sessionStorage`, `localStorage`, or `IndexedDB`. All cached tokens are cleared on logout or session termination.
