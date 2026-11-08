\# DATA\_FLOW\_ARCHITECTURE.md



\# Student Skill Intelligence Platform (SSIP)

\*\*Document:\*\* Data Flow Architecture  

\*\*Version:\*\* 1.0  

\*\*Status:\*\* Proposed Architecture  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Introduction



The Student Skill Intelligence Platform (SSIP) collects student skill information through assessment forms and authorized bulk dataset uploads.



The collected information passes through a structured data pipeline that validates, normalizes, analyzes, and converts raw submissions into institutional skill intelligence.



The platform supports:



\- Student skill assessment submissions.

\- Excel and CSV dataset uploads.

\- Temporary data processing.

\- Department-level skill aggregation.

\- Skill proficiency analysis.

\- Departmental skill gap identification.

\- Development program recommendations.

\- HOD review and proposal submission.

\- Dean-level institutional review and approval.

\- Downloadable reports and complete analysis packages.

\- Automatic cleanup of expired temporary data.



The system follows a temporary data processing model. Student skill assessment records are not maintained in a permanent student-skill database.



\---



\## 2. Data Flow Principles



| Principle | Description |

|---|---|

| Unified ingestion | All input channels must produce a common internal data structure. |

| Validation before processing | Raw input must pass validation before entering the analytical pipeline. |

| Data normalization | Different input formats must be converted into a consistent representation. |

| Temporary processing | Student assessment data remains within an active processing session. |

| Controlled access | Data access depends on user role, department scope, and session permissions. |

| Explainable analysis | Analytics and recommendations must be traceable to defined rules and input data. |

| Secure export | Downloaded information must respect the export permissions of the requesting user. |

| Lifecycle management | Temporary data must be removed when its retention period expires. |



\---



\## 3. High-Level Data Flow



```mermaid

flowchart TD

&#x20;   A\[Student Assessment Forms]

&#x20;   B\[Excel / CSV Upload]

&#x20;   C\[Input Validation]

&#x20;   D\[Data Normalization]

&#x20;   E\[Temporary Session Dataset]

&#x20;   F\[Proficiency Analysis]

&#x20;   G\[Department Aggregation]

&#x20;   H\[Skill Gap Analysis]

&#x20;   I\[Recommendation Engine]

&#x20;   J\[HOD Review]

&#x20;   K\[Dean Review]

&#x20;   L\[Dashboard and Reports]

&#x20;   M\[Export Generation]

&#x20;   N\[Temporary Data Cleanup]



&#x20;   A --> C

&#x20;   B --> C

&#x20;   C --> D

&#x20;   D --> E

&#x20;   E --> F

&#x20;   F --> G

&#x20;   G --> H

&#x20;   H --> I

&#x20;   I --> L

&#x20;   L --> J

&#x20;   J --> K

&#x20;   K --> L

&#x20;   L --> M

&#x20;   M --> N

&#x20;   E --> N

```



The two input channels converge into one processing pipeline.



This ensures that form submissions and uploaded datasets are analyzed using the same validation, normalization, and intelligence services.



\---



\## 4. Data Sources



SSIP has two primary data collection channels.



\### 4.1 Student Assessment Forms



Students provide skill information through a web-based assessment form.



Possible information fields:



| Field | Description |

|---|---|

| Student Identifier | Identifier used to associate the submission with an authorized student |

| Department | Student's academic department |

| Academic Year | Current academic year or batch |

| Skill Category | Broad classification of the skill |

| Skill Name | Specific technical or professional skill |

| Proficiency Level | Self-reported or assessed proficiency |

| Evidence | Optional project, certification, or assessment evidence |

| Assessment Timestamp | Submission time |



The final form schema must be defined separately in `DATABASE\_DESIGN.md` or the applicable data model documentation.



The Student Identifier is used for record association and validation. It must not automatically be exposed in departmental dashboards or aggregated reports.



\### 4.2 Bulk Dataset Upload



Authorized users can upload existing datasets.



Supported formats:



\- `.xlsx`

\- `.xls` where supported by the selected parser

\- `.csv`



The upload process must identify:



\- Missing columns.

\- Invalid values.

\- Duplicate records.

\- Unsupported proficiency labels.

\- Invalid department references.

\- Malformed rows.

\- Unexpected data formats.



The system must provide an upload validation summary before treating the dataset as successfully processed.



\### 4.3 Common Data Model



Both collection channels must produce a common normalized representation.



Illustrative internal record:



```json

{

&#x20; "student\_reference": "TEMP-STUDENT-001",

&#x20; "department\_code": "CSE",

&#x20; "academic\_year": "2026",

&#x20; "skills": \[

&#x20;   {

&#x20;     "skill\_name": "Python",

&#x20;     "category": "Programming",

&#x20;     "proficiency": "Intermediate",

&#x20;     "evidence\_type": "Self-reported"

&#x20;   },

&#x20;   {

&#x20;     "skill\_name": "Linux",

&#x20;     "category": "Operating Systems",

&#x20;     "proficiency": "Beginner",

&#x20;     "evidence\_type": "Self-reported"

&#x20;   }

&#x20; ]

}

```



This is an illustrative processing structure, not a permanent database record.



The actual schema must be versioned and shared by the form-processing and file-processing services.



\---



\## 5. Data Ingestion Flow



\### 5.1 Form Submission Flow



```mermaid

sequenceDiagram

&#x20;   participant ST as Student

&#x20;   participant FE as Frontend

&#x20;   participant API as FastAPI

&#x20;   participant VAL as Validation Service

&#x20;   participant SES as Session Manager



&#x20;   ST->>FE: Complete assessment

&#x20;   FE->>API: Submit assessment

&#x20;   API->>VAL: Validate fields

&#x20;   VAL-->>API: Validation result



&#x20;   alt Valid submission

&#x20;       API->>SES: Add submission to active session

&#x20;       SES-->>API: Submission accepted

&#x20;       API-->>FE: Success response

&#x20;       FE-->>ST: Confirmation

&#x20;   else Invalid submission

&#x20;       API-->>FE: Validation errors

&#x20;       FE-->>ST: Correct required fields

&#x20;   end

```



\### 5.2 Bulk Upload Flow



```mermaid

sequenceDiagram

&#x20;   participant US as Authorized User

&#x20;   participant FE as Frontend

&#x20;   participant API as FastAPI

&#x20;   participant PAR as File Parser

&#x20;   participant VAL as Validation Service

&#x20;   participant SES as Session Manager



&#x20;   US->>FE: Select dataset

&#x20;   FE->>API: Upload file

&#x20;   API->>PAR: Parse uploaded file

&#x20;   PAR-->>API: Extracted records

&#x20;   API->>VAL: Validate records

&#x20;   VAL-->>API: Validation summary



&#x20;   alt Valid records available

&#x20;       API->>SES: Add approved records

&#x20;       SES-->>API: Updated session

&#x20;       API-->>FE: Processing summary

&#x20;   else No valid records

&#x20;       API-->>FE: Upload rejected

&#x20;   end



&#x20;   FE-->>US: Display upload results

```



\### 5.3 Input Validation Rules



Validation must occur at multiple levels.



\*\*File-level validation\*\*



\- Allowed file formats.

\- Maximum file size.

\- Maximum record count.

\- File integrity.

\- Malicious or unexpected file content.



\*\*Structure-level validation\*\*



\- Required column presence.

\- Valid column names or approved mappings.

\- Supported data types.

\- Expected field structure.



\*\*Record-level validation\*\*



\- Valid student reference.

\- Valid department.

\- Valid academic year.

\- Valid skill names.

\- Valid proficiency values.

\- Required field completeness.



\*\*Business-level validation\*\*



\- Student belongs to the specified department.

\- Submission belongs to the active assessment session.

\- Duplicate submission policy is respected.

\- User has permission to submit or upload the record.



Invalid records must not silently enter the analytical dataset.



\---



\## 6. Data Normalization Flow



\### 6.1 Purpose



Different collection sources may use different labels and formats for the same information.



For example:



| Raw Input | Normalized Value |

|---|---|

| Python Programming | Python |

| PYTHON | Python |

| Intermediate Level | Intermediate |

| Mid-Level | Intermediate |

| CSE Department | CSE |



Normalization converts these variations into a consistent representation.



\### 6.2 Normalization Operations



1\. Standardize field names.

2\. Normalize department identifiers.

3\. Map skill names to the approved skill taxonomy.

4\. Normalize proficiency labels.

5\. Standardize academic year values.

6\. Validate student references.

7\. Resolve duplicate records according to configured rules.

8\. Separate missing and invalid values.

9\. Produce normalized records.



\### 6.3 Skill Taxonomy



The platform should use a controlled skill taxonomy.



Illustrative hierarchy:



```text

Technology

│

├── Programming

│   ├── Python

│   ├── Java

│   └── C++

│

├── Operating Systems

│   ├── Linux

│   └── Windows

│

├── Cloud Computing

│   ├── AWS

│   ├── Azure

│   └── Google Cloud

│

├── Cybersecurity

│   ├── Network Security

│   ├── Web Security

│   └── Cloud Security

│

└── Artificial Intelligence

&#x20;   ├── Machine Learning

&#x20;   ├── Deep Learning

&#x20;   └── LLM Engineering

```



The taxonomy must be configurable rather than hardcoded into individual analytics functions.



Unknown skills should be flagged for review instead of being silently assigned to an unrelated category.



\---



\## 7. Temporary Session Data Flow



\### 7.1 Session Creation



An authorized HOD or Dean creates an assessment session according to their permissions.



A session contains:



\- Unique session identifier.

\- Session creator.

\- Department scope.

\- Assessment type.

\- Creation timestamp.

\- Expiry timestamp.

\- Session status.

\- Temporary dataset.

\- Temporary analysis results.



\### 7.2 Session Data Structure



Illustrative representation:



```text

AssessmentSession

│

├── session\_id

├── created\_by

├── department\_scope

├── session\_type

├── created\_at

├── expires\_at

├── status

│

├── temporary\_dataset

│   ├── student\_record\_001

│   ├── student\_record\_002

│   └── student\_record\_003

│

├── analytics

│   ├── proficiency\_distribution

│   ├── department\_statistics

│   └── skill\_gap\_results

│

└── recommendations

&#x20;   ├── recommended\_programs

&#x20;   └── recommendation\_reasons

```



\### 7.3 Session Storage



The initial controlled prototype may use application memory.



For a production deployment with multiple backend workers, a shared temporary storage mechanism such as Redis may be required.



Session storage must support:



\- Session lookup.

\- Dataset updates.

\- Access control.

\- Expiry.

\- Cleanup.

\- Concurrent submission handling.



A backend restart may result in loss of active in-memory sessions.



The platform must communicate this limitation rather than imply that temporary sessions are recoverable.



\---



\## 8. Skill Intelligence Data Flow



The normalized dataset is passed to the intelligence engine.



The engine processes data in four stages.



\### 8.1 Proficiency Analysis



The system evaluates the distribution of skill proficiency.



Initial proficiency categories:



\- Beginner

\- Intermediate

\- Expert



Illustrative output:



| Skill | Beginner | Intermediate | Expert |

|---|---:|---:|---:|

| Python | 40% | 45% | 15% |

| Linux | 55% | 35% | 10% |

| Networking | 30% | 50% | 20% |



The system must identify the source of proficiency information, such as self-reporting or an assessment result.



\### 8.2 Department Aggregation



The system groups records by department.



Example:



| Department | Students | Skills Identified |

|---|---:|---:|

| CSE | 250 | 18 |

| ECE | 180 | 14 |

| IT | 210 | 16 |



These values are illustrative.



Department aggregation must support:



\- Total participating students.

\- Skill frequency.

\- Proficiency distribution.

\- Skill category distribution.

\- Department-level comparisons.



\### 8.3 Skill Gap Analysis



The system compares current skill distribution against configured institutional or departmental competency targets.



Illustrative example:



| Skill | Current Distribution | Target | Identified Gap |

|---|---:|---:|---|

| Python | 45% | 75% | 30 percentage points |

| Linux | 30% | 65% | 35 percentage points |

| Cloud Computing | 20% | 60% | 40 percentage points |



The target values must be configurable.



The platform must not interpret a low percentage as a skill gap without considering:



\- Department requirements.

\- Academic year.

\- Skill relevance.

\- Target proficiency.

\- Assessment participation.

\- Available evidence.



\### 8.4 Recommendation Generation



The recommendation engine uses identified gaps to generate development suggestions.



Illustrative mapping:



| Identified Gap | Suggested Development Program |

|---|---|

| Low Python proficiency | Python programming workshop |

| Low Linux proficiency | Linux administration bootcamp |

| Low cloud competency | Cloud fundamentals training |

| Low network security competency | Network security practical workshop |

| Low LLM engineering competency | LLM development workshop |



Each recommendation should contain:



\- Identified skill gap.

\- Affected department.

\- Relevant proficiency distribution.

\- Suggested development program.

\- Reason for the recommendation.

\- Expected outcome.

\- Recommendation priority.



The recommendation engine must provide traceable reasoning rather than generating unexplained suggestions.



\---



\## 9. Dashboard Data Flow



\### 9.1 HOD Dashboard



The HOD dashboard receives authorized departmental analytics.



Data displayed:



\- Department skill distribution.

\- Department proficiency distribution.

\- Common skill gaps.

\- Underrepresented skills.

\- Development recommendations.

\- Historical comparisons only where valid historical data is available.



HODs can review the analysis and submit development proposals.



\### 9.2 Dean Dashboard



The Dean dashboard receives authorized institutional analytics.



Data displayed:



\- Overall institutional skill distribution.

\- Department-level comparison.

\- Common institutional skill gaps.

\- Departmental recommendations.

\- Submitted HOD proposals.

\- Proposal decision status.



The Dean can approve, reject, defer, or request modifications to proposals.



\### 9.3 Data Access Rules



| Data | Student | HOD | Dean | Administrator |

|---|---|---|---|---|

| Own assessment submission | Submit/view permitted status | No automatic access | No automatic access | No automatic access |

| Department aggregates | No | Authorized department | Authorized institutional scope | No automatic access |

| Institutional aggregates | No | According to permissions | Yes | No automatic access |

| Student-identifiable records | Own permitted information | Only if separately authorized | Only if separately authorized | Only if separately authorized |

| Recommendations | No | Department scope | Institutional scope | Configuration access |

| Governance proposals | No | Own department proposals | Institutional review | No automatic access |



The exact permission matrix must be finalized in `RBAC.md`.



\---



\## 10. Governance Data Flow



\### 10.1 HOD Proposal Submission



After reviewing departmental analysis, an HOD can submit a development proposal.



A proposal may contain:



\- Department.

\- Identified skill gap.

\- Proposed program.

\- Target student group.

\- Expected outcome.

\- Required resources.

\- Proposed timeline.

\- Supporting analysis.



\### 10.2 Dean Review



The Dean receives the proposal and supporting information.



Available actions:



\- Approve.

\- Reject.

\- Request modifications.

\- Defer.



\### 10.3 Governance Flow



```mermaid

sequenceDiagram

&#x20;   participant H as HOD

&#x20;   participant API as FastAPI

&#x20;   participant G as Governance Service

&#x20;   participant D as Dean



&#x20;   H->>API: Submit development proposal

&#x20;   API->>G: Validate proposal

&#x20;   G-->>API: Proposal accepted

&#x20;   API-->>H: Submission confirmation



&#x20;   D->>API: Retrieve pending proposals

&#x20;   API->>G: Retrieve authorized proposal

&#x20;   G-->>API: Proposal details

&#x20;   API-->>D: Display proposal



&#x20;   D->>API: Submit decision

&#x20;   API->>G: Process decision

&#x20;   G-->>API: Updated proposal status

&#x20;   API-->>D: Decision confirmation

```



\*\*Persistence consideration\*\*



Governance information is separate from student skill assessment data.



If proposals and decisions must remain available after the assessment session expires, a separate persistent governance store is required.



Until that decision is finalized, the architecture must not promise permanent proposal or approval history.



\---



\## 11. Export Data Flow



SSIP supports two export modes.



\### 11.1 Reports-Only Export



Purpose: Provide an institutional or departmental summary without distributing the complete underlying dataset.



Supported formats:



\- PDF.

\- Excel.

\- CSV.



Potential contents:



\- Executive summary.

\- Department skill distribution.

\- Proficiency analysis.

\- Skill gap analysis.

\- Recommendations.

\- Relevant charts and statistics.



Student-identifiable information is excluded by default.



\### 11.2 Complete Analysis Package



Purpose: Allow authorized recipients to retain the complete analysis offline.



Potential contents:



```text

SSIP\_Analysis\_Package.zip

│

├── original\_data/

│   └── original\_dataset.xlsx

│

├── normalized\_data/

│   └── normalized\_dataset.csv

│

├── analytics/

│   ├── skill\_distribution.json

│   ├── department\_analysis.json

│   └── skill\_gap\_analysis.json

│

├── recommendations/

│   └── recommendations.json

│

├── reports/

│   ├── institutional\_report.pdf

│   └── department\_report.xlsx

│

└── manifest.json

```



Package generation must respect:



\- User authorization.

\- Department scope.

\- Student data access permissions.

\- Export mode.

\- Session validity.



The system must not include original data for form-based sessions when no original file exists.



\### 11.3 Export Sequence



```mermaid

sequenceDiagram

&#x20;   participant U as Authorized User

&#x20;   participant FE as Frontend

&#x20;   participant API as FastAPI

&#x20;   participant SES as Session Manager

&#x20;   participant EXP as Export Service



&#x20;   U->>FE: Request export

&#x20;   FE->>API: Submit export request

&#x20;   API->>API: Verify permissions

&#x20;   API->>SES: Retrieve active session

&#x20;   SES-->>API: Temporary data and analytics

&#x20;   API->>EXP: Generate requested export

&#x20;   EXP-->>API: Generated file

&#x20;   API-->>FE: Secure download response

&#x20;   FE-->>U: Download file

```



\### 11.4 Download Lifecycle



The downloaded file is retained by the authorized recipient.



The server-side generated file remains temporary and must be removed according to the export expiry policy.



Deleting the server-side copy does not delete a copy already downloaded by the recipient.



\---



\## 12. Data Lifecycle and Cleanup Flow



\### 12.1 Data Lifecycle



```mermaid

flowchart TD

&#x20;   A\[Data Submitted or Uploaded]

&#x20;   B\[Temporary Ingestion]

&#x20;   C\[Validation]

&#x20;   D\[Normalization]

&#x20;   E\[Temporary Session Storage]

&#x20;   F\[Analytics]

&#x20;   G\[Dashboard]

&#x20;   H\[Export Generation]

&#x20;   I\[User Downloads File]

&#x20;   J\[Session Expiry]

&#x20;   K\[Server-Side Cleanup]



&#x20;   A --> B

&#x20;   B --> C

&#x20;   C --> D

&#x20;   D --> E

&#x20;   E --> F

&#x20;   F --> G

&#x20;   G --> H

&#x20;   H --> I

&#x20;   E --> J

&#x20;   F --> J

&#x20;   H --> J

&#x20;   J --> K

```



\### 12.2 Cleanup Responsibilities



| Data Location | Cleanup Requirement |

|---|---|

| Application memory | Release references to expired datasets |

| Redis | Expire temporary session keys |

| Upload directory | Delete temporary uploaded files |

| Export directory | Delete generated export files |

| Temporary analytics | Remove session-associated results |

| Application logs | Prevent student records from being logged; apply log retention |

| Browser memory | Clear sensitive session state where practical |

| Downloaded recipient files | Outside server control; recipient responsibility |



\### 12.3 Cleanup Triggers



Cleanup should occur through:



\- Session expiry.

\- Explicit session closure.

\- Scheduled cleanup jobs.

\- Failed processing cleanup.

\- Export file expiry.



\### 12.4 Cleanup Limitations



Removing a file or deleting an in-memory reference does not guarantee forensic erasure from every underlying storage medium.



The deployment must therefore avoid unnecessary disk writes, persistent Redis snapshots, unencrypted temporary storage, and sensitive application logging.



The platform should define and verify a data retention policy before production deployment.



\---



\## 13. Error and Exception Data Flow



The platform must handle data-processing errors without corrupting active sessions.



| Error | Expected Response |

|---|---|

| Invalid assessment submission | Reject submission and identify validation errors |

| Invalid file format | Reject upload |

| Missing required columns | Return column validation report |

| Invalid skill taxonomy value | Flag for mapping or review |

| Duplicate student submission | Apply configured duplicate policy |

| Expired session | Deny access and require a new session |

| Analytics processing failure | Report failure without falsely displaying updated results |

| Export generation failure | Return controlled error and permit authorized retry |

| Unauthorized department access | Deny access |

| Temporary storage failure | Stop unsafe processing and return controlled error |



A failed processing operation must not silently produce incomplete analytics that appear authoritative.



\---



\## 14. Data Integrity and Consistency



The platform must maintain consistency across the entire data pipeline.



\### 14.1 Record Consistency



\- A student submission must be associated with the correct assessment session.

\- Department identifiers must use the approved taxonomy.

\- Skill identifiers must map to the approved skill taxonomy.

\- Proficiency values must follow the configured classification.

\- Duplicate submissions must follow an explicit policy.



\### 14.2 Analytics Consistency



\- Department totals must match the eligible records included in the analysis.

\- Percentages must use clearly defined denominators.

\- Missing proficiency values must not be silently counted as Beginner.

\- Self-reported and evidence-based results must remain distinguishable.

\- Analytics must be refreshed when new submissions are accepted.



\### 14.3 Export Consistency



Exports must represent a consistent snapshot of the analysis.



If new submissions arrive while an export is being generated, the platform must either:



\- Generate the export from a defined snapshot; or

\- Temporarily prevent changes to the dataset during export generation.



The selected approach must be implemented consistently.



\---



\## 15. Performance and Processing Considerations



The data pipeline must be designed around the expected dataset size and available server resources.



Important factors:



\- Number of student submissions.

\- Number of skill entries per student.

\- Number of departments.

\- Number of distinct skills.

\- Upload file size.

\- Number of concurrent assessment sessions.

\- Complexity of analytics.

\- Export generation time.



Recommended implementation practices:



\- Use batch processing for large uploads.

\- Avoid unnecessary copies of large DataFrames.

\- Limit file sizes and record counts.

\- Reuse normalized data rather than repeatedly parsing raw inputs.

\- Cache derived analytics only within the session lifecycle.

\- Use background tasks for expensive export operations when required.

\- Apply resource limits to prevent memory exhaustion.



Performance targets are governed by `NON\_FUNCTIONAL\_REQUIREMENTS.md` and must be verified through load testing.



\---



\## 16. Data Flow Security Controls



| Stage | Security Control |

|---|---|

| Form submission | HTTPS, authentication or approved submission token, validation |

| File upload | File type verification, size limits, parsing safeguards |

| Normalization | Controlled taxonomy mapping and validation |

| Session storage | Session isolation, access control, expiry |

| Analytics | Department-level authorization |

| Dashboard | Backend-enforced RBAC |

| Governance | Role and department scope validation |

| Export | Explicit export authorization |

| Download | Protected temporary download mechanism |

| Cleanup | Expiry enforcement and temporary storage removal |



Security enforcement must occur in the backend. Frontend visibility controls are not a substitute for API authorization.



\---



\## 17. Data Flow Traceability



| Data Flow ID | Source | Processing | Destination |

|---|---|---|---|

| DF-001 | Student form | Validation and normalization | Temporary session |

| DF-002 | Excel/CSV upload | Parsing, validation, normalization | Temporary session |

| DF-003 | Temporary dataset | Proficiency analysis | Proficiency results |

| DF-004 | Proficiency results | Department aggregation | Department analytics |

| DF-005 | Department analytics | Skill gap analysis | Skill gap results |

| DF-006 | Skill gap results | Recommendation rules | Recommendations |

| DF-007 | Analytics | Authorization and presentation | HOD dashboard |

| DF-008 | Institutional analytics | Authorization and presentation | Dean dashboard |

| DF-009 | HOD proposal | Governance validation | Dean review |

| DF-010 | Analytics and recommendations | Report generation | Reports-only export |

| DF-011 | Authorized session data | Package generation | Complete analysis package |

| DF-012 | Expired session | Cleanup process | Deleted temporary data |



\---



\## 18. Final Data Flow Summary



SSIP follows a unified data pipeline:



1\. Student assessment forms and authorized bulk uploads provide input.

2\. The validation layer checks the integrity and correctness of incoming data.

3\. The normalization layer converts records into a common structure.

4\. The session manager maintains the dataset temporarily.

5\. The intelligence engine calculates proficiency, departmental distributions, and skill gaps.

6\. The recommendation engine generates explainable institutional development suggestions.

7\. HODs review departmental results and propose initiatives.

8\. Deans review institutional results and make governance decisions.

9\. Authorized users generate reports-only exports or complete analysis packages.

10\. The cleanup service removes expired server-side temporary data.



\*\*Core data flow principle:\*\*



> Ingest through multiple channels. Normalize into one structure. Process within temporary sessions. Convert data into institutional intelligence. Export with authorization. Remove temporary data according to policy.

