\# USER\_JOURNEYS.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Specification  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the end-to-end user journeys for all roles interacting with the Student Skill Intelligence Platform.



It describes:

\- How users enter and navigate the platform.

\- How students submit skill assessments.

\- How HODs create and manage departmental assessment sessions.

\- How Deans initiate institutional assessments and review institutional analytics.

\- How administrators configure and maintain the platform.

\- How assessment data moves through validation, analysis, recommendations, and exports.

\- How the system responds to errors, restrictions, and incomplete workflows.



The purpose is to ensure that every role has a clearly defined experience aligned with its responsibilities and permissions.



\## 2. User Roles



The platform supports four primary user roles.



| Role | Primary responsibility | Main interaction |

|---|---|---|

| Student | Submit skill assessment information | Assessment form |

| HOD | Manage departmental skill intelligence | Department dashboard and proposals |

| Dean | Review institutional skill intelligence | Institutional dashboard and decisions |

| Administrator | Configure and maintain the platform | Administration console |



\### 2.1 Student



The student participates in skill assessment activities.



The student can:

\- Access assigned assessment sessions.

\- Submit skill information.

\- Select skills from the approved taxonomy.

\- Provide proficiency information.

\- Submit supporting evidence where required.

\- Review permitted submission status.



The student cannot:

\- View other students' assessment records.

\- Access departmental analytics.

\- Modify skill taxonomy.

\- Approve institutional development initiatives.



\### 2.2 HOD



The HOD manages skill intelligence within the authorized department.



The HOD can:

\- Create departmental assessment sessions.

\- Configure departmental assessment activities within permitted settings.

\- Upload student skill datasets.

\- Review validation reports.

\- View departmental analytics.

\- Identify skill gaps.

\- Review recommendations.

\- Propose development initiatives.

\- Submit proposals to the Dean.

\- Export authorized departmental reports.



\### 2.3 Dean



The Dean manages institutional-level skill intelligence and decision-making.



The Dean can:

\- Create institutional or multi-department assessment sessions.

\- Upload authorized datasets.

\- View institutional analytics.

\- Compare departments.

\- Review skill gaps.

\- Review HOD proposals.

\- Approve, reject, defer, or request changes to proposals.

\- Export authorized institutional reports.



\### 2.4 Administrator



The Administrator maintains the platform's configuration and operational controls.



The Administrator can:

\- Manage users and roles.

\- Configure permissions.

\- Manage departments.

\- Maintain skill taxonomy.

\- Configure proficiency frameworks.

\- Configure recommendation rules.

\- Configure validation rules.

\- Manage platform settings.

\- Monitor operational health.



Administrative access does not automatically grant access to restricted student assessment records or academic approval authority.



\---



\## 3. Common Entry Journey



All users begin with the platform entry process.



\### 3.1 Login Journey



\*\*Objective:\*\* Allow authorized users to enter the platform.



```text

Open Platform

&#x20;     |

&#x20;     v

Login Page

&#x20;     |

&#x20;     v

Enter Authentication Details

&#x20;     |

&#x20;     v

Authentication Validation

&#x20;     |

&#x20;     +------ Invalid Credentials

&#x20;     |             |

&#x20;     |             v

&#x20;     |       Display Error

&#x20;     |             |

&#x20;     |             v

&#x20;     |       Retry / Recovery

&#x20;     |

&#x20;     +------ Valid Credentials

&#x20;                   |

&#x20;                   v

&#x20;           Retrieve User Roles

&#x20;                   |

&#x20;                   v

&#x20;           Verify Account Status

&#x20;                   |

&#x20;                   v

&#x20;           Load Authorized Workspace

&#x20;                   |

&#x20;                   v

&#x20;             Role Dashboard

```



\### 3.2 System Responsibilities



The system must:

1\. Authenticate the user.

2\. Verify account status.

3\. Retrieve assigned roles.

4\. Resolve the user's department and institutional scope.

5\. Apply access-control policies.

6\. Load the appropriate dashboard.

7\. Prevent unauthorized navigation.



\### 3.3 Multiple Roles



If a user has multiple authorized roles, the platform may provide a workspace or role-switching mechanism.



Role switching must:

\- Re-evaluate permissions.

\- Update the visible navigation.

\- Apply the selected role's data scope.

\- Prevent privilege escalation.



The final authentication method and multiple-role experience remain implementation decisions.



\---



\## 4. Student Journey



\### 4.1 Student Assessment Journey



\*\*Objective:\*\* Submit skill information through an active assessment session.



\*\*Entry condition:\*\* The student has access to an active assessment session.



```text

Student Login

&#x20;     |

&#x20;     v

Student Dashboard

&#x20;     |

&#x20;     v

View Available Assessment

&#x20;     |

&#x20;     v

Open Assessment

&#x20;     |

&#x20;     v

Read Instructions

&#x20;     |

&#x20;     v

Enter Student Information

&#x20;     |

&#x20;     v

Select Department / Programme

&#x20;     |

&#x20;     v

Select Skills

&#x20;     |

&#x20;     v

Provide Proficiency Information

&#x20;     |

&#x20;     v

Provide Evidence (if required)

&#x20;     |

&#x20;     v

Review Submission

&#x20;     |

&#x20;     v

Submit Assessment

&#x20;     |

&#x20;     v

Backend Validation

&#x20;     |

&#x20;     +------ Validation Failed

&#x20;     |             |

&#x20;     |             v

&#x20;     |       Display Corrections

&#x20;     |

&#x20;     +------ Validation Passed

&#x20;                   |

&#x20;                   v

&#x20;            Save Temporarily

&#x20;                   |

&#x20;                   v

&#x20;            Submission Confirmation

```



\### 4.2 Detailed Interaction



| Step | Student action | System response |

|---|---|---|

| 1 | Login | Authenticate student |

| 2 | Open dashboard | Display available sessions |

| 3 | Select assessment | Verify session access and status |

| 4 | Read instructions | Display assessment guidance |

| 5 | Enter required information | Validate mandatory fields |

| 6 | Select skills | Load approved taxonomy |

| 7 | Select proficiency | Display permitted proficiency options |

| 8 | Provide evidence | Validate applicable evidence requirements |

| 9 | Review submission | Display submission summary |

| 10 | Submit | Perform backend validation |

| 11 | Wait for confirmation | Store accepted submission temporarily |

| 12 | View status | Display permitted submission status |



\### 4.3 Student Dashboard



The student dashboard should contain:



\- Welcome and account information.

\- Available assessments.

\- Assessment deadlines.

\- Submission status.

\- Previous submission status within active retention limits.

\- Assessment instructions and announcements.



The dashboard must not expose departmental or institutional analytics.



\### 4.4 Student Error Scenarios



| Scenario | System behavior |

|---|---|

| Session expired | Prevent submission and display expiry notice |

| Session not yet active | Display scheduled opening information |

| Invalid skill selection | Request a valid selection |

| Missing mandatory information | Highlight required fields |

| Invalid evidence | Explain the correction required |

| Duplicate submission | Apply configured duplicate policy |

| Network interruption | Preserve recoverable form state where practical |

| Unauthorized session | Deny access |

| Submission failure | Display failure status without falsely confirming success |



\### 4.5 Student Completion



The journey is complete when:

\- The submission passes validation.

\- The system returns a submission reference.

\- The student receives confirmation.

\- The submission status is visible within the permitted session lifetime.



\---



\## 5. HOD Journey



The HOD journey is focused on departmental skill intelligence and development planning.



\### 5.1 HOD Dashboard Journey



\*\*Objective:\*\* Understand the skill profile of the HOD's department.



```text

HOD Login

&#x20;   |

&#x20;   v

Department Dashboard

&#x20;   |

&#x20;   v

View Department Overview

&#x20;   |

&#x20;   +------ Participation

&#x20;   |

&#x20;   +------ Skill Distribution

&#x20;   |

&#x20;   +------ Proficiency Distribution

&#x20;   |

&#x20;   +------ Evidence Availability

&#x20;   |

&#x20;   +------ Skill Gaps

&#x20;   |

&#x20;   +------ Recommendations

&#x20;   |

&#x20;   v

Select Analytical Area

&#x20;   |

&#x20;   v

Apply Filters

&#x20;   |

&#x20;   v

Inspect Detailed Metrics

&#x20;   |

&#x20;   v

Identify Development Needs

```



\### 5.2 HOD Dashboard Components



The dashboard should provide:



| Component | Purpose |

|---|---|

| Department Overview | Summary of departmental assessment |

| Participation Metrics | Measure assessment participation |

| Skill Distribution | Identify reported or assessed skills |

| Proficiency Distribution | Understand proficiency classifications |

| Evidence Analysis | Examine evidence availability |

| Skill Gap Analysis | Identify target deviations |

| Recommendations | View suggested development initiatives |

| Session Management | Manage assessment sessions |

| Export Center | Download authorized reports |



\### 5.3 HOD Assessment Session Creation



\*\*Objective:\*\* Create an assessment session for the authorized department.



```text

HOD Dashboard

&#x20;     |

&#x20;     v

Open Session Management

&#x20;     |

&#x20;     v

Create New Session

&#x20;     |

&#x20;     v

Select Session Type

&#x20;     |

&#x20;     +------ Form Collection

&#x20;     |

&#x20;     +------ Bulk Upload

&#x20;     |

&#x20;     +------ Combined

&#x20;     |

&#x20;     v

Configure Session Details

&#x20;     |

&#x20;     v

Set Department Scope

&#x20;     |

&#x20;     v

Configure Assessment Period

&#x20;     |

&#x20;     v

Review Configuration

&#x20;     |

&#x20;     v

Submit Creation Request

&#x20;     |

&#x20;     v

Backend Authorization

&#x20;     |

&#x20;     +------ Unauthorized

&#x20;     |          |

&#x20;     |          v

&#x20;     |      Reject Request

&#x20;     |

&#x20;     +------ Authorized

&#x20;                |

&#x20;                v

&#x20;         Create Session

&#x20;                |

&#x20;                v

&#x20;         Display Session Details

```



\### 5.4 Session Configuration



The HOD may configure permitted fields such as:



\- Session name.

\- Description.

\- Session type.

\- Department scope.

\- Assessment opening time.

\- Submission deadline.

\- Assessment instructions.

\- Permitted input methods.

\- Proficiency framework selection, if authorized.



The HOD must not modify restricted institutional configurations such as global taxonomy or system-wide proficiency thresholds unless explicitly granted permission.



\### 5.5 HOD Bulk Upload Journey



\*\*Objective:\*\* Import departmental student skill data.



```text

Open Assessment Session

&#x20;      |

&#x20;      v

Select Bulk Upload

&#x20;      |

&#x20;      v

Choose Excel / CSV File

&#x20;      |

&#x20;      v

Upload File

&#x20;      |

&#x20;      v

File Validation

&#x20;      |

&#x20;      v

Column Mapping

&#x20;      |

&#x20;      v

Record Validation

&#x20;      |

&#x20;      v

Display Validation Preview

&#x20;      |

&#x20;      +------ Blocking Errors

&#x20;      |             |

&#x20;      |             v

&#x20;      |       Correct / Re-upload

&#x20;      |

&#x20;      +------ Valid Records

&#x20;                    |

&#x20;                    v

&#x20;             Review Import Summary

&#x20;                    |

&#x20;                    v

&#x20;             Confirm Import

&#x20;                    |

&#x20;                    v

&#x20;             Normalize Records

&#x20;                    |

&#x20;                    v

&#x20;             Update Session Dataset

```



The HOD must be able to inspect:

\- Total detected records.

\- Accepted records.

\- Warning records.

\- Rejected records.

\- Unknown skills.

\- Duplicate records.

\- Department mapping errors.



The import must not proceed silently.



\### 5.6 HOD Analysis Journey



\*\*Objective:\*\* Convert departmental analytics into development priorities.



```text

Open Department Dashboard

&#x20;         |

&#x20;         v

Select Assessment Session

&#x20;         |

&#x20;         v

View Analysis Status

&#x20;         |

&#x20;         v

Open Skill Analysis

&#x20;         |

&#x20;         v

Inspect Skill Distribution

&#x20;         |

&#x20;         v

Inspect Proficiency Distribution

&#x20;         |

&#x20;         v

Review Evidence Quality

&#x20;         |

&#x20;         v

Review Skill Gaps

&#x20;         |

&#x20;         v

Review Recommendations

&#x20;         |

&#x20;         v

Identify Priority Areas

&#x20;         |

&#x20;         v

Create Development Proposal

```



\### 5.7 HOD Proposal Journey



\*\*Objective:\*\* Submit a development initiative for Dean review.



A proposal may include:



\- Initiative title.

\- Target department.

\- Identified skill gap.

\- Supporting analytical evidence.

\- Proposed training type.

\- Intended student population.

\- Expected outcome.

\- Proposed duration.

\- Resource requirements.

\- Estimated cost, where applicable.

\- Supporting documents, if enabled.



```text

HOD Reviews Recommendation

&#x20;         |

&#x20;         v

Select Development Initiative

&#x20;         |

&#x20;         v

Create Proposal

&#x20;         |

&#x20;         v

Enter Proposal Details

&#x20;         |

&#x20;         v

Attach Supporting Information

&#x20;         |

&#x20;         v

Review Proposal

&#x20;         |

&#x20;         v

Submit to Dean

&#x20;         |

&#x20;         v

Proposal Status Updated

```



\### 5.8 Proposal Statuses



| Status | Meaning |

|---|---|

| DRAFT | Proposal is being prepared |

| SUBMITTED | Proposal submitted for review |

| UNDER\_REVIEW | Dean is reviewing |

| CHANGES\_REQUESTED | Additional information required |

| APPROVED | Proposal approved |

| REJECTED | Proposal rejected |

| DEFERRED | Decision postponed |

| WITHDRAWN | Proposal withdrawn where permitted |



Proposal status history may require persistent governance storage. Until that decision is approved, governance records must follow the temporary-data policy.



\### 5.9 HOD Export Journey



\*\*Objective:\*\* Download departmental analytical reports.



```text

Open Export Center

&#x20;      |

&#x20;      v

Select Assessment Session

&#x20;      |

&#x20;      v

Choose Export Mode

&#x20;      |

&#x20;      +------ Reports Only

&#x20;      |

&#x20;      +------ Complete Analysis Package

&#x20;      |

&#x20;      v

Select Output Format

&#x20;      |

&#x20;      v

Select Permitted Data

&#x20;      |

&#x20;      v

Authorization and Privacy Validation

&#x20;      |

&#x20;      v

Generate Export

&#x20;      |

&#x20;      v

File Integrity Validation

&#x20;      |

&#x20;      v

Download Report

```



The HOD must only export data within the authorized departmental scope.



\---



\## 6. Dean Journey



The Dean journey focuses on institution-wide skill intelligence, interdepartmental comparison, and development approvals.



\### 6.1 Dean Dashboard Journey



\*\*Objective:\*\* Understand institutional skill distribution and development needs.



```text

Dean Login

&#x20;   |

&#x20;   v

Institutional Dashboard

&#x20;   |

&#x20;   v

View Institutional Overview

&#x20;   |

&#x20;   +------ Total Participation

&#x20;   |

&#x20;   +------ Skill Distribution

&#x20;   |

&#x20;   +------ Proficiency Distribution

&#x20;   |

&#x20;   +------ Evidence Quality

&#x20;   |

&#x20;   +------ Department Comparison

&#x20;   |

&#x20;   +------ Institutional Skill Gaps

&#x20;   |

&#x20;   +------ Development Recommendations

&#x20;   |

&#x20;   v

Select Department / Skill Domain

&#x20;   |

&#x20;   v

Inspect Analytical Details

&#x20;   |

&#x20;   v

Identify Institutional Priorities

```



\### 6.2 Dean Dashboard Components



| Component | Purpose |

|---|---|

| Institutional Overview | Institution-level summary |

| Department Comparison | Compare departments |

| Skill Domain Analytics | Understand domain-level distribution |

| Proficiency Analytics | Examine proficiency classifications |

| Evidence Analytics | Evaluate evidence availability |

| Skill Gap Overview | Identify development needs |

| Proposal Management | Review HOD proposals |

| Session Management | Create institutional sessions |

| Export Center | Download institutional reports |



\### 6.3 Institutional Session Creation



The Dean may create:

\- Institution-wide assessment sessions.

\- Multi-department sessions.

\- Sessions for selected departments, where authorized.



The Dean must define the assessment scope and ensure that the session configuration is consistent with institutional permissions.



The same validation and session lifecycle rules apply to Dean-created sessions.



\### 6.4 Department Comparison Journey



\*\*Objective:\*\* Compare departmental skill profiles.



```text

Dean Dashboard

&#x20;     |

&#x20;     v

Open Department Comparison

&#x20;     |

&#x20;     v

Select Assessment Session

&#x20;     |

&#x20;     v

Select Departments

&#x20;     |

&#x20;     v

Select Comparison Metric

&#x20;     |

&#x20;     +------ Participation

&#x20;     |

&#x20;     +------ Skill Coverage

&#x20;     |

&#x20;     +------ Proficiency

&#x20;     |

&#x20;     +------ Verified Coverage

&#x20;     |

&#x20;     +------ Evidence Availability

&#x20;     |

&#x20;     v

Apply Filters

&#x20;     |

&#x20;     v

Compare Results

&#x20;     |

&#x20;     v

Inspect Department Details

&#x20;     |

&#x20;     v

Identify Institutional Priorities

```



Comparisons must use compatible metric definitions and denominators.



The platform must warn when department populations, assessment methods, or data quality differ significantly.



\### 6.5 Dean Proposal Review Journey



\*\*Objective:\*\* Evaluate development proposals submitted by HODs.



```text

Dean Dashboard

&#x20;     |

&#x20;     v

Open Proposal Management

&#x20;     |

&#x20;     v

View Submitted Proposals

&#x20;     |

&#x20;     v

Select Proposal

&#x20;     |

&#x20;     v

Review Proposal Details

&#x20;     |

&#x20;     v

Inspect Supporting Analytics

&#x20;     |

&#x20;     v

Evaluate Resources and Outcomes

&#x20;     |

&#x20;     v

Make Decision

&#x20;     |

&#x20;     +------ Approve

&#x20;     |

&#x20;     +------ Reject

&#x20;     |

&#x20;     +------ Request Changes

&#x20;     |

&#x20;     +------ Defer

&#x20;     |

&#x20;     v

Record Decision

&#x20;     |

&#x20;     v

Update Proposal Status

&#x20;     |

&#x20;     v

Notify HOD

```



\### 6.6 Decision Requirements



Every decision should contain:



\- Proposal reference.

\- Decision.

\- Decision timestamp.

\- Decision-making user reference.

\- Comments or justification.

\- Required modifications, where applicable.



A proposal must not be approved solely because the Recommendation Engine generated it.



The Dean remains responsible for the institutional decision.



\### 6.7 Dean Export Journey



The Dean may export:

\- Institutional reports.

\- Department comparison reports.

\- Skill domain reports.

\- Skill gap reports.

\- Recommendation reports.

\- Complete analysis packages, where authorized.



Student-identifiable information requires separate authorization.



\---



\## 7. Administrator Journey



The Administrator journey focuses on platform governance, configuration, and operational management.



\### 7.1 Administrator Dashboard



\*\*Objective:\*\* Maintain the platform's configuration and operational health.



```text

Administrator Login

&#x20;       |

&#x20;       v

Administration Dashboard

&#x20;       |

&#x20;       +------ User Management

&#x20;       |

&#x20;       +------ Role Management

&#x20;       |

&#x20;       +------ Permission Management

&#x20;       |

&#x20;       +------ Department Management

&#x20;       |

&#x20;       +------ Skill Taxonomy

&#x20;       |

&#x20;       +------ Proficiency Framework

&#x20;       |

&#x20;       +------ Validation Rules

&#x20;       |

&#x20;       +------ Recommendation Rules

&#x20;       |

&#x20;       +------ Platform Configuration

&#x20;       |

&#x20;       +------ Operational Monitoring

```



\### 7.2 User Management Journey



```text

Open User Management

&#x20;       |

&#x20;       v

Search / Create User

&#x20;       |

&#x20;       v

Enter User Details

&#x20;       |

&#x20;       v

Assign Role

&#x20;       |

&#x20;       v

Assign Department Scope

&#x20;       |

&#x20;       v

Configure Account Status

&#x20;       |

&#x20;       v

Validate Permissions

&#x20;       |

&#x20;       v

Save Configuration

```



The system must prevent unauthorized role assignment and privilege escalation.



\### 7.3 Skill Taxonomy Management Journey



```text

Open Skill Taxonomy

&#x20;       |

&#x20;       v

View Skill Domains

&#x20;       |

&#x20;       v

Select Domain / Category

&#x20;       |

&#x20;       v

Add / Edit / Deactivate Skill

&#x20;       |

&#x20;       v

Configure Aliases

&#x20;       |

&#x20;       v

Configure Department Relevance

&#x20;       |

&#x20;       v

Validate Relationships

&#x20;       |

&#x20;       v

Publish Taxonomy Version

```



Taxonomy changes must be versioned.



Existing analysis snapshots must retain the taxonomy version used during their generation.



\### 7.4 Proficiency Framework Management



The Administrator may manage:

\- Proficiency level definitions.

\- Score ranges.

\- Assessment criteria.

\- Evidence requirements.

\- Classification rules.

\- Framework versions.



Changes to proficiency criteria must be versioned and must not silently alter existing analytical snapshots.



\### 7.5 Recommendation Rule Management



The Administrator may configure:

\- Recommendation categories.

\- Gap-to-initiative mappings.

\- Priority rules.

\- Eligibility conditions.

\- Recommendation thresholds.



The Recommendation Engine remains deterministic in the initial release.



Administrative configuration must not bypass Dean approval requirements.



\### 7.6 Operational Monitoring



The Administrator should be able to inspect permitted operational information such as:



\- Platform health.

\- API availability.

\- Session processing status.

\- Upload processing status.

\- Export job status.

\- Cleanup execution status.

\- Application errors.

\- Resource utilization.



Operational monitoring must not expose student assessment contents by default.



\---



\## 8. Cross-Role Workflows



Some workflows involve more than one role.



\### 8.1 Combined Assessment Workflow



\*\*Objective:\*\* Collect assessment data through forms and bulk uploads within one session.



```text

HOD / Dean Creates Session

&#x20;         |

&#x20;         v

Session Activated

&#x20;         |

&#x20;         +-------------------------+

&#x20;         |                         |

&#x20;         v                         v

&#x20;  Student Form                Authorized Upload

&#x20;  Submissions                 by HOD / Dean

&#x20;         |                         |

&#x20;         v                         v

&#x20;  Form Validation             File Validation

&#x20;         |                         |

&#x20;         v                         v

&#x20;  Normalization                Normalization

&#x20;         |                         |

&#x20;         +------------+------------+

&#x20;                      |

&#x20;                      v

&#x20;              Shared Session Dataset

&#x20;                      |

&#x20;                      v

&#x20;               Dataset Validation

&#x20;                      |

&#x20;                      v

&#x20;               Skill Analysis

&#x20;                      |

&#x20;                      v

&#x20;               Skill Gap Analysis

&#x20;                      |

&#x20;                      v

&#x20;               Recommendations

&#x20;                      |

&#x20;                      v

&#x20;               HOD / Dean Review

```



Both collection channels must feed the same normalized data structure.



The platform must prevent duplicate counting when records arrive through multiple channels.



\### 8.2 Departmental Development Workflow



```text

Student Assessment

&#x20;       |

&#x20;       v

HOD Reviews Department Analytics

&#x20;       |

&#x20;       v

Skill Gap Identification

&#x20;       |

&#x20;       v

Recommendation Review

&#x20;       |

&#x20;       v

HOD Creates Proposal

&#x20;       |

&#x20;       v

Dean Reviews Proposal

&#x20;       |

&#x20;       v

Decision

&#x20;       |

&#x20;       +------ Approved

&#x20;       |

&#x20;       +------ Changes Requested

&#x20;       |

&#x20;       +------ Rejected

&#x20;       |

&#x20;       +------ Deferred

```



This workflow describes approval of a proposed development initiative. Actual event scheduling, registration, delivery, and attendance management are outside the initial platform scope.



\### 8.3 Institutional Planning Workflow



```text

Institutional Assessment

&#x20;       |

&#x20;       v

Department Data Collection

&#x20;       |

&#x20;       v

Institutional Analysis

&#x20;       |

&#x20;       v

Department Comparison

&#x20;       |

&#x20;       v

Institutional Skill Gap Analysis

&#x20;       |

&#x20;       v

Recommendation Review

&#x20;       |

&#x20;       v

Institutional Prioritization

&#x20;       |

&#x20;       v

Dean Decision

&#x20;       |

&#x20;       v

Export / Offline Planning

```



\---



\## 9. Export and Offline Access Journey



\*\*Objective:\*\* Allow authorized users to download analytical information for offline use.



The export journey is common to HODs and Deans, with different access scopes.



\### 9.1 Reports-Only Journey



```text

Open Export Center

&#x20;      |

&#x20;      v

Select Reports-Only

&#x20;      |

&#x20;      v

Choose PDF / Excel / CSV

&#x20;      |

&#x20;      v

Select Report Content

&#x20;      |

&#x20;      v

Validate Access and Privacy

&#x20;      |

&#x20;      v

Generate Report

&#x20;      |

&#x20;      v

Download

```



\### 9.2 Complete Analysis Package Journey



```text

Open Export Center

&#x20;      |

&#x20;      v

Select Complete Package

&#x20;      |

&#x20;      v

Choose Applicable Components

&#x20;      |

&#x20;      v

Validate Identifiable Data Permissions

&#x20;      |

&#x20;      v

Prepare Package

&#x20;      |

&#x20;      v

Generate ZIP

&#x20;      |

&#x20;      v

Validate Manifest and Integrity

&#x20;      |

&#x20;      v

Download Package

```



The complete package may include original uploads, normalized data, analytics, recommendations, reports, and manifest information where applicable and authorized.



Once downloaded, the exported file is under the recipient's control. The platform cannot guarantee deletion of copies stored outside its environment.



\---



\## 10. Session Expiry and Cleanup Journey



\*\*Objective:\*\* Ensure temporary assessment data does not remain available beyond its configured retention period.



```text

Assessment Session Active

&#x20;         |

&#x20;         v

Session Completed / Closed

&#x20;         |

&#x20;         v

Retention Period Evaluated

&#x20;         |

&#x20;         v

Expiry Reached

&#x20;         |

&#x20;         v

Block Further Access

&#x20;         |

&#x20;         v

Initiate Cleanup

&#x20;         |

&#x20;         +------ Temporary Session Data

&#x20;         |

&#x20;         +------ Uploaded Files

&#x20;         |

&#x20;         +------ Analysis Snapshots

&#x20;         |

&#x20;         +------ Recommendation Results

&#x20;         |

&#x20;         +------ Temporary Export Files

&#x20;         |

&#x20;         v

Verify Cleanup

&#x20;         |

&#x20;         v

Mark Session Cleaned

```



The platform must:

\- Prevent access to expired session data.

\- Delete temporary records according to the retention policy.

\- Delete temporary upload and export files.

\- Remove related temporary processing data.

\- Record permitted cleanup metadata.

\- Avoid retaining student assessment content in operational logs.



Downloaded exports are not controlled by server-side cleanup.



\---



\## 11. Error and Exception Journeys



The platform must provide predictable behavior when workflows fail.



| Scenario | User | Expected response |

|---|---|---|

| Invalid login | All roles | Display authentication error |

| Account disabled | All roles | Deny access |

| Unauthorized page | All roles | Display access denied |

| Expired session | Student / HOD / Dean | Block access and explain expiry |

| Invalid upload | HOD / Dean | Display validation report |

| No valid records | HOD / Dean | Display no valid data |

| Analysis failure | HOD / Dean | Display failure status and safe retry option |

| Insufficient participation | HOD / Dean | Display data quality warning |

| Suppressed metric | HOD / Dean | Display privacy notice |

| Unauthorized export | HOD / Dean | Reject export request |

| Export failure | HOD / Dean | Display failure status |

| Cleanup failure | Administrator | Display operational alert |

| Configuration conflict | Administrator | Prevent invalid configuration |



Error handling must not disclose sensitive information or internal stack traces.



\---



\## 12. Navigation and Workspace Structure



The platform should provide role-specific navigation.



\### 12.1 Student Navigation



\- Dashboard

\- Available Assessments

\- My Submissions

\- Profile

\- Help



\### 12.2 HOD Navigation



\- Dashboard

\- Assessment Sessions

\- Data Collection

\- Skill Analytics

\- Skill Gaps

\- Recommendations

\- Development Proposals

\- Export Center

\- Profile



\### 12.3 Dean Navigation



\- Institutional Dashboard

\- Assessment Sessions

\- Department Comparison

\- Skill Analytics

\- Institutional Skill Gaps

\- Recommendations

\- Proposal Management

\- Export Center

\- Profile



\### 12.4 Administrator Navigation



\- Administration Dashboard

\- Users

\- Roles and Permissions

\- Departments

\- Skill Taxonomy

\- Proficiency Framework

\- Validation Configuration

\- Recommendation Rules

\- Platform Settings

\- Operational Monitoring



Navigation visibility is a usability mechanism. Backend authorization remains the actual access-control boundary.



\---



\## 13. Journey State Management



The frontend must represent the state of long-running workflows accurately.



\### 13.1 Assessment States



\- NOT\_STARTED

\- IN\_PROGRESS

\- SUBMITTED

\- VALIDATING

\- ACCEPTED

\- ACCEPTED\_WITH\_WARNINGS

\- REJECTED

\- EXPIRED



\### 13.2 Upload States



\- NOT\_STARTED

\- UPLOADING

\- UPLOADED

\- VALIDATING

\- VALIDATION\_COMPLETED

\- READY\_FOR\_IMPORT

\- IMPORTING

\- COMPLETED

\- FAILED



\### 13.3 Analysis States



\- NOT\_STARTED

\- QUEUED

\- PROCESSING

\- COMPLETED

\- COMPLETED\_WITH\_WARNINGS

\- FAILED



\### 13.4 Export States



\- REQUESTED

\- VALIDATING

\- QUEUED

\- PROCESSING

\- VALIDATING\_FILE

\- READY

\- FAILED

\- EXPIRED

\- CLEANING

\- DELETED



The frontend must display actual backend states. It must not fabricate progress percentages.



\---



\## 14. Accessibility and Usability Requirements



All user journeys should support:



\- Responsive desktop, tablet, and mobile layouts.

\- Keyboard navigation.

\- Accessible form labels.

\- Clear validation messages.

\- Readable data tables and charts.

\- Consistent navigation.

\- Clear confirmation before destructive actions.

\- Recovery from recoverable form errors.

\- Appropriate loading and processing indicators.

\- Consistent date and time presentation.



The frontend should follow the visual direction established in `FRONTEND\_ARCHITECTURE.md`.



\---



\## 15. Journey-to-Module Mapping



| User journey | Main application modules |

|---|---|

| Login | Authentication, Authorization |

| Student assessment | Assessment, Session Management, Validation |

| HOD session creation | Session Management, Authorization |

| Bulk upload | Ingestion, Validation, Normalization |

| Skill analysis | Skill Analysis Engine, Dashboard |

| Skill gap review | Skill Gap Analysis |

| Recommendation review | Recommendation Engine |

| Proposal submission | Governance |

| Dean approval | Governance, Authorization |

| Institutional comparison | Analytics, Dashboard |

| Export | Export Management |

| Taxonomy management | Skill Taxonomy |

| Proficiency configuration | Proficiency Framework |

| Platform administration | User Management, Configuration |

| Session cleanup | Cleanup and Retention |



\---



\## 16. Acceptance Criteria



The user journey design is acceptable when:



1\. Every role has a defined entry and dashboard experience.

2\. Student assessment can be completed through the permitted form workflow.

3\. HODs can manage departmental assessment sessions.

4\. Deans can manage authorized institutional assessment sessions.

5\. Form submissions and bulk uploads feed the same normalized dataset.

6\. HODs can inspect departmental analytics and create development proposals.

7\. Deans can compare departments and review proposals.

8\. Proposal decisions follow explicit governance permissions.

9\. Administrators can manage platform configuration without automatically receiving academic approval authority.

10\. Export journeys enforce access and privacy restrictions.

11\. Expired sessions cannot be accessed.

12\. Temporary assessment data follows the cleanup lifecycle.

13\. Error and exception states are represented.

14\. Every journey respects backend authorization.

15\. Long-running operations display real backend states.



\---



\## 17. Open Decisions



The following items require confirmation before implementation:



1\. Authentication method: university SSO or platform-managed accounts.

2\. Whether students can edit submissions after submission.

3\. Whether students can submit multiple revisions.

4\. Whether HODs can create sessions independently or require Dean authorization.

5\. Whether Deans can create sessions for any department or only authorized scopes.

6\. Whether HOD proposals and Dean decisions must persist after assessment-session expiry.

7\. Whether the proposal approval workflow needs additional institutional roles.

8\. Whether students can view their own submitted proficiency and evidence information after submission.

9\. Whether notifications use email, in-platform notifications, or both.

10\. Whether proposal attachments are included in the initial release.

11\. Whether session creation supports scheduled activation.

12\. Whether exports remain available after the source session expires.

13\. Whether the platform needs an explicit audit-history interface.



\---



\## 18. Related Documents



| Document | Relationship |

|---|---|

| PROJECT\_OVERVIEW.md | Product vision and scope |

| SCOPE\_AND\_OBJECTIVES.md | Functional boundaries |

| FUNCTIONAL\_REQUIREMENTS.md | System behavior |

| ROLES\_AND\_RESPONSIBILITIES.md | Role responsibilities |

| ACCESS\_CONTROL.md | Role and resource permissions |

| SESSION\_MANAGEMENT.md | Assessment session lifecycle |

| VALIDATION\_RULES.md | Submission and upload validation |

| ANALYTICS\_SPECIFICATION.md | Analytical calculations |

| RECOMMENDATION\_ENGINE.md | Development recommendations |

| EXPORT\_ARCHITECTURE.md | Export workflows |

| DATA\_PRIVACY\_AND\_RETENTION.md | Data retention and privacy |

| FRONTEND\_ARCHITECTURE.md | User interface structure |

| API\_DOCUMENTATION.md | Backend API contracts |



\*\*Document status:\*\* Proposed Specification — Version 1.0



\*\*Core principle:\*\* Each role should see only the information and operations necessary for its responsibilities. The user journey must follow the institution's governance model, while the backend enforces every access and decision boundary.

