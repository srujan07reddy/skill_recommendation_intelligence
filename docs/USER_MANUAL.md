# Student Skill Intelligence Platform (SSIP) — User Operating Manual

**Document Reference:** `docs/USER_MANUAL.md`  
**Target Audience:** Dean of Academics, Heads of Departments (HOD), Platform Administrators, Faculty & Students  
**Institution:** Jeppiaar University  
**Platform Version:** 1.0.0 (Production Release)  

---

## 1. Introduction & Privacy Architecture

The Student Skill Intelligence Platform (SSIP) is an institutional intelligence and curriculum governance system designed specifically for Jeppiaar University. SSIP computes aggregate skill distributions, evaluates departmental proficiency gaps against curriculum benchmarks, recommends high-impact training events, and coordinates departmental development proposals.

### Core Architectural Guarantees:
- **Zero-Retention Ephemeral Privacy:** Student assessment data, roll numbers, and raw spreadsheets are processed strictly in volatile memory. Raw student roll numbers are immediately converted to cryptographic HMAC-SHA256 pseudonyms (`STU-<HEX>`) upon ingestion and are never stored in the relational database.
- **Strict 3-Tier Proficiency Model (ADR-007):** All skill evaluations strictly adhere to `Beginner` (Basic conceptual awareness), `Intermediate` (Independent implementation), and `Expert` (Architectural mastery).
- **Session-Scoped Lifecycle:** Assessment windows are time-bounded. When an assessment session expires or is purged, all student evaluation records, proposals, and temporary files are permanently destroyed across all 7 privacy boundaries.

---

## 2. Dean of Academics Guide

The Dean of Academics exercises university-wide oversight across all schools and departments (e.g. School of Computing, School of Engineering, School of Management).

### 2.1 Institutional Dashboard
1. Log in with your institutional credentials (`dean` / default password).
2. The **Institutional Dashboard** automatically aggregates student skill coverage across all academic schools.
3. Review university-wide KPIs:
   - Total participating students and evaluations.
   - Institutional skill penetration rate (percentage of cohort possessing canonical competencies).
   - University top skills and proficiency breakdowns.

### 2.2 Department Comparison Workspace
1. In the sidebar, select **Department Comparison**.
2. Select a target School (e.g. *School of Computing*) to view side-by-side competency comparisons between Computer Science (CSE), Information Technology (IT), and Artificial Intelligence & Data Science (AI&DS).
3. Identify cross-departmental curriculum trends and cross-discipline learning opportunities.

### 2.3 Curriculum Benchmark Approval (ADR-008)
Curriculum benchmarks define expected target proficiency and minimum cohort coverage for each program.
1. Navigate to **Curriculum Benchmarks (ADR-008)** under Academic Settings.
2. Filter by School and Department. Benchmarks seeded as `DRAFT` cannot be used in formal governance decisions until approved.
3. Click **Approve Benchmark** or **Approve All Department Benchmarks** to elevate benchmarks to `APPROVED` status.

### 2.4 Development Proposals & Funding Decisions (ADR-002)
1. Navigate to **Review Proposals** in the Governance menu.
2. Review pending proposals submitted by HODs (Workshops, Bootcamps, Practical Labs).
3. Inspect the linked gap metrics and estimated budget justifications.
4. Record your decision:
   - **Approve Proposal:** Authorizes institutional budget allocation.
   - **Reject Proposal:** Returns feedback to the HOD for revision.

### 2.5 Export Center (ADR-005)
1. Select **Export Center** to generate institutional artifacts.
2. Choose your export format:
   - **Multi-Tab Excel Workbook (`.xlsx`):** Formatted summary with formula injection protections.
   - **Standardized CSV (`.csv`):** Aggregated metrics for institutional accreditation audits.
   - **Executive PDF Report:** Formatted report with university branding and charts.
   - **Complete Analysis Package (`.zip`):** Contains reports, JSON metric snapshots, and an automated SHA-256 integrity manifest. *Raw student spreadsheets are strictly excluded to preserve student privacy.*

---

## 3. Head of Department (HOD) Guide

The Head of Department manages departmental assessment windows, imports cohort data, analyzes curriculum gaps, and drafts targeted training proposals.

### 3.1 Initiating an Assessment Session
1. Navigate to **Sessions & Ingestion**.
2. Click **Create New Session**.
3. Configure the session parameters:
   - **Session Name:** e.g., *CSE Spring 2026 Core Skills Assessment*.
   - **Session Type:** Continuous, Milestone, or Combined.
   - **Academic Year:** e.g., *2026-2027*.
   - **Expiry Hours:** Retention window (default: 24 hours).
4. Click **Create Session**, then click **Activate Session** to open data ingestion.

### 3.2 Ingesting Cohort Data (Bulk Upload & Web Forms)
- **Bulk Spreadsheet Upload:**
  1. In the active session, select **Upload Dataset**.
  2. Drag and drop your `.xlsx` or `.csv` file. The file must contain columns: `Student ID`, `Department`, `Skill Name`, `Proficiency Level`.
  3. The engine parses the file, checks file signatures, validates skills against the Jeppiaar taxonomy, and maps raw roll numbers to pseudonyms.
  4. Review the **Validation Report**. If errors exist, resolve them. Click **Confirm & Import** to commit records to volatile memory.
- **Direct Student Web Form:**
  1. Share the active Session ID with students.
  2. Students navigate to the **Student Assessment Form**, enter their roll number, select skills, and submit their self-evaluation.

### 3.3 Skill Analytics & Gap Evaluation
1. Navigate to **Skill Analytics & Gaps**.
2. Review the departmental skill distribution, top competencies, and 3-tier proficiency bar charts.
3. Review the **Curriculum Gap Heatmap**:
   - Red cells indicate **Critical Gaps** (actual proficiency is significantly below benchmark target).
   - Amber cells indicate **Coverage Deficits** (insufficient percentage of cohort possesses the skill).
   - Green cells indicate **Satisfied Benchmarks**.

### 3.4 Reviewing Recommended Events & Submitting Proposals
1. Navigate to **Development Events**.
2. The deterministic Recommendation Engine automatically maps identified gaps to recommended events:
   - *Critical Gaps* $\rightarrow$ Intensive **Bootcamp** (2-4 weeks).
   - *Coverage Deficits* $\rightarrow$ Hands-on **Workshop** (1-2 days).
   - *Advanced Competencies* $\rightarrow$ **Certification Prep**.
3. Click **Adopt as Proposal** or navigate to **Submit Proposal** to formulate a training event proposal for Dean approval.

---

## 4. Platform Administrator Guide

Administrators maintain university academic structures, taxonomy dictionaries, and system-wide zero-retention compliance.

### 4.1 Managing Academic Structure
1. Navigate to **Jeppiaar Schools** in the sidebar.
2. View and manage Schools (School of Computing, School of Engineering, School of Management, School of Science & Humanities), Departments, and Degree Programs.

### 4.2 Managing Skill Taxonomy
1. Navigate to **Skill Taxonomy**.
2. Search and inspect canonical skills, domain clusters, and alias normalization dictionaries (e.g. mapping `py`, `python3`, `py3` to canonical `Python`).

### 4.3 Operational Telemetry & Lifecycle Management
1. Navigate to **Operational Telemetry**.
2. Monitor active session windows, persistent database row counts, and temporary export disk usage.
3. Click **Trigger Cleanup Sweep** to run background maintenance sweeps.
4. Click **Purge** on any session to execute an immediate zero-retention purge across all 7 privacy boundaries.

---

## 5. Support & Emergency Contacts

For institutional support, account provisioning, or emergency privacy audits:
- **Email:** `support-ssip@jeppiaar.edu.in`
- **IQAC Compliance Desk:** Jeppiaar University Campus, Admin Block

