\# EXPORT\_ARCHITECTURE.md



\*\*Document Version:\*\* 1.0  

\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Module:\*\* Export Management  

\*\*Status:\*\* Proposed  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the export architecture of the Student Skill Intelligence Platform.



The Export Module enables authorized users to download assessment analysis, departmental skill intelligence, institutional summaries, and recommendation reports for offline use.



It establishes:



\- Supported export modes and formats.

\- Export generation workflows.

\- Data selection and packaging.

\- Export authorization.

\- Report generation.

\- File storage and download management.

\- Temporary export retention.

\- Data privacy and security.

\- Export validation and error handling.

\- Integration with analytical and recommendation modules.



The Export Module must provide reliable offline access to analytical information without introducing permanent student assessment storage.



\## 2. Export Architecture Objectives



The module must:



1\. Generate downloadable analytical reports.

2\. Support multiple export formats.

3\. Support complete analysis packages.

4\. Preserve the relationship between exports and their source assessment sessions.

5\. Generate exports from consistent analytical snapshots.

6\. Apply role-based and resource-level authorization.

7\. Exclude identifiable student information by default.

8\. Support explicitly authorized identifiable-data exports.

9\. Store generated files temporarily.

10\. Automatically expire and delete temporary exports.

11\. Provide export status and metadata.

12\. Maintain consistency between dashboard results and downloaded reports.



\## 3. Export Architecture Overview



The Export Module operates after assessment processing and analytical computation.



\### 3.1 High-level architecture



```text

&#x20;         Assessment Session

&#x20;                 |

&#x20;                 v

&#x20;         Skill Analysis Engine

&#x20;                 |

&#x20;                 v

&#x20;        Skill Gap Analysis

&#x20;                 |

&#x20;                 v

&#x20;        Recommendation Engine

&#x20;                 |

&#x20;                 v

&#x20;          Export Request

&#x20;                 |

&#x20;                 v

&#x20;       Authorization Validation

&#x20;                 |

&#x20;                 v

&#x20;         Export Configuration

&#x20;                 |

&#x20;                 v

&#x20;         Snapshot Validation

&#x20;                 |

&#x20;                 v

&#x20;          Data Preparation

&#x20;                 |

&#x20;         +-------+--------+

&#x20;         |                |

&#x20;         v                v

&#x20;    Reports-Only     Complete Package

&#x20;         |                |

&#x20;         v                v

&#x20;    PDF / XLSX / CSV  ZIP Generation

&#x20;         |                |

&#x20;         +-------+--------+

&#x20;                 |

&#x20;                 v

&#x20;          File Validation

&#x20;                 |

&#x20;                 v

&#x20;        Temporary File Storage

&#x20;                 |

&#x20;                 v

&#x20;         Secure Download API

&#x20;                 |

&#x20;                 v

&#x20;           Export Expiry

&#x20;                 |

&#x20;                 v

&#x20;            File Cleanup

```



\### 3.2 Architectural responsibilities



The Export Module is responsible for:



\- Receiving export requests.

\- Validating authorization.

\- Selecting permitted data.

\- Preparing export content.

\- Generating files.

\- Validating generated files.

\- Managing temporary file references.

\- Providing download access.

\- Expiring and deleting temporary exports.



It must not independently calculate skill proficiency, skill gaps, or recommendations.



Those responsibilities belong to their respective analytical modules.



\## 4. Export Modes



The platform supports two primary export modes.



\### 4.1 Reports-Only Mode



This mode generates reports containing analytical summaries.



Supported formats:



\- PDF.

\- Excel (`.xlsx`).

\- CSV (`.csv`).



Potential contents:



\- Assessment session summary.

\- Departmental skill distribution.

\- Institutional skill distribution.

\- Proficiency distribution.

\- Skill coverage analysis.

\- Skill-gap analysis.

\- Recommendation summaries.

\- Analytical observations.

\- Export metadata.



Student-identifiable information is excluded by default.



\### 4.2 Complete Analysis Package



This mode generates a ZIP archive containing the permitted components of an assessment session.



Potential contents:



\- Original uploaded dataset, where applicable.

\- Normalized assessment data.

\- Skill analysis results.

\- Skill-gap results.

\- Recommendation results.

\- Analytical JSON.

\- PDF reports.

\- Excel reports.

\- CSV summaries.

\- Export manifest.



The package must represent one consistent analysis revision.



\### 4.3 Export Mode Comparison



| Feature | Reports-only | Complete analysis |

|---|---|---|

| PDF report | Yes | Optional included report |

| Excel report | Yes | Optional included report |

| CSV report | Yes | Optional included report |

| Original uploaded file | No | Where applicable and authorized |

| Normalized dataset | No by default | Where applicable and authorized |

| Analysis JSON | No by default | Yes |

| Skill-gap JSON | No by default | Yes |

| Recommendation data | Summary | Detailed permitted output |

| ZIP archive | No | Yes |

| Student identifiers | Excluded by default | Excluded by default; separate authorization required |



\## 5. Export Formats



\### 5.1 PDF



PDF is intended for formal institutional reports and offline reading.



Suggested contents:



\- Report title.

\- Institution name and approved branding.

\- Assessment session information.

\- Executive summary.

\- Skill distribution.

\- Proficiency distribution.

\- Department comparisons, where authorized.

\- Skill-gap findings.

\- Recommendations.

\- Methodology and interpretation notes.

\- Data limitations.

\- Report generation metadata.



Technology:



`ReportLab`



\### 5.2 Excel



Excel is intended for further offline analysis.



Suggested worksheets:



| Worksheet | Contents |

|---|---|

| Overview | Assessment summary |

| Skill Distribution | Skill counts and coverage |

| Proficiency | Proficiency classifications |

| Department Analysis | Departmental metrics |

| Skill Gaps | Identified target deviations |

| Recommendations | Generated development recommendations |

| Metadata | Session and analysis information |



Technology:



`OpenPyXL`



Spreadsheet cells containing untrusted text must be protected against formula injection.



\### 5.3 CSV



CSV is intended for interoperability and external data analysis.



Potential files:



\- `skill\_distribution.csv`

\- `proficiency\_distribution.csv`

\- `department\_analysis.csv`

\- `skill\_gaps.csv`

\- `recommendations.csv`



CSV exports should use consistent:



\- Column names.

\- Encoding.

\- Delimiters.

\- Numeric representations.

\- Date formats.

\- Missing-value representations.



\### 5.4 ZIP



ZIP is the container format for complete analysis packages.



Technology:



Python standard library `zipfile`.



The ZIP must contain only approved files associated with the selected assessment session and analysis revision.



\## 6. Export Data Sources



The Export Module consumes outputs from existing platform modules.



| Source module | Export information |

|---|---|

| Session Management | Session metadata |

| Assessment Collection | Permitted assessment records |

| Upload Module | Original uploaded files and validation metadata |

| Skill Taxonomy | Skill names, domains, and categories |

| Proficiency Framework | Classification definitions |

| Skill Analysis Engine | Skill distribution and analytical metrics |

| Skill Gap Analysis | Target deviations and gap findings |

| Recommendation Engine | Recommendation results |

| Governance Module | Permitted proposal and decision information |



The Export Module must use validated outputs rather than independently recalculating analytical metrics.



\## 7. Export Request Workflow



\### 7.1 Request Initiation



An authorized user selects:



\- Assessment session.

\- Export mode.

\- Output format.

\- Analysis revision.

\- Required report sections.

\- Optional package contents, where applicable.



The frontend submits the request to the backend.



\### 7.2 Authorization Validation



The backend checks:



1\. User authentication.

2\. Export permission.

3\. Department or institutional scope.

4\. Session accessibility.

5\. Analysis revision validity.

6\. Export mode authorization.

7\. Data classification.

8\. Identifiable-data authorization, where applicable.



Unauthorized requests must be rejected before data preparation.



\### 7.3 Export Configuration



The backend creates an export configuration describing the requested content.



Example:



```json

{

&#x20; "export\_mode": "COMPLETE\_ANALYSIS",

&#x20; "format": "ZIP",

&#x20; "include\_original\_upload": true,

&#x20; "include\_normalized\_data": true,

&#x20; "include\_analysis\_json": true,

&#x20; "include\_recommendations": true,

&#x20; "include\_identifiable\_data": false

}

```



This is an illustrative request structure. The backend must validate each option independently.



\### 7.4 Snapshot Validation



The export must use a consistent source snapshot.



The system must verify:



\- Session identity.

\- Analysis revision.

\- Source dataset revision.

\- Taxonomy version.

\- Proficiency framework version.

\- Recommendation rule version, where applicable.

\- Completion status of required processing operations.



If the requested revision is unavailable or incomplete, export generation must be rejected or clearly marked as partial according to the approved policy.



\### 7.5 Data Preparation



The module retrieves permitted information and prepares it for the selected format.



\### 7.6 File Generation



The appropriate generator creates the PDF, Excel, CSV, or ZIP file.



\### 7.7 File Validation



The generated file is checked for:



\- Expected file type.

\- Successful generation.

\- Valid file structure.

\- Expected contents.

\- Correct analysis revision.

\- Data classification restrictions.

\- Absence of prohibited sensitive information.



\### 7.8 Temporary Storage



The generated file is stored in a protected temporary location.



\### 7.9 Download



The authorized user retrieves the file through a protected download endpoint.



\### 7.10 Expiry and Cleanup



The export expires according to its configured retention policy.



The file and its download reference are deleted or invalidated.



\## 8. Export Package Structure



The complete analysis package should use a consistent directory structure.



\### 8.1 Proposed ZIP Structure



```text

SSIP\_Analysis\_Export/

│

├── manifest.json

│

├── source\_data/

│   └── original\_upload.xlsx

│

├── normalized\_data/

│   ├── normalized\_dataset.csv

│   └── normalization\_summary.json

│

├── analytics/

│   ├── skill\_distribution.json

│   ├── proficiency\_analysis.json

│   ├── department\_analysis.json

│   └── analysis\_metadata.json

│

├── skill\_gaps/

│   └── skill\_gap\_analysis.json

│

├── recommendations/

│   ├── recommendations.json

│   └── recommendation\_summary.json

│

└── reports/

&#x20;   ├── skill\_intelligence\_report.pdf

&#x20;   ├── skill\_analysis.xlsx

&#x20;   └── skill\_summary.csv

```



This is a proposed package structure.



Directories and files should be included only when the relevant information exists and the requester is authorized to export it.



For example:



\- Form-only sessions do not contain an original uploaded dataset.

\- A session without completed gap analysis must not contain a fabricated gap report.

\- Optional identifiable data must not be included by default.



\## 9. Export Manifest



Every complete analysis package must include a manifest.



The manifest identifies the contents and source information of the package.



\### 9.1 Manifest Example



```json

{

&#x20; "export\_id": "EXP-001",

&#x20; "project": "Student Skill Intelligence Platform",

&#x20; "session\_id": "SES-001",

&#x20; "analysis\_id": "ANL-001",

&#x20; "analysis\_revision": 1,

&#x20; "session\_type": "COMBINED",

&#x20; "export\_mode": "COMPLETE\_ANALYSIS",

&#x20; "generated\_at": "2026-11-07T10:00:00Z",

&#x20; "taxonomy\_version": "1.0",

&#x20; "proficiency\_framework\_version": "1.0",

&#x20; "recommendation\_rule\_version": "1.0",

&#x20; "identifiable\_data\_included": false,

&#x20; "files": \[

&#x20;   {

&#x20;     "path": "analytics/skill\_distribution.json",

&#x20;     "format": "JSON"

&#x20;   },

&#x20;   {

&#x20;     "path": "reports/skill\_intelligence\_report.pdf",

&#x20;     "format": "PDF"

&#x20;   }

&#x20; ]

}

```



The manifest should also include file sizes and cryptographic checksums where practical.



A SHA-256 checksum can be used to verify file integrity.



The manifest must not contain unnecessary personal information.



\## 10. Reports-Only Content Design



Reports should provide a consistent interpretation of analytical findings.



\### 10.1 Report Sections



\*\*A. Report Overview\*\*



\- Report title.

\- Institution or department.

\- Session reference.

\- Report generation date.

\- Analysis revision.



\*\*B. Assessment Summary\*\*



\- Total submissions.

\- Valid submissions.

\- Invalid submissions, where appropriate.

\- Departments covered.

\- Processing status.



\*\*C. Skill Distribution\*\*



\- Skill names.

\- Skill counts.

\- Coverage percentages.

\- Domain distribution.



\*\*D. Proficiency Analysis\*\*



\- Beginner distribution.

\- Intermediate distribution.

\- Expert distribution.

\- Evidence classification summaries, where applicable.



\*\*E. Department Analysis\*\*



\- Departmental skill coverage.

\- Relevant skill distributions.

\- Authorized comparisons.



\*\*F. Skill-Gap Analysis\*\*



\- Current coverage.

\- Configured target.

\- Identified gap.

\- Applicable relevance classification.



\*\*G. Recommendations\*\*



\- Recommendation title.

\- Initiative category.

\- Priority.

\- Justification.

\- Supporting analytical information.



\*\*H. Methodology and Limitations\*\*



\- Proficiency framework version.

\- Analysis revision.

\- Taxonomy version.

\- Assessment participation limitations.

\- Missing data limitations.

\- Interpretation notes.



The report must distinguish self-reported proficiency from assessed or verified proficiency.



\## 11. Data Privacy and Export Restrictions



Export generation is a sensitive operation because it creates portable copies of institutional information.



\### 11.1 Default Data Policy



The default export must exclude:



\- Student names.

\- Personal contact information.

\- Student identifiers.

\- Directly identifiable evidence.

\- Unnecessary individual-level assessment records.



Aggregated analytical information should be preferred.



\### 11.2 Identifiable Data Export



If the institution requires identifiable information in an export:



\- A separate permission must be required.

\- The user must have an authorized institutional purpose.

\- Resource scope must be validated.

\- The requested fields must be explicitly selected or approved.

\- The export action must be logged.

\- The file must receive the same temporary storage and expiry protections.



Administrator privileges alone must not automatically grant access to identifiable student exports.



\### 11.3 Small-Group Privacy



Even aggregated reports can expose individuals when groups are very small.



The export module must respect configured minimum group-size thresholds.



Where the threshold is not satisfied, the affected breakdown should be suppressed, combined appropriately, or flagged.



Threshold values require institutional approval.



\## 12. Role-Based Export Permissions



| Export operation | Administrator | Dean | HOD | Student |

|---|---|---|---|---|

| Departmental PDF | No by default | Authorized | Assigned department | No |

| Departmental Excel | No by default | Authorized | Assigned department | No |

| Departmental CSV | No by default | Authorized | Assigned department | No |

| Institutional PDF | No by default | Yes | No | No |

| Institutional Excel | No by default | Yes | No | No |

| Institutional CSV | No by default | Yes | No | No |

| Complete departmental ZIP | No by default | Authorized | Authorized department | No |

| Complete institutional ZIP | No by default | Authorized | No by default | No |

| Identifiable data export | Explicit authorization | Explicit authorization | Explicit authorization | Own permitted information only |



The actual authorization decision must be based on permission, resource scope, data classification, and applicable institutional policy.



\## 13. Export Storage Architecture



\### 13.1 Storage Requirements



Generated exports must be stored temporarily.



Possible storage options:



\- Protected local filesystem.

\- Temporary object storage, if later introduced.

\- Other approved temporary storage infrastructure.



The initial implementation may use a protected local filesystem directory on the backend server.



\### 13.2 Proposed Directory Structure



```text

backend/

└── storage/

&#x20;   └── temporary\_exports/

&#x20;       ├── EXP-001/

&#x20;       │   └── analysis.zip

&#x20;       │

&#x20;       ├── EXP-002/

&#x20;       │   └── report.pdf

&#x20;       │

&#x20;       └── EXP-003/

&#x20;           └── analysis.xlsx

```



This directory must:



\- Remain outside the public web root.

\- Have restricted filesystem permissions.

\- Be accessible only to the required backend process.

\- Be excluded from prohibited persistent backups.

\- Be monitored by cleanup operations.



\### 13.3 Storage Metadata



The application should maintain temporary metadata for each export.



Suggested fields:



| Field | Description |

|---|---|

| export\_id | Unique export identifier |

| session\_id | Source assessment session |

| analysis\_id | Source analysis |

| analysis\_revision | Source analysis revision |

| requested\_by | Requesting user |

| export\_mode | Reports-only or complete analysis |

| file\_format | PDF, XLSX, CSV, ZIP |

| storage\_reference | Internal file reference |

| export\_status | Generation status |

| generated\_at | Generation timestamp |

| expires\_at | Expiry timestamp |

| file\_size | Generated file size |

| download\_count | Number of authorized downloads |



This metadata is temporary and must follow the approved export-retention policy.



If a separate persistent audit record is required, it must contain only approved metadata and be governed independently.



\## 14. Export Lifecycle



\### 14.1 Export States



| Status | Description |

|---|---|

| REQUESTED | Export request received |

| VALIDATING | Authorization and configuration checks |

| QUEUED | Waiting for processing |

| PROCESSING | File generation in progress |

| VALIDATING\_FILE | Generated file being checked |

| READY | Export available for download |

| FAILED | Export generation failed |

| EXPIRED | Export passed its expiry time |

| CLEANING | File deletion in progress |

| DELETED | Temporary file removed |



\### 14.2 Lifecycle Diagram



```text

REQUESTED

&#x20;   |

&#x20;   v

VALIDATING

&#x20;   |

&#x20;   v

QUEUED

&#x20;   |

&#x20;   v

PROCESSING

&#x20;   |

&#x20;   v

VALIDATING\_FILE

&#x20;   |

&#x20;   +------> FAILED

&#x20;   |

&#x20;   v

READY

&#x20;   |

&#x20;   v

EXPIRED

&#x20;   |

&#x20;   v

CLEANING

&#x20;   |

&#x20;   v

DELETED

```



The backend must validate all state transitions.



An export must not become downloadable before file validation is complete.



\## 15. Export Expiry and Cleanup



\### 15.1 Expiry Policy



Every export must have an explicit expiry timestamp.



The expiry policy must be configurable by authorized administrators according to institutional approval.



Export expiry is independent of:



\- Assessment collection deadline.

\- Session access expiry.

\- Assessment data retention.

\- Security audit retention.



The implementation must define whether an export may remain available after its source session expires. This must be an explicit policy decision, not an accidental side effect.



\### 15.2 Cleanup Requirements



Cleanup must remove:



\- Generated PDF files.

\- Generated Excel files.

\- Generated CSV files.

\- ZIP packages.

\- Temporary download references.

\- Expired export metadata where no longer required.



\### 15.3 Cleanup Process



```text

Export Expiry Detected

&#x20;        |

&#x20;        v

Block Download Access

&#x20;        |

&#x20;        v

Locate Generated File

&#x20;        |

&#x20;        v

Delete Temporary File

&#x20;        |

&#x20;        v

Invalidate Download Reference

&#x20;        |

&#x20;        v

Verify File Unavailability

&#x20;        |

&#x20;        v

Mark Export DELETED

```



\### 15.4 Cleanup Reliability



\- Cleanup must be automated.

\- Cleanup must be idempotent.

\- Failed deletion must be retried safely.

\- Cleanup failures must generate alerts.

\- Expired files must not remain accessible through old URLs.

\- Cleanup must not affect unrelated exports.



Deleting an application file does not guarantee forensic erasure from every underlying storage medium.



\## 16. Export API Requirements



The following endpoints extend the API architecture defined in `API\_DOCUMENTATION.md`.



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/api/v1/sessions/{session\_id}/exports` | Generate export |

| GET | `/api/v1/exports/{export\_id}` | Retrieve export metadata |

| GET | `/api/v1/exports/{export\_id}/status` | Retrieve export status |

| GET | `/api/v1/exports/{export\_id}/download` | Download generated file |

| DELETE | `/api/v1/exports/{export\_id}` | Delete eligible temporary export |

| GET | `/api/v1/sessions/{session\_id}/exports` | List authorized session exports |



\### 16.1 Generate Export Request



```json

{

&#x20; "export\_mode": "REPORTS\_ONLY",

&#x20; "format": "PDF",

&#x20; "analysis\_revision": 1,

&#x20; "include\_student\_identifiers": false,

&#x20; "sections": \[

&#x20;   "OVERVIEW",

&#x20;   "SKILL\_DISTRIBUTION",

&#x20;   "PROFICIENCY",

&#x20;   "SKILL\_GAPS",

&#x20;   "RECOMMENDATIONS"

&#x20; ]

}

```



\### 16.2 Complete Package Request



```json

{

&#x20; "export\_mode": "COMPLETE\_ANALYSIS",

&#x20; "format": "ZIP",

&#x20; "analysis\_revision": 1,

&#x20; "include\_original\_upload": true,

&#x20; "include\_normalized\_data": true,

&#x20; "include\_analysis\_json": true,

&#x20; "include\_recommendations": true,

&#x20; "include\_identifiable\_data": false

}

```



\### 16.3 Export Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "export\_id": "EXP-001",

&#x20;   "export\_status": "PROCESSING",

&#x20;   "format": "ZIP",

&#x20;   "expires\_at": "2026-11-07T18:00:00Z"

&#x20; }

}

```



All examples are illustrative. Actual values must be obtained from validated session and policy configuration.



\## 17. Backend Implementation Architecture



Suggested module structure:



```text

backend/

└── app/

&#x20;   └── modules/

&#x20;       └── exports/

&#x20;           ├── \_\_init\_\_.py

&#x20;           ├── router.py

&#x20;           ├── schemas.py

&#x20;           ├── models.py

&#x20;           ├── service.py

&#x20;           ├── repository.py

&#x20;           ├── authorization.py

&#x20;           ├── data\_collector.py

&#x20;           ├── snapshot\_manager.py

&#x20;           ├── report\_builder.py

&#x20;           ├── pdf\_generator.py

&#x20;           ├── excel\_generator.py

&#x20;           ├── csv\_generator.py

&#x20;           ├── zip\_generator.py

&#x20;           ├── manifest\_builder.py

&#x20;           ├── file\_validator.py

&#x20;           ├── storage\_manager.py

&#x20;           ├── download\_manager.py

&#x20;           ├── expiry\_manager.py

&#x20;           └── cleanup\_service.py

```



\### 17.1 Component Responsibilities



| Component | Responsibility |

|---|---|

| router.py | Export API endpoints |

| schemas.py | Request and response validation |

| models.py | Export metadata structures |

| service.py | Coordinates export generation |

| repository.py | Temporary export metadata access |

| authorization.py | Export permission and scope validation |

| data\_collector.py | Retrieves approved export inputs |

| snapshot\_manager.py | Ensures source revision consistency |

| report\_builder.py | Prepares report content |

| pdf\_generator.py | Generates PDF |

| excel\_generator.py | Generates Excel |

| csv\_generator.py | Generates CSV |

| zip\_generator.py | Packages complete analysis |

| manifest\_builder.py | Generates package manifest |

| file\_validator.py | Validates generated files |

| storage\_manager.py | Manages temporary file storage |

| download\_manager.py | Controls secure downloads |

| expiry\_manager.py | Determines export expiry |

| cleanup\_service.py | Deletes expired temporary files |



These components belong to the existing modular monolith. They are not separate microservices.



\## 18. Processing and Performance



Export generation may be resource-intensive, especially for large datasets.



\### 18.1 Processing Strategy



Small reports may be generated within a normal request if they complete within configured limits.



Large exports should use asynchronous processing.



Proposed workflow:



```text

Export Request

&#x20;     |

&#x20;     v

Validate Request

&#x20;     |

&#x20;     v

Create Export Job

&#x20;     |

&#x20;     v

Return Export ID

&#x20;     |

&#x20;     v

Background Generation

&#x20;     |

&#x20;     v

File Validation

&#x20;     |

&#x20;     v

Mark Export READY

&#x20;     |

&#x20;     v

Download

```



\### 18.2 Resource Controls



The module should enforce:



\- Maximum export file size.

\- Maximum rows per export.

\- Maximum concurrent export jobs.

\- Maximum ZIP package size.

\- Processing time limits.

\- Memory limits.

\- Download rate limits where required.



The actual values must be benchmarked against the production hosting environment.



\### 18.3 Partial Export Handling



If one component fails during ZIP generation:



\- Do not silently omit it.

\- Record the failure.

\- Mark the package as failed or explicitly partial according to an approved policy.

\- Report missing components in the manifest if partial packages are supported.



The initial implementation should prefer failing the complete package over presenting an incomplete package as complete.



\## 19. Export Integrity and Consistency



Exports must preserve analytical consistency.



\### 19.1 Revision Tracking



Each export should reference:



\- Session ID.

\- Source dataset revision.

\- Analysis ID.

\- Analysis revision.

\- Taxonomy version.

\- Proficiency framework version.

\- Recommendation rule version, where applicable.



\### 19.2 File Integrity



The system may calculate SHA-256 checksums for generated package contents.



This supports integrity verification and helps identify unexpected file changes.



\### 19.3 Dashboard Consistency



The export must represent the same validated analytical revision selected by the user.



If the session changes during export generation, the module must either:



\- Continue using the validated snapshot; or

\- Reject and request regeneration against the new revision.



It must not silently combine outputs from different revisions.



\## 20. Security Requirements



The Export Module must implement the following controls.



\### 20.1 Authorization



\- Authenticate the requesting user.

\- Verify the relevant export permission.

\- Validate department or institutional scope.

\- Validate session access.

\- Validate requested content categories.

\- Apply identifiable-data restrictions.



\### 20.2 File Security



\- Store files outside public directories.

\- Use unpredictable export identifiers.

\- Restrict filesystem permissions.

\- Prevent path traversal.

\- Prevent direct public file access.

\- Validate file generation.

\- Enforce expiry.



\### 20.3 Data Security



\- Exclude identifiable data by default.

\- Avoid logging export contents.

\- Avoid exposing internal storage paths.

\- Protect downloaded information through HTTPS.

\- Apply small-group privacy restrictions.

\- Prevent unauthorized export enumeration.



\### 20.4 Spreadsheet Security



Excel and CSV generation must neutralize untrusted formula-like cell values where appropriate.



This includes values beginning with spreadsheet formula-triggering characters.



\### 20.5 Auditability



The system should record:



\- Export requester.

\- Export identifier.

\- Source session.

\- Analysis revision.

\- Export mode.

\- Format.

\- Timestamp.

\- Generation result.

\- Download events.

\- Expiry and cleanup outcome.



Audit logs must not contain unnecessary student assessment information.



\## 21. Error Handling



| Scenario | Expected behavior |

|---|---|

| User lacks export permission | Reject request |

| Session unavailable | Reject request |

| Session expired | Deny export access |

| Analysis incomplete | Reject or report unavailable analysis |

| Requested revision unavailable | Reject request |

| Identifiable data not authorized | Reject or exclude restricted content |

| Unsupported format | Return validation error |

| Export exceeds size limit | Reject or stop generation |

| File generation failure | Mark export failed |

| ZIP component missing | Fail complete package unless partial mode is explicitly supported |

| Storage unavailable | Report processing failure |

| Export expired | Deny download |

| Cleanup failure | Record and retry deletion |



Errors must not expose sensitive data or internal storage details.



\## 22. Testing Requirements



\### 22.1 Functional Tests



\- PDF generation.

\- Excel generation.

\- CSV generation.

\- ZIP package generation.

\- Manifest generation.

\- Export metadata retrieval.

\- Download.

\- Expiry.

\- Cleanup.



\### 22.2 Data Consistency Tests



\- Correct session association.

\- Correct analysis revision.

\- Correct taxonomy version.

\- Correct proficiency framework version.

\- Correct recommendation rule version.

\- No cross-session data mixing.

\- No fabricated original-upload file in form-only sessions.



\### 22.3 Privacy Tests



\- Identifiable data excluded by default.

\- Unauthorized users cannot export data.

\- HODs cannot export unrelated departmental information.

\- Small-group privacy restrictions are applied.

\- Prohibited assessment information is not retained in persistent backups.



\### 22.4 Security Tests



\- Direct file URL access.

\- Export identifier manipulation.

\- Unauthorized download.

\- Expired export access.

\- Path traversal.

\- Spreadsheet formula injection.

\- Export enumeration.

\- Resource exhaustion through repeated export requests.



\### 22.5 Cleanup Tests



\- Expired files are deleted.

\- Download references are invalidated.

\- Cleanup is idempotent.

\- Failed cleanup is detected.

\- Unrelated exports remain unaffected.



\## 23. Acceptance Criteria



The Export Module is acceptable when:



1\. Both export modes are supported.

2\. PDF, Excel, CSV, and ZIP generation work.

3\. Reports contain validated analytical information.

4\. Complete packages contain only permitted session data.

5\. Form-only sessions do not fabricate original uploaded files.

6\. Every export references its source analysis revision.

7\. Export permissions are enforced.

8\. Identifiable information is excluded by default.

9\. Generated files are stored temporarily.

10\. Download access is protected.

11\. Exports expire according to approved configuration.

12\. Cleanup removes temporary files and references.

13\. Export generation does not mix different analytical revisions.

14\. File integrity and package contents are validated.

15\. Export failures are reported clearly.

16\. Download and cleanup operations are auditable.



\## 24. Open Decisions



| Decision | Current position |

|---|---|

| Default report format | PDF is the proposed default |

| Default export mode | Reports-only is the proposed default |

| Export expiry duration | Pending institutional approval |

| Maximum export size | Pending benchmarking |

| Maximum rows | Pending benchmarking |

| Maximum concurrent export jobs | Pending benchmarking |

| Partial ZIP package support | Not recommended initially |

| Identifiable-data export authority | Institutional policy required |

| Small-group suppression threshold | Pending approval |

| Export storage mechanism | Protected local filesystem initially |

| Object storage integration | Future consideration |

| Background job framework | Pending workload assessment |

| Export persistence after session expiry | Must be explicitly defined |

| Download count limits | Pending |

| Export audit retention | Separate policy required |



\## 25. Final Architectural Position



The Export Module provides controlled offline access to the platform's analytical outputs.



It supports:



\- Reports-only exports.

\- Complete analysis packages.

\- PDF, Excel, CSV, and ZIP formats.

\- Consistent analysis snapshots.

\- Protected temporary storage.

\- Authorized downloads.

\- Independent export expiry.

\- Automated cleanup.



The module must preserve the platform's central data-retention policy.



Student assessment information must not become permanently stored merely because it has been included in an export-generation workflow.



\*\*Core export principle: Generate only authorized information, preserve analytical consistency, protect every generated file, and remove server-side exports when their approved retention period ends.\*\*

