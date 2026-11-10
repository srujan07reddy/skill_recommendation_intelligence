# Student Skill Intelligence Platform (SSIP) — About & Architecture Guide

**Document Version:** 1.0  
**Project:** Student Skill Intelligence Platform (SSIP)  
**Institution:** Jeppiaar University  
**Last Updated:** November 2026  

---

## 1. Executive Summary & Philosophy

The **Student Skill Intelligence Platform (SSIP)** is an institutional-grade, privacy-first decision support system designed for universities to assess, analyze, and bridge student competency gaps across academic departments.

Unlike conventional academic management systems, SSIP is built on an **Architectural Zero-Database Retention Policy** for student assessment submissions:
- **Zero Identifiable Data Persistence:** Raw student marks, registration numbers, and PII are never permanently written to database disks.
- **HMAC Pseudonymization (ADR-001):** Identifiers are cryptographically transformed in volatile memory using a server-held secret key into ephemeral tokens (`STU-<HEX>`).
- **Session-Scoped Lifecycle:** Analysis datasets, proposal drafts, and gap reports are bound to active academic sessions that automatically expire and purge from memory.
- **Hierarchical Institutional Governance:** Clear separation of academic authority among **Deans** (School-level governance), **Heads of Department (HODs)** (Department-level curriculum interventions), and **Administrators** (Platform & Taxonomy configuration).

---

## 2. Institutional Structure & Role Scope (Jeppiaar University)

Jeppiaar University operates across five constituent schools, each headed by **one Dean**. Departments report to their respective school:

```mermaid
graph TD
    Admin["University Administrator<br/>(Full University-Wide Visibility across all 5 Schools)"]
    
    Admin --> SCH1["School of Engineering & Technology (SCH-SET)<br/>Dean: dean"]
    Admin --> SCH2["School of Sciences & Allied Health (SCH-SSAHS)<br/>Dean: dean_ssahs"]
    Admin --> SCH3["School of Arts & Humanities (SCH-SAHM)"]
    Admin --> SCH4["School of Aviation (SCH-AVI)"]
    Admin --> SCH5["School of Physical Education & Sports (SCH-SPESS)"]
    
    SCH1 --> DEPT1["DEPT-CSE<br/>(Computer Science & Eng)<br/>HOD: hod_cse"]
    SCH1 --> DEPT2["DEPT-ECE<br/>(Electronics & Comm)"]
    SCH1 --> DEPT3["DEPT-BT<br/>(Biotechnology)"]
    
    SCH2 --> DEPT4["DEPT-CSAPPS<br/>(Computer Applications)"]
    SCH2 --> DEPT5["DEPT-AHS<br/>(Allied Health Sciences)"]
```

### The "One Dean Per School" Rule:
1. **Deans have School-Level Scoping:** A Dean (e.g., `dean` assigned to `SCH-SET`) sees **only** their assigned school and its constituent departments (`DEPT-CSE`, `DEPT-ECE`, `DEPT-BT`). They cannot view other schools or unauthorized departments.
2. **Administrators have Institutional Oversight:** Only the Administrator role has the global multi-school switcher to review university-wide aggregations.
3. **HODs have Departmental Scoping:** An HOD (e.g., `hod_cse`) is restricted strictly to their assigned department (`DEPT-CSE`).

---

## 3. Role-Based Access Control (RBAC) Matrix

| Feature / Module | Administrator | Dean | Head of Department (HOD) | Student / Candidate |
| :--- | :---: | :---: | :---: | :---: |
| **Multi-School University Overview** |  Full Access |  Denied (School only) |  Denied |  Denied |
| **School-Scoped Dashboard & Comparison** |  All Schools |  Assigned School |  Denied |  Denied |
| **Department Dashboard & Gap Analysis** |  View All |  School Depts |  Assigned Dept |  Denied |
| **Create & Activate Assessment Sessions** |  Platform-wide |  School Scope |  Assigned Dept |  Denied |
| **Bulk Dataset Ingestion (CSV / Excel)** |  Permitted |  School Scope |  Assigned Dept |  Denied |
| **Individual Student Assessment Data** |  All (Pseudonyms) |  School Depts |  Assigned Dept |  Own Token Only |
| **Export Individual Records to CSV** |  Permitted |  Permitted |  Permitted |  Denied |
| **Review Automated Recommendations** |  View Rules |  School Initiatives |  Assigned Dept |  Denied |
| **Draft & Submit Curricular Proposals** |  Denied |  Initiate Institutional |  Department Draft |  Denied |
| **Approve / Reject Curricular Proposals** |  Denied |  Authorized |  Denied |  Denied |
| **Benchmark Approval (DRAFT $\rightarrow$ APPROVED)** |  Authorized |  Review & Recommend |  View Only |  Denied |
| **Skill Taxonomy & Category Management** |  Full CRUD |  View Only |  View Only |  Denied |
| **Operational Health & Memory Telemetry** |  Full Access |  Denied |  Denied |  Denied |
| **Institutional Reports Export (PDF/XLSX/ZIP)** |  Permitted |  Permitted |  Department Only |  Denied |

---

## 4. Deep-Dive: Roles, Responsibilities & Features

### 4.1 Role 1: Administrator (`ROLE-001`)
*Technical and operational governance of the platform.*

- **Key Responsibilities:**
  - Maintain operational uptime, server health, and memory telemetry.
  - Manage user accounts, role bindings, and department/school assignments.
  - Maintain the official Skill Taxonomy (Categories, Domains, Relevance Weights).
  - Review and formally approve candidate benchmarks (**ADR-008**: transitioning seeded benchmarks from `DRAFT` to `APPROVED`).
  - Oversee automated session sweep cycles and volatile memory cleanup.
- **Key Features & UI Screens:**
  - **Overall Institutional Dashboard:** View aggregated KPIs across all 5 schools with an interactive School Filter selector.
  - **Skill Taxonomy Management:** Add, edit, and deactivate skill categories and domain definitions.
  - **Department & Academic Management:** Manage institutional hierarchy, school codes, and department mappings.
  - **Benchmark Approval Center:** Inspect baseline targets, evaluate candidate mappings, and mark benchmarks as approved for gap computations.
  - **Operational Monitoring & Audit Logs:** Live monitoring of active memory sessions, RAM consumption, rate-limiting violations, and security headers.

---

### 4.2 Role 2: Dean (`ROLE-002`)
*Institutional academic leadership and cross-departmental oversight for their assigned school.*

- **Key Responsibilities:**
  - Track holistic skill proficiency distributions across all departments within their school.
  - Identify inter-departmental competency gaps and duplicate skill remediation efforts.
  - Evaluate curricular intervention proposals submitted by HODs.
  - Approve, reject, request modifications, or defer departmental proposals.
  - Download official school-level accreditation reports and analysis dossiers.
- **Key Features & UI Screens:**
  - **School-Scoped Institutional Dashboard:** Real-time visual metrics scoped specifically to their school (e.g., School of Engineering & Technology).
  - **Department Comparison Matrix:** Side-by-side comparative analysis of departmental proficiencies (CSE vs. ECE vs. Biotech).
  - **Proposal Decision Console:** Governance review portal to approve or reject remediation plans with recorded justification comments.
  - **School Benchmark Review:** Review benchmark alignments across programs within their school.
  - **Individual Records Viewer:** Audit individual assessment records across their school's departments.
  - **Institutional Export Center:** Generate PDF executive summaries, XLSX audit workbooks, and ZIP packages.

---

### 4.3 Role 3: Head of Department / HOD (`ROLE-003`)
*Departmental curriculum optimization and localized student remediation.*

- **Key Responsibilities:**
  - Create and manage academic assessment sessions for their cohort.
  - Ingest student assessment results (via interactive web forms or bulk Excel/CSV upload).
  - Analyze departmental skill distributions and missing competency deficits against approved benchmarks.
  - Review algorithmic recommendations generated by the Recommendation Engine.
  - Formulate and submit formal curricular proposals (Bootcamps, Elective Overhauls, Industry Workshops) to the Dean.
  - Inspect individual student assessment outcomes for targeted academic advising.
- **Key Features & UI Screens:**
  - **Department Analytics Dashboard:** High-impact visualizations of departmental skill distributions (Beginner, Intermediate, Expert).
  - **Curriculum Gap Analysis Engine:** Automated delta calculation between student achievement and approved benchmarks, highlighting critical deficits.
  - **Actionable Recommendation Feed:** Algorithmic categorization into Bootcamps, Workshops, and Certification Tracks based on urgency.
  - **Governance Proposal Builder:** Draft, edit, and submit remediation initiatives directly to the Dean for funding and approval.
  - **Individual Assessment Records:** Searchable, filterable table showing anonymized student IDs (`STU-<HEX>`), skill names, proficiency levels, and test scores, with a **1-click CSV Export**.
  - **Session Ingestion Hub:** Drag-and-drop file upload with real-time format validation, magic byte checking, and preview before confirmation.

---

### 4.4 Role 4: Student / Candidate (`ROLE-004`)
*Skill assessment participant.*

- **Key Responsibilities:**
  - Complete form-based skill assessments during an active academic session.
  - Submit evidence of proficiency without risking PII leakage.
- **Privacy Guarantees:**
  - Raw identifiers (names, roll numbers) are immediately hashed in volatile memory upon ingestion using a server-held HMAC-SHA256 secret.
  - No persistent student profile is retained across sessions.
  - Assessment records expire automatically at the conclusion of the session TTL.

---

## 5. Core Platform Functionalities & Architectural Modules

```mermaid
flowchart LR
    A["1. Ingestion Engine<br/>(CSV / Excel / Forms)"] --> B["2. Volatile Session Store<br/>(ADR-001 HMAC Memory Cache)"]
    B --> C["3. Analytics & Gap Engine<br/>(ADR-008 Approved Benchmarks)"]
    C --> D["4. Recommendation Engine<br/>(Bootcamps / Workshops / Certs)"]
    D --> E["5. Governance Lifecycle<br/>(HOD Proposals -> Dean Decisions)"]
    E --> F["6. Export Center<br/>(PDF / XLSX / ZIP Dossiers)"]
    B -.-> G["7. Auto-Purge Worker<br/>(TTL Expiry & Memory Flush)"]
```

### 5.1 Ingestion & Validation Engine
- **File Parser:** Supports CSV and XLSX parsing up to 25 MB with MIME type verification and magic byte validation (rejecting disguised executables or malicious files).
- **Duplicate Handling (ADR-006):** Employs explicit resolution strategies (`OVERWRITE_WITH_LATEST`, `AVERAGE_SCORES`, or `REJECT_DUPLICATES`).
- **Formula Injection Defense (ADR-005):** Neutralizes spreadsheet injection attacks (`=`, `+`, `-`, `@`) during parsing and export.

### 5.2 Analytics & Curriculum Gap Engine
- **Proficiency Aggregation:** Normalizes raw assessment scores into standardized tiers:
  - **Beginner (Foundation):** $0\% - 49\%$
  - **Intermediate (Practical Application):** $50\% - 74\%$
  - **Expert (Advanced Mastery):** $75\% - 100\%$
- **Benchmark Gap Computation:** Calculates the deficit between student cohort attainment and approved academic targets:
  $$\text{Gap Score} = \max(0, \text{Target Proficiency} - \text{Attained Proficiency})$$
- **Draft vs. Approved Protection (ADR-008):** Unapproved or draft benchmarks are strictly excluded from institutional gap calculations until authorized by an Administrator.

### 5.3 Algorithmic Recommendation Engine
Automatically evaluates gaps and synthesizes targeted interventions:
- **Critical Core Deficits:** Triggers **Intensive Bootcamps** for mandatory foundational skills with low cohort coverage.
- **Practical Application Gaps:** Triggers **Hands-on Workshops & Lab Modules** for intermediate-level deficits.
- **Advanced Competencies:** Generates **Industry Certification Tracks** to elevate top-quartile students.

### 5.4 Individual Assessment Records Explorer
- **Real-Time Data Table:** Ephemerally queries active session data to display individual student records.
- **Data Attributes:** Pseudonym (`STU-<HEX>`), Department, Skill Name, Numerical Score, Proficiency Level, Timestamp.
- **Interactive Controls:** Real-time search, department filter, proficiency level filter, and instant **Export to CSV**.

### 5.5 Institutional Export Center
- **Executive PDF Dossier:** Print-ready, branded institutional summary containing high-level charts, gap analyses, and approved proposals.
- **Multi-Sheet XLSX Workbook:** Structured spreadsheets containing Department Summary, Skill Taxonomy, Gap Analysis, and Approved Interventions.
- **Complete ZIP Archive (ADR-005):** Packages all analytical artifacts into a single encrypted ZIP file, strictly excluding identifiable raw uploads.

### 5.6 Floating Navigation Assistant & Workflow Navigator
- Located at the bottom-right of every authenticated screen.
- Activated by mouse click or hotkey **`Ctrl + K`** (or **`Cmd + K`**).
- Includes **Live Directory Search** to jump directly to any page, plus an **Interactive 6-Step Workflow Tour**.

---

## 6. End-to-End Platform Workflows

### 6.1 Workflow 1: Complete Institutional Assessment & Governance Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor HOD as Head of Department (HOD)
    actor Sys as SSIP Backend & Engines
    actor Dean as School Dean
    actor Admin as Administrator

    Note over HOD,Admin: Step 1: Session Creation & Activation
    HOD->>Sys: Create Department Session (e.g. DEPT-CSE 2026-2027)
    HOD->>Sys: Activate Session
    
    Note over HOD,Sys: Step 2: Ingestion & Privacy Transformation
    HOD->>Sys: Upload Student Marks (CSV / Excel)
    Sys->>Sys: Validate MIME & Magic Bytes
    Sys->>Sys: Apply HMAC-SHA256 Pseudonymization (ADR-001)
    Sys->>Sys: Store in Volatile Memory Cache (Zero DB Persistence)
    Sys-->>HOD: Return Upload Preview & Confirmation
    HOD->>Sys: Confirm Dataset Ingestion

    Note over HOD,Sys: Step 3: Analytics & Gap Calculation
    HOD->>Sys: Request Department Gap Analysis
    Sys->>Sys: Compare Attainment against Approved Benchmarks (ADR-008)
    Sys->>Sys: Generate Proficiency Distributions & Gap Scores
    Sys-->>HOD: Display Analytics & Automated Recommendations

    Note over HOD,Dean: Step 4: Governance & Proposal Lifecycle
    HOD->>Sys: Draft Curricular Intervention Proposal (e.g. Python Bootcamp)
    HOD->>Sys: Submit Proposal to Dean
    Dean->>Sys: Review Department Proposal & Supporting Gap Data
    alt Approved
        Dean->>Sys: Approve Proposal (Recorded in Audit Trail)
    else Revision Needed
        Dean->>Sys: Request Modification / Return with Feedback
    end

    Note over Dean,Admin: Step 5: Institutional Export & Purge
    Dean->>Sys: Download Official Institutional PDF & XLSX Package
    Sys->>Sys: Session Reaches Expiry TTL (e.g. 24h)
    Sys->>Sys: Volatile Memory Cleanup Worker physically purges dataset
```

---

### 6.2 Workflow 2: Dean School-Level Governance & Comparison

```mermaid
flowchart TD
    Start([Dean Logs In]) --> ScopeCheck["System verifies School Scope<br/>(e.g., SCH-SET only)"]
    ScopeCheck --> Dash["Open Institutional Dashboard<br/>(Metrics restricted to School Departments: CSE, ECE, BT)"]
    Dash --> Compare["Navigate to Department Comparison<br/>Compare CSE vs. ECE vs. Biotech"]
    Compare --> IdentifyGaps{"Identify Common<br/>School-Wide Deficits?"}
    IdentifyGaps -- Yes --> ProposeSchool["Initiate School-Wide Cross-Department Initiative"]
    IdentifyGaps -- No --> ReviewDept["Inspect Submitted Department Proposals"]
    ReviewDept --> DecisionConsole["Governance Console:<br/>Approve, Reject, or Request Changes"]
    DecisionConsole --> ExportReport["Export School Institutional Dossier (PDF/Excel)"]
    ExportReport --> Done([End of Review Cycle])
```

---

### 6.3 Workflow 3: HOD Ingestion & Remediation Workflow

```mermaid
flowchart TD
    Start([HOD Logs In]) --> SelectDept["Scoped to Assigned Department (e.g., DEPT-CSE)"]
    SelectDept --> CreateSession["Create & Activate Academic Assessment Session"]
    CreateSession --> IngestOption{"Select Ingestion Method"}
    IngestOption -- Bulk Upload --> FileUpload["Upload CSV / XLSX Dataset"]
    IngestOption -- Single Entry --> WebForm["Enter Assessment Data via Form"]
    FileUpload --> Validate["MIME Check & Magic Byte Validation"]
    Validate --> HMAC["HMAC-SHA256 Tokenization (ADR-001)"]
    WebForm --> HMAC
    HMAC --> Preview["Preview & Confirm Ingestion"]
    Preview --> GapEngine["Run Skill Gap Engine (Approved Benchmarks)"]
    GapEngine --> ViewRecs["Review Algorithmic Interventions (Bootcamps/Workshops)"]
    ViewRecs --> IndivRecords["Inspect Individual Student Records (Filter/Export CSV)"]
    IndivRecords --> SubmitProposal["Formulate Proposal & Submit to Dean"]
    SubmitProposal --> Done([Awaiting Dean Sign-off])
```

---

### 6.4 Workflow 4: Benchmark Lifecycle (ADR-008)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Initial Seeding from Curriculum Mapping
    DRAFT --> UNDER_REVIEW: Academic Committee Review
    UNDER_REVIEW --> DRAFT: Modifications Requested
    UNDER_REVIEW --> APPROVED: Administrator Formal Sign-off
    APPROVED --> ACTIVE_ENGINE: Utilized by Skill Gap Engine
    APPROVED --> DEPRECATED: Curriculum Version Superseded
    DEPRECATED --> [*]

    note right of DRAFT
        Cannot be used by Gap Engine.
        Prevents unverified benchmarks from
        skewing institutional recommendations.
    end note
    
    note right of APPROVED
        Officially verified benchmark.
        Active in gap computations.
    end note
```

---

### 6.5 Workflow 5: Ephemeral Data Lifecycle & Zero-Retention Memory Purge

```mermaid
sequenceDiagram
    participant User as User (HOD / Dean)
    participant API as FastAPI Ingestion Router
    participant RAM as Volatile In-Memory Session Store
    participant DB as Persistent SQLite/Postgres DB
    participant Worker as Background Cleanup Worker

    User->>API: POST /api/v1/sessions/upload (Student Marks)
    API->>API: HMAC-SHA256(Student_ID, Session_Secret)
    API->>RAM: Write Ephemeral Dataset (TTL = 24 Hours)
    Note right of DB: Zero Student Records or Marks<br/>are ever written to Disk
    API-->>User: 200 OK (Dataset Active)

    loop Every 60 Seconds
        Worker->>RAM: Check for Expired Session Keys (TTL <= 0)
        alt Session Expired or Closed
            Worker->>RAM: Physically delete ephemeral marks & matrices
            Worker->>RAM: Flush encryption key from memory
            Note over RAM: Assessment data permanently erased
        end
    end
```

---

## 7. Demo Accounts & Verification Credentials

The platform is pre-seeded with representative institutional accounts:

| Role | Username | Password | Assigned Scope & Authority |
| :--- | :--- | :--- | :--- |
| **Dean (Engineering)** | `dean` | `DeanPassword123!` | School of Engineering & Technology (`SCH-SET` only: CSE, ECE, BT) |
| **Dean (Sciences & Health)** | `dean_ssahs` | `DeanPassword123!` | School of Sciences & Allied Health (`SCH-SSAHS` only) |
| **Administrator** | `admin` | `AdminPassword123!` | Overall University Oversight (All 5 Schools, Benchmarks, Taxonomy) |
| **HOD (CSE)** | `hod_cse` | `HodCsePassword123!` | Department of Computer Science & Engineering (`DEPT-CSE` only) |

---

## 8. Summary of Architectural Decision Records (ADRs)

- **ADR-001 (Pseudonymization):** Server-held random cryptographic key used with HMAC-SHA256; raw identifiers discarded upon entry.
- **ADR-002 (Session-Scoped Governance):** Remediation proposals and decisions reside in memory and expire with session close.
- **ADR-003 (Authentication & Tokens):** Argon2 password hashing with short-lived JWT tokens containing department/school scoping claims.
- **ADR-005 (Sanitized Export Packages):** Original un-sanitized uploads excluded from ZIP packages; formula injection prevented on all tabular exports.
- **ADR-006 (Duplicate Resolution):** Deterministic resolution policy prevents duplicated student marks from distorting cohort statistics.
- **ADR-007 (Proficiency Classification):** Standardized 3-tier proficiency model (Beginner, Intermediate, Expert) anchored by objective thresholds.
- **ADR-008 (Benchmark Governance):** Benchmarks require explicit administrative approval (`APPROVED` state) before powering the Gap Engine.

---
*For technical implementation details, API specifications, and code schemas, refer to the full architectural documents in the `MD folder/` directory.*
