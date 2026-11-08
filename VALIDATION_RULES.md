\# VALIDATION\_RULES.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Specification  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the validation rules applied to all data entering and moving through the Student Skill Intelligence Platform.



Validation ensures that:

\- Student submissions contain acceptable and meaningful information.

\- Uploaded datasets follow supported formats and structures.

\- Skill names are mapped consistently to the approved skill taxonomy.

\- Proficiency inputs follow the defined proficiency framework.

\- Duplicate, incomplete, invalid, and inconsistent records are handled predictably.

\- Invalid data does not enter the Skill Analysis Engine.

\- Restricted student information is handled according to the platform's privacy and retention requirements.



Validation must be performed on the backend. Frontend validation improves usability but must never be treated as the security boundary.



\## 2. Validation Architecture



Validation is applied at multiple stages.



| Stage | Validation responsibility |

|---|---|

| Request validation | Validate API request structure and data types |

| Authentication validation | Verify the requesting user's identity |

| Authorization validation | Verify access to the requested operation and session |

| Session validation | Check session existence, ownership, status, and expiry |

| File validation | Verify file type, size, structure, and safety |

| Record validation | Validate individual student records |

| Skill validation | Validate skill names and taxonomy mappings |

| Proficiency validation | Validate proficiency inputs and evidence |

| Dataset validation | Detect inconsistencies across the complete dataset |

| Analysis readiness | Determine whether validated data can enter analysis |



\### 2.1 Validation Pipeline



```text

Incoming Request

&#x20;      |

&#x20;      v

Authentication and Authorization

&#x20;      |

&#x20;      v

Session Validation

&#x20;      |

&#x20;      v

Input / File Validation

&#x20;      |

&#x20;      v

Record-Level Validation

&#x20;      |

&#x20;      v

Skill and Proficiency Validation

&#x20;      |

&#x20;      v

Dataset-Level Validation

&#x20;      |

&#x20;      v

Validation Result

&#x20;      |

&#x20;      +------ Invalid / Rejected

&#x20;      |

&#x20;      +------ Valid with Warnings

&#x20;      |

&#x20;      +------ Valid for Processing

&#x20;                   |

&#x20;                   v

&#x20;            Data Normalization

&#x20;                   |

&#x20;                   v

&#x20;            Analysis Readiness

```



\## 3. General Validation Principles



1\. Every input must be validated on the backend.

2\. Validation rules must be consistent across form submissions and bulk uploads.

3\. Both input channels must produce the same normalized internal data structure.

4\. Invalid data must not silently enter analytical calculations.

5\. Missing information must not be interpreted as zero proficiency.

6\. Unknown skills must not be automatically classified as known taxonomy entries without a valid mapping.

7\. Validation warnings must remain distinguishable from validation errors.

8\. Validation results must identify the affected record and field wherever possible.

9\. Validation must not expose sensitive student information through error messages.

10\. Validation must respect session status and data-retention rules.



\## 4. Validation Severity Levels



| Severity | Meaning | Expected behavior |

|---|---|---|

| ERROR | Data violates a mandatory rule | Reject affected record or request |

| WARNING | Data is accepted but requires attention | Accept with warning where permitted |

| INFO | Informational observation | Accept and report |

| SECURITY | Potentially malicious or unsafe input | Reject or block according to security policy |



\### 4.1 Record-Level Outcomes



Each submitted record should receive one of the following outcomes:



\- \*\*ACCEPTED:\*\* All mandatory validation rules passed.

\- \*\*ACCEPTED\_WITH\_WARNINGS:\*\* Mandatory rules passed, but non-blocking issues were detected.

\- \*\*REJECTED:\*\* One or more blocking validation rules failed.

\- \*\*PENDING\_REVIEW:\*\* A permitted skill mapping or evidence-related decision requires authorized review.



A rejected record must not contribute to skill distribution, proficiency distribution, coverage, or gap calculations.



\## 5. Assessment Session Validation



Before accepting submissions or processing uploaded data, the platform must validate the assessment session.



| Rule ID | Validation rule | Expected behavior |

|---|---|---|

| SES-001 | Session ID must exist | Reject unknown session |

| SES-002 | Session must not be expired | Reject expired session |

| SES-003 | Session must accept the requested input channel | Reject unsupported submission type |

| SES-004 | Session must be in an accepting state | Reject closed or completed sessions |

| SES-005 | User must be authorized for the session | Reject unauthorized access |

| SES-006 | Department scope must match the user's permissions | Reject unauthorized department access |

| SES-007 | Submission deadline must not have passed | Reject late submissions unless explicitly permitted |

| SES-008 | Session must have valid configuration | Reject processing when required configuration is missing |



\### 5.1 Session Status Rules



| Session state | Accept new submissions | Permit analysis |

|---|---:|---:|

| CREATED | No | No |

| SCHEDULED | No | No |

| ACTIVE | Yes | When sufficient valid data exists |

| PROCESSING | No, unless a specifically designed concurrent workflow permits it | No new analysis |

| COMPLETED | No | Existing results may be viewed within the session's permitted lifetime |

| CLOSED | No | Existing results may be viewed within the session's permitted lifetime |

| EXPIRED | No | No |

| CLEANING | No | No |

| CLEANED | No | No |

| FAILED | No | No |



The exact transitions and reopening permissions must follow `SESSION\_MANAGEMENT.md`.



\## 6. Student Assessment Form Validation



\### 6.1 Required Fields



The following fields are proposed for a standard assessment submission.



| Field | Required | Validation |

|---|---|---|

| Student reference | Yes | Must follow the configured identification strategy |

| Department | Yes | Must match an authorized department |

| Programme / specialization | Conditional | Must match configured academic data when enabled |

| Skill selection | Yes | At least one valid skill |

| Proficiency input | Yes, per selected skill | Must match permitted input values |

| Evidence information | Conditional | Required only when the assessment method demands it |

| Additional comments | No | Length and content restrictions apply |



The final identity strategy remains an open decision. The platform must not assume that a permanent student roll number is stored in assessment records.



\### 6.2 Field Validation Rules



| Rule ID | Field | Rule |

|---|---|---|

| FRM-001 | Student reference | Cannot be empty |

| FRM-002 | Student reference | Must follow configured format |

| FRM-003 | Department | Must reference a valid department |

| FRM-004 | Programme | Must belong to the selected department where applicable |

| FRM-005 | Skill | At least one skill must be selected |

| FRM-006 | Skill | Selected skill must exist in the taxonomy or enter an approved review process |

| FRM-007 | Proficiency input | Must be an allowed value |

| FRM-008 | Evidence | Must satisfy the applicable evidence requirements |

| FRM-009 | Comments | Must not exceed configured length |

| FRM-010 | Submission | Must be associated with an active session |



\### 6.3 Empty and Missing Values



\- Required fields cannot be null, empty, or whitespace-only.

\- Optional fields may remain null.

\- Missing proficiency information must not be converted into Beginner.

\- Missing evidence must not be treated as rejected evidence.

\- Missing department information must not be inferred from unrelated fields.

\- Invalid optional values should be reported rather than silently accepted.



\## 7. Bulk Upload Validation



Bulk upload validation applies to Excel and CSV files.



\### 7.1 Supported Formats



| Format | Extension | Support |

|---|---|---|

| Microsoft Excel | `.xlsx` | Supported |

| Comma-separated values | `.csv` | Supported |

| Legacy Excel | `.xls` | Not supported initially |

| Macro-enabled Excel | `.xlsm` | Not supported initially |

| PDF | `.pdf` | Not supported as a dataset |



File extensions alone are insufficient to establish file validity. The backend must inspect file content and use appropriate parsers.



\### 7.2 File-Level Validation



| Rule ID | Validation rule | Expected behavior |

|---|---|---|

| UPL-001 | File extension must be supported | Reject unsupported format |

| UPL-002 | File content must match the expected format | Reject mismatched or invalid content |

| UPL-003 | File must not be empty | Reject empty file |

| UPL-004 | File size must not exceed configured limit | Reject oversized file |

| UPL-005 | File must be readable by the selected parser | Reject corrupted file |

| UPL-006 | File must not contain malicious content | Reject or quarantine according to security policy |

| UPL-007 | Workbook must contain an identifiable data worksheet | Reject when no valid worksheet exists |

| UPL-008 | CSV encoding must be supported | Reject or request a supported encoding |

| UPL-009 | CSV delimiter must be identifiable or explicitly configured | Reject ambiguous structure |

| UPL-010 | File must not contain unsupported formula-dependent data | Report or reject according to import policy |



\### 7.3 Spreadsheet Structure Validation



The uploaded dataset must contain the mandatory columns required for processing.



Proposed logical columns:



| Column | Requirement |

|---|---|

| Student Reference | Mandatory |

| Department | Mandatory |

| Skill | Mandatory |

| Proficiency Input | Mandatory |

| Programme | Conditional |

| Evidence Source | Conditional |

| Evidence Status | Conditional |

| Assessment Date | Conditional |



The upload interface should provide a column-mapping mechanism when the source spreadsheet uses different header names.



Example:



| Uploaded column | Mapped platform field |

|---|---|

| Roll No | Student Reference |

| Branch | Department |

| Technical Skill | Skill |

| Level | Proficiency Input |



Column mapping must be explicit or based on an approved, unambiguous mapping rule. The platform must not guess mappings when multiple interpretations are possible.



\### 7.4 Row-Level Validation



Every data row must be validated independently.



| Rule ID | Validation rule | Expected behavior |

|---|---|---|

| ROW-001 | Mandatory values must exist | Reject incomplete row |

| ROW-002 | Student reference must be valid | Reject invalid reference |

| ROW-003 | Department must be recognized | Reject or route for authorized mapping |

| ROW-004 | Skill must be recognized or reviewed | Reject or mark pending review |

| ROW-005 | Proficiency input must be valid | Reject invalid value |

| ROW-006 | Evidence fields must be internally consistent | Reject or flag inconsistency |

| ROW-007 | Date values must be valid where required | Reject invalid date |

| ROW-008 | Unexpected values must be reported | Warning or rejection according to field rules |

| ROW-009 | Duplicate records must follow the configured duplicate policy | Apply the approved policy |

| ROW-010 | Invalid rows must not enter normalization | Exclude from valid processing |



\### 7.5 Dataset-Level Validation



The platform must inspect the dataset as a whole for:



\- Duplicate student references.

\- Conflicting department assignments.

\- Conflicting values for the same student and skill.

\- Invalid department names.

\- Inconsistent skill naming.

\- Unusually high numbers of missing values.

\- Empty or irrelevant columns.

\- Unexpected record counts.

\- Unsupported data structures.



Dataset-level validation must distinguish between an individual invalid row and a dataset-wide issue that prevents reliable processing.



\### 7.6 Partial Import Policy



The platform should support a validation preview before import.



The preview should display:

\- Total rows detected.

\- Valid rows.

\- Valid rows with warnings.

\- Rejected rows.

\- Duplicate rows.

\- Unknown skills.

\- Invalid departments.

\- Missing mandatory values.

\- Validation error summaries.



\*\*Proposed behavior:\*\* permit partial import when valid records can be safely separated from rejected records. The user must see the validation summary before confirming import.



A dataset-wide structural or security failure must block the entire import.



Final approval of partial import behavior remains an implementation decision.



\## 8. Skill Taxonomy Validation



All skill data must be validated against `SKILL\_TAXONOMY.md`.



\### 8.1 Skill Validation Rules



| Rule ID | Validation rule | Expected behavior |

|---|---|---|

| SKL-001 | Skill name must not be empty | Reject |

| SKL-002 | Skill must map to a valid taxonomy entry | Accept or route for review |

| SKL-003 | Skill must reference an active taxonomy entry | Reject inactive entries for new submissions |

| SKL-004 | Skill aliases must resolve unambiguously | Accept valid alias |

| SKL-005 | Ambiguous skill names must not be mapped automatically | Require review |

| SKL-006 | Department relevance must be evaluated | Flag irrelevant or unmapped combinations |

| SKL-007 | Duplicate skill entries must follow normalization rules | Consolidate where safe |

| SKL-008 | Unknown skills must be preserved for review | Do not silently discard |



\### 8.2 Unknown Skill Handling



When a student or uploaded dataset contains a skill not found in the taxonomy:



1\. Preserve the original submitted skill name in the temporary session.

2\. Attempt matching against approved aliases.

3\. If a unique match exists, map it to the canonical skill.

4\. If no match exists, mark it as `UNKNOWN\_SKILL`.

5\. If multiple possible matches exist, mark it as `AMBIGUOUS\_SKILL`.

6\. Route the entry to an authorized taxonomy reviewer.

7\. Do not include unresolved skills in taxonomy-based analytics.



Taxonomy administrators may approve new skills or aliases through the configured governance process.



\### 8.3 Skill Normalization



Examples:



| Submitted value | Canonical skill |

|---|---|

| Python Programming | Python |

| Py | Python, only if approved as an alias |

| Linux Administration | Linux Administration |

| Docker | Docker |

| K8s | Kubernetes, only if approved as an alias |



Text similarity alone must not be treated as proof that two skills are equivalent.



\## 9. Proficiency Validation



Validation must follow `PROFICIENCY\_FRAMEWORK.md`.



\### 9.1 Allowed Proficiency Levels



\- BEGINNER

\- INTERMEDIATE

\- EXPERT



The platform may accept additional input formats, such as numeric scores, only when a configured conversion rule exists.



\### 9.2 Proficiency Input Rules



| Rule ID | Validation rule | Expected behavior |

|---|---|---|

| PRF-001 | Proficiency input must be present when required | Reject incomplete record |

| PRF-002 | Input must match an allowed level or configured score range | Reject invalid value |

| PRF-003 | Numeric score must be within the configured range | Reject out-of-range score |

| PRF-004 | Score conversion must use the active framework version | Reject unsupported conversion |

| PRF-005 | Missing score must not become zero automatically | Preserve as missing |

| PRF-006 | Self-reported level must retain its source classification | Do not mark as verified |

| PRF-007 | Expert classification must satisfy applicable evidence requirements | Require sufficient evidence |

| PRF-008 | Conflicting evidence must be flagged | Route for review |



\### 9.3 Evidence Validation



Evidence sources may include:

\- Self-reported information.

\- Practical assessment.

\- Project evidence.

\- Certification evidence.

\- Faculty verification.



Evidence status may include:

\- SELF\_REPORTED

\- EVIDENCE\_SUBMITTED

\- UNDER\_REVIEW

\- VERIFIED

\- REJECTED

\- NOT\_AVAILABLE



Validation must ensure that the evidence source and evidence status are compatible.



Examples:



| Evidence source | Evidence status | Validation |

|---|---|---|

| Self-reported | Self-reported | Valid |

| Project | Evidence submitted | Valid |

| Certification | Under review | Valid |

| Faculty verification | Verified | Valid when reviewer authorization exists |

| No evidence | Verified | Invalid unless an approved verification method supports it |



A self-reported Expert level must not automatically become verified Expert proficiency.



\### 9.4 Threshold Validation



The current proposed numerical framework is:



| Score | Classification |

|---|---|

| 0–39 | Beginner |

| 40–74 | Intermediate |

| 75–100 | Expert |



These thresholds are provisional and must be configurable.



The platform must:

\- Validate that the score falls within the configured range.

\- Use the framework version applicable to the assessment.

\- Avoid silently changing historical classifications when thresholds change.

\- Preserve the distinction between submitted proficiency and calculated classification.



\## 10. Department and Academic Data Validation



Department data must follow the configured university organizational structure.



| Rule ID | Validation rule | Expected behavior |

|---|---|---|

| DEP-001 | Department must exist | Reject unknown department |

| DEP-002 | Department must be active | Reject inactive department for new submissions |

| DEP-003 | Programme must belong to the selected department | Reject inconsistent mapping |

| DEP-004 | User must have access to the department | Reject unauthorized access |

| DEP-005 | Skill relevance must be checked against department mapping | Flag unexpected combinations |

| DEP-006 | Department names must resolve to canonical identifiers | Normalize approved aliases |



A department must not be inferred from a student's skill selections.



Department-level analytics must use the configured department identifier, not arbitrary uploaded text.



\## 11. Duplicate Validation



Duplicate detection must be applied to both form submissions and bulk uploads.



\### 11.1 Duplicate Detection Dimensions



Potential duplicate combinations include:



\- Same student reference and same session.

\- Same student reference and same skill.

\- Same student reference, skill, and assessment method.

\- Same source file row imported more than once.

\- Repeated form submission within the same session.



\### 11.2 Duplicate Policy



The final duplicate handling policy is not yet approved.



Possible policies:



| Policy | Description |

|---|---|

| REJECT\_DUPLICATE | Reject subsequent matching submissions |

| ALLOW\_REVISION | Accept a new version while retaining the previous version temporarily |

| LATEST\_WINS | Use the latest valid submission |

| REQUIRE\_REVIEW | Flag conflicting submissions for authorized review |



\*\*Proposed default:\*\* `ALLOW\_REVISION`, subject to approval.



The system must not merge conflicting proficiency values automatically.



Duplicate detection must distinguish between:

\- Exact duplicate records.

\- Updated submissions.

\- Different assessment methods.

\- Conflicting evidence.

\- Multiple valid skill records for the same student.



\## 12. Data Normalization Validation



After validation, accepted data must be normalized into the common internal structure.



\### 12.1 Normalization Rules



\- Trim leading and trailing whitespace.

\- Normalize supported text representations.

\- Resolve approved department aliases.

\- Resolve approved skill aliases.

\- Convert accepted proficiency inputs to canonical values.

\- Normalize dates and timestamps.

\- Preserve original submitted values where required for traceability within the temporary session.

\- Generate temporary internal references where necessary.

\- Keep missing values as null.

\- Preserve evidence source and evidence status separately.



\### 12.2 Canonical Data Representation



A normalized assessment record should conceptually contain:



```json

{

&#x20; "temporary\_student\_reference": "TEMP-001",

&#x20; "department\_id": "DEPT-001",

&#x20; "skill\_id": "SKILL-001",

&#x20; "proficiency\_input": "INTERMEDIATE",

&#x20; "classified\_level": null,

&#x20; "evidence\_source": "SELF\_REPORTED",

&#x20; "evidence\_status": "SELF\_REPORTED",

&#x20; "source\_type": "FORM",

&#x20; "validation\_status": "ACCEPTED"

}

```



This is an illustrative structure, not a finalized database schema.



\## 13. Analysis Readiness Validation



A validated dataset is not automatically ready for analysis.



Before analysis begins, the platform must check:



1\. At least one valid assessment record exists.

2\. Mandatory fields are normalized.

3\. Department identifiers are valid.

4\. Skill identifiers are valid.

5\. Proficiency inputs follow the active framework.

6\. Rejected records are excluded.

7\. Unresolved skills are excluded from taxonomy-based calculations.

8\. Dataset revision is identified.

9\. Taxonomy version is identified.

10\. Proficiency framework version is identified.

11\. The analysis configuration is valid.

12\. Applicable privacy thresholds are satisfied.



\### 13.1 Analysis Readiness Outcomes



| Outcome | Meaning |

|---|---|

| READY | Dataset can enter analysis |

| READY\_WITH\_WARNINGS | Dataset can enter analysis with documented limitations |

| BLOCKED | Mandatory requirements are not satisfied |

| NO\_VALID\_DATA | No usable records remain |



The Skill Analysis Engine must not process rejected records.



\## 14. Export Validation



Export requests must be validated before generation.



| Rule ID | Validation rule | Expected behavior |

|---|---|---|

| EXP-001 | Exporting user must be authenticated | Reject unauthenticated request |

| EXP-002 | User must have export permission | Reject unauthorized request |

| EXP-003 | User must have access to the requested session | Reject unauthorized session access |

| EXP-004 | Requested export mode must be supported | Reject unsupported mode |

| EXP-005 | Requested format must be supported | Reject unsupported format |

| EXP-006 | Identifiable data must require separate authorization | Reject unauthorized identifiable export |

| EXP-007 | Session and export snapshot must be valid | Reject unavailable data |

| EXP-008 | Export must respect privacy thresholds | Suppress or reject restricted output |

| EXP-009 | Export file must pass integrity validation | Reject corrupted output |

| EXP-010 | Export must follow configured expiry rules | Reject expired export |



Export validation must follow `EXPORT\_ARCHITECTURE.md` and `ACCESS\_CONTROL.md`.



\## 15. Security Validation



All incoming data must be treated as untrusted.



\### 15.1 Input Security



\- Prevent SQL injection through parameterized database operations and ORM safeguards.

\- Prevent cross-site scripting through safe output encoding.

\- Validate request schemas and reject unexpected fields where appropriate.

\- Apply request size limits.

\- Apply rate limits to sensitive endpoints.

\- Reject malformed JSON and unsupported content types.

\- Avoid exposing internal exception details to users.



\### 15.2 File Security



\- Validate actual file content rather than relying only on extension.

\- Reject unsupported file types.

\- Limit file size, worksheet count, row count, and column count through configuration.

\- Store uploaded files outside publicly accessible directories.

\- Generate server-controlled filenames.

\- Prevent path traversal.

\- Do not execute spreadsheet macros or embedded content.

\- Apply malware scanning where available and operationally justified.

\- Clean temporary files after processing and expiry.



\### 15.3 Authorization Security



\- Validate permissions on every protected backend operation.

\- Enforce department-level and institutional-level scope.

\- Do not rely on frontend-hidden controls.

\- Prevent users from accessing another session by changing its identifier.

\- Apply separate permissions for student-identifiable exports.



\## 16. Validation Error Response



The API should return structured validation errors.



Example:



```json

{

&#x20; "success": false,

&#x20; "error": {

&#x20;   "code": "VALIDATION\_FAILED",

&#x20;   "message": "The uploaded dataset contains invalid records.",

&#x20;   "details": \[

&#x20;     {

&#x20;       "rule\_id": "ROW-005",

&#x20;       "record\_reference": "ROW-12",

&#x20;       "field": "proficiency\_input",

&#x20;       "severity": "ERROR",

&#x20;       "message": "Unsupported proficiency value."

&#x20;     }

&#x20;   ]

&#x20; }

}

```



\### 16.1 Error Response Requirements



\- Provide a stable error code.

\- Identify the affected field or record where possible.

\- Include the validation rule identifier.

\- Avoid exposing sensitive student information.

\- Avoid returning stack traces or internal implementation details.

\- Provide actionable correction guidance.

\- Support downloadable validation reports where appropriate.



\## 17. Validation Report



Every bulk upload validation operation should produce a validation report.



\### Required report fields



| Field | Description |

|---|---|

| Session ID | Associated assessment session |

| Upload ID | Temporary upload reference |

| Total records | Number of detected records |

| Accepted records | Records accepted without warnings |

| Warning records | Records accepted with warnings |

| Rejected records | Records rejected |

| Duplicate records | Records identified as duplicates |

| Unknown skills | Skills requiring taxonomy review |

| Invalid departments | Department mapping failures |

| Validation timestamp | Time validation completed |

| Rule-set version | Version of validation rules applied |



Validation reports must follow the session's retention policy and must not become permanent student-level records.



\## 18. Validation Configuration



The following values should be configurable rather than hardcoded:



\- Maximum upload file size.

\- Maximum row count.

\- Maximum column count.

\- Supported file formats.

\- Required upload columns.

\- Allowed proficiency inputs.

\- Proficiency score thresholds.

\- Duplicate handling policy.

\- Accepted date formats.

\- Department aliases.

\- Skill aliases.

\- Evidence requirements.

\- Minimum dataset size.

\- Privacy suppression thresholds.

\- Session submission deadlines.



Configuration changes must be versioned where they affect analytical outcomes or reproducibility.



\## 19. Validation Audit and Logging



The platform may record operational validation metadata, including:



\- Validation operation identifier.

\- Session reference.

\- Validation rule-set version.

\- Validation result counts.

\- Timestamp.

\- Requesting user's authorized identifier.

\- Processing outcome.

\- Error category.



Logs must not contain:

\- Full student assessment records.

\- Student-identifiable values unless explicitly approved.

\- Uploaded file contents.

\- Authentication secrets.

\- Sensitive evidence content.



Validation logs must follow the retention and privacy requirements in `DATA\_PRIVACY\_AND\_RETENTION.md`.



\## 20. Testing Requirements



Validation rules must be covered by automated tests.



\### 20.1 Form Tests

\- Missing mandatory fields.

\- Invalid student reference.

\- Invalid department.

\- Empty skill selection.

\- Unsupported proficiency value.

\- Invalid evidence combination.

\- Submission to expired session.

\- Unauthorized submission.



\### 20.2 Upload Tests

\- Valid XLSX file.

\- Valid CSV file.

\- Empty file.

\- Corrupted file.

\- Unsupported extension.

\- File-content mismatch.

\- Missing columns.

\- Duplicate headers.

\- Invalid row values.

\- Unknown skills.

\- Invalid departments.

\- Duplicate student-skill records.

\- Oversized file.

\- Excessive row count.

\- Malicious filename.

\- Formula-containing spreadsheet.



\### 20.3 Analysis Readiness Tests

\- Dataset with valid records.

\- Dataset with warnings.

\- Dataset with no valid records.

\- Dataset containing unresolved skills.

\- Dataset with missing proficiency.

\- Dataset with inconsistent department mappings.

\- Dataset using an outdated taxonomy version.



\### 20.4 Security Tests

\- Unauthorized upload.

\- Cross-department data access.

\- Session ID manipulation.

\- Path traversal attempts.

\- Malformed file uploads.

\- Excessive request sizes.

\- Export permission bypass.

\- Sensitive data leakage through error responses.



\## 21. Acceptance Criteria



The validation system is acceptable for release when:



1\. All mandatory form fields are validated.

2\. Bulk upload formats are validated using file content and structure.

3\. Invalid records are excluded from analysis.

4\. Warnings and errors are distinguishable.

5\. Unknown skills are not silently mapped.

6\. Proficiency values follow the active framework.

7\. Self-reported proficiency is not represented as verified competency.

8\. Duplicate records follow the configured policy.

9\. Session expiry blocks new submissions.

10\. Unauthorized users cannot submit or access restricted data.

11\. Validation results are available to authorized users.

12\. Validation reports respect temporary data-retention rules.

13\. Export requests undergo authorization and privacy validation.

14\. Automated tests cover critical validation and security rules.



\## 22. Related Documents



| Document | Relationship |

|---|---|

| PROJECT\_OVERVIEW.md | Product purpose and overall scope |

| FUNCTIONAL\_REQUIREMENTS.md | Functional behavior |

| SESSION\_MANAGEMENT.md | Session lifecycle and submission windows |

| DATA\_DICTIONARY.md | Field definitions and data types |

| SKILL\_TAXONOMY.md | Canonical skill structure |

| PROFICIENCY\_FRAMEWORK.md | Proficiency and evidence classification |

| SKILL\_ANALYSIS\_ENGINE.md | Analytical processing |

| ACCESS\_CONTROL.md | Authorization rules |

| SECURITY\_ARCHITECTURE.md | Security controls |

| DATA\_PRIVACY\_AND\_RETENTION.md | Data handling and deletion |

| EXPORT\_ARCHITECTURE.md | Export validation and generation |

| API\_DOCUMENTATION.md | API request and response contracts |

| TESTING\_STRATEGY.md | Test coverage and release criteria |



\## 23. Open Decisions



The following decisions must be finalized before implementation:



1\. \*\*Student identity:\*\* Permanent roll number, temporary reference, or session-scoped mapping.

2\. \*\*Duplicate policy:\*\* Reject, allow revision, latest wins, or manual review.

3\. \*\*Partial imports:\*\* Whether valid records can be imported when other rows fail.

4\. \*\*Upload limits:\*\* Maximum file size, records, columns, and worksheets.

5\. \*\*Required columns:\*\* Final mandatory and conditional upload fields.

6\. \*\*Unknown skills:\*\* Who can approve new taxonomy entries and aliases.

7\. \*\*Proficiency assessment:\*\* Which assessment methods are mandatory or optional.

8\. \*\*Evidence requirements:\*\* What evidence is required for each proficiency classification.

9\. \*\*Department structure:\*\* Final university department and programme hierarchy.

10\. \*\*Privacy thresholds:\*\* Minimum group size for displaying departmental analytics.

11\. \*\*Validation rule versioning:\*\* How rule changes affect existing sessions.

12\. \*\*File security:\*\* Whether malware scanning is mandatory and which service will provide it.



\---



\*\*Document status:\*\* Proposed Specification — Version 1.0



\*\*Implementation principle:\*\* No invalid or unauthorized data should enter the analytical pipeline. Validation must preserve the distinction between missing information, unverified claims, invalid records, and demonstrated proficiency.

