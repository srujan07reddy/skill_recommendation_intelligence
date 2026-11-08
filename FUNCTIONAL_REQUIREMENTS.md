\# FUNCTIONAL REQUIREMENTS

\## Student Skill Intelligence Platform (SSIP)



\*\*Document:\*\* FUNCTIONAL\_REQUIREMENTS.md  

\*\*Version:\*\* 1.0  

\*\*Status:\*\* Initial Development Specification  

\*\*Priority Convention:\*\* Must Have (M), Should Have (S), Could Have (C)



\---



\# 1. Introduction



\## 1.1 Purpose



This document defines the functional requirements of the Student Skill Intelligence Platform (SSIP).



It specifies the expected behaviour of the application's modules, user interactions, data processing operations, analytical capabilities, recommendation mechanisms and export functionality.



Every functional requirement must be independently identifiable, implementable and testable.



\## 1.2 System Overview



SSIP is a browser-accessible university skill intelligence application that collects student skill information through structured assessment forms and bulk dataset uploads.



The application temporarily processes the collected information, analyses departmental skill distributions, identifies competency gaps and generates recommendations for institutional skill development initiatives.



The application provides interactive dashboards to authorized university officials and supports two export modes:



1\. Reports-only export.

2\. Complete analysis package export.



The application must not maintain permanent student skill assessment records.



\---



\# 2. Authentication and Access Management



\## FR-AUTH-001: User Authentication



\*\*Priority:\*\* Must Have



The system shall allow authorized users to authenticate before accessing protected application functionality.



Supported roles:



\- Student

\- Faculty / Mentor

\- HOD

\- Dean

\- Admin



\*\*Expected behaviour:\*\*

\- Verify user credentials or university authentication tokens.

\- Establish an authenticated session.

\- Reject invalid authentication attempts.

\- Prevent unauthorized access to protected routes.



\## FR-AUTH-002: Role-Based Authorization



\*\*Priority:\*\* Must Have



The system shall enforce role-based permissions on all protected backend operations.



| Role | Authorized functionality |

|---|---|

| Student | Access and submit assigned skill assessments |

| Faculty / Mentor | Review authorized student submissions |

| HOD | Access assigned departmental analysis |

| Dean | Access authorized institutional analysis and program approvals |

| Admin | Manage application configuration and permissions |



Frontend restrictions alone shall not be considered sufficient authorization.



\## FR-AUTH-003: Department-Level Access



The system shall restrict HOD access to their assigned departments.



Deans shall access only the departments within their authorized institutional scope.



\## FR-AUTH-004: Secure Session Handling



The system shall manage authenticated user sessions independently of temporary skill analysis sessions.



Authentication sessions and analysis sessions must have separate expiration and security policies.



\---



\# 3. Student Skill Assessment



\## FR-ASSESS-001: Assessment Form Access



\*\*Priority:\*\* Must Have



The system shall provide students with access to an authorized skill assessment form.



Students must be associated with the appropriate assessment session and academic department.



\## FR-ASSESS-002: Student Information Collection



The form shall support the collection of necessary academic identification information.



Potential fields include:



\- Student identifier.

\- Student name.

\- Academic department.

\- Academic year.

\- Academic batch.



Only fields necessary for assessment and analysis should be collected.



\## FR-ASSESS-003: Skill Information Collection



The form shall allow students to submit multiple skills.



Supported skill categories shall include:



\- Programming languages.

\- Technical skills.

\- Domain-specific skills.

\- Tools and technologies.

\- Professional competencies.

\- Practical experience.



\## FR-ASSESS-004: Proficiency Selection



Each submitted skill shall support an individual proficiency selection.



Supported levels:



\- Beginner.

\- Intermediate.

\- Expert.



\## FR-ASSESS-005: Supporting Experience



The form should allow students to provide supporting information such as:



\- Projects.

\- Internships.

\- Certifications.

\- Practical exercises.

\- Relevant experience.



\## FR-ASSESS-006: Submission Validation



The system shall validate required fields before accepting submissions.



It shall identify:



\- Missing required information.

\- Invalid proficiency values.

\- Invalid skill categories.

\- Malformed input.

\- Duplicate skill entries within the same submission.



\## FR-ASSESS-007: Submission Confirmation



After successful submission, the application shall display a confirmation message.



The system shall prevent accidental duplicate submissions where the assessment policy requires one submission per student per session.



\## FR-ASSESS-008: Submission Tracking



Authorized assessment administrators shall be able to view submission counts and collection progress without exposing unnecessary student information.



\---



\# 4. Assessment Session Management



\## FR-SESSION-001: Session Creation



\*\*Priority:\*\* Must Have



Authorized HODs and Deans shall be able to create assessment collection sessions.



Each session shall contain:



\- Unique session identifier.

\- Academic period.

\- Department scope.

\- Assessment configuration.

\- Creation timestamp.

\- Expiration configuration.

\- Session status.



\## FR-SESSION-002: Session Activation



The system shall allow authorized users to activate or deactivate assessment collection sessions.



Students shall only be able to submit information to active sessions for which they are authorized.



\## FR-SESSION-003: Session Isolation



Every assessment and analysis session shall maintain an isolated data context.



Information belonging to one session must not be accessible through another session.



\## FR-SESSION-004: Session Status



The application shall support the following session states:



\- Created.

\- Active.

\- Collecting.

\- Processing.

\- Analysis Ready.

\- Expired.

\- Cleared.



\## FR-SESSION-005: Session Expiration



The system shall automatically expire sessions according to configured retention policies.



\## FR-SESSION-006: Temporary Data Cleanup



When a session expires or is explicitly cleared, the system shall remove its associated temporary student assessment data and generated server-side files.



\## FR-SESSION-007: Session Recovery Behaviour



The initial implementation shall not guarantee recovery of temporary analysis data following an unexpected backend restart.



The application shall inform users when an active session becomes unavailable.



\---



\# 5. Bulk Data Upload



\## FR-UPLOAD-001: File Upload



\*\*Priority:\*\* Must Have



Authorized users shall be able to upload student skill datasets.



Supported formats:



\- Excel (.xlsx)

\- CSV (.csv)



\## FR-UPLOAD-002: File Validation



The system shall inspect uploaded files for:



\- Supported file extension.

\- Valid file content.

\- File size restrictions.

\- Readability.

\- Required columns.

\- Expected data types.



\## FR-UPLOAD-003: Column Mapping



The application shall allow authorized users to map uploaded columns to the internal data structure.



Example:



| Uploaded column | Internal field |

|---|---|

| Roll No | student\_id |

| Student Name | student\_name |

| Branch | department |

| Skill | skill\_name |

| Level | proficiency\_level |



\## FR-UPLOAD-004: Data Preview



Before processing, the application shall display a preview of the uploaded dataset.



The preview shall include:



\- Total rows.

\- Identified columns.

\- Missing values.

\- Duplicate records.

\- Invalid records.

\- Valid records.



\## FR-UPLOAD-005: Error Reporting



The application shall identify rejected records and provide row-level validation messages.



Invalid records must not be silently discarded.



\## FR-UPLOAD-006: Import Confirmation



The user shall review the validation summary and explicitly confirm processing.



\## FR-UPLOAD-007: Upload Source Tracking



The system shall distinguish uploaded records from student-form submissions within the active analysis session.



\---



\# 6. Data Normalization



\## FR-NORM-001: Unified Internal Structure



\*\*Priority:\*\* Must Have



All accepted records from student forms and bulk uploads shall be converted into a common internal data structure.



\## FR-NORM-002: Department Normalization



The system shall map department names to approved department identifiers or canonical names.



\## FR-NORM-003: Skill Normalization



The system shall normalize skill names using the configured skill taxonomy.



Example:



\- Python

\- python

\- PYTHON



These should map to the same canonical skill.



\## FR-NORM-004: Duplicate Detection



The system shall identify duplicate student-skill records within the same assessment context.



Duplicate handling shall follow configured rules and preserve relevant validation information.



\## FR-NORM-005: Source Identification



Each normalized record shall retain its source classification:



\- Student assessment.

\- Bulk upload.

\- Authorized validation or correction.



\---



\# 7. Skill Taxonomy Management



\## FR-TAX-001: Skill Categories



\*\*Priority:\*\* Must Have



The system shall organize skills into standardized categories.



\## FR-TAX-002: Skill Catalogue



Authorized administrators shall be able to configure:



\- Skill names.

\- Skill categories.

\- Related skills.

\- Prerequisite skills.

\- Skill descriptions.



\## FR-TAX-003: Skill Matching



The application shall match submitted skill names against the configured taxonomy.



Unrecognized skills shall be flagged for review rather than silently assigned to an unrelated category.



\## FR-TAX-004: Skill Relationships



The system should support relationships between skills to identify logical learning progression paths.



\---



\# 8. Proficiency Analysis



\## FR-PROF-001: Proficiency Classification



\*\*Priority:\*\* Must Have



Every accepted student-skill record shall have a proficiency classification.



Supported levels:



\- Beginner.

\- Intermediate.

\- Expert.



\## FR-PROF-002: Proficiency Distribution



The system shall calculate the number and percentage of students at each proficiency level for every analysed skill.



\## FR-PROF-003: Proficiency Validation



The application shall distinguish between:



\- Self-reported proficiency.

\- Evidence-supported proficiency.

\- Independently validated proficiency.



\## FR-PROF-004: Proficiency Analysis



The application shall generate department-level proficiency distributions and identify skills with comparatively low proficiency.



The system shall not automatically treat self-reported proficiency as verified competency.



\---



\# 9. Departmental Skill Intelligence



\## FR-INTEL-001: Department Aggregation



\*\*Priority:\*\* Must Have



The application shall aggregate student skill information by academic department.



\## FR-INTEL-002: Student Distribution



The dashboard shall display:



\- Total students analysed.

\- Students with submitted assessments.

\- Number of unique skills identified.

\- Skill category distribution.



\## FR-INTEL-003: Skill Distribution



The application shall calculate the number and percentage of students reporting each skill.



\## FR-INTEL-004: Department Comparison



Authorized users shall be able to compare skill distributions across departments within their access scope.



\## FR-INTEL-005: Academic Period Filtering



The dashboard shall support filtering by academic year, batch and assessment session where such information exists in the source data.



\## FR-INTEL-006: Interactive Filtering



Users shall be able to filter analytical results by:



\- Department.

\- Skill category.

\- Individual skill.

\- Proficiency level.

\- Academic period.

\- Data source.



\## FR-INTEL-007: Analytical Accuracy



All displayed statistics shall be calculated from the active dataset.



The system shall not use hardcoded or fabricated dashboard statistics.



\---



\# 10. Skill Gap Analysis



\## FR-GAP-001: Gap Identification



\*\*Priority:\*\* Must Have



The system shall identify skills with underdeveloped proficiency distributions or insufficient departmental coverage.



\## FR-GAP-002: Departmental Gap Analysis



The application shall calculate skill deficiencies at the department level.



\## FR-GAP-003: Gap Measurement



Each identified gap shall include:



\- Skill name.

\- Department.

\- Affected student count.

\- Affected student percentage.

\- Current proficiency distribution.

\- Gap identification criteria.



\## FR-GAP-004: Gap Prioritization



The system should prioritize gaps using configurable criteria.



Potential factors:



\- Number of affected students.

\- Severity of proficiency deficiency.

\- Academic relevance.

\- Industry relevance.

\- Existing curriculum coverage.

\- Development feasibility.



\## FR-GAP-005: Gap Explanation



The system shall provide a clear explanation of why a particular skill has been identified as a departmental development requirement.



\---



\# 11. Recommendation Engine



\## FR-REC-001: Recommendation Generation



\*\*Priority:\*\* Must Have



The application shall generate departmental development recommendations based on identified skill gaps.



\## FR-REC-002: Recommendation Categories



Supported recommendations shall include:



\- Technical workshops.

\- Bootcamps.

\- Certification programs.

\- Seminars.

\- Practical laboratory training.

\- Industry-oriented training.

\- Interdisciplinary development programs.



\## FR-REC-003: Recommendation Details



Every recommendation shall contain:



\- Recommendation identifier.

\- Target department.

\- Identified skill gap.

\- Suggested program.

\- Target student group.

\- Target proficiency.

\- Reason for recommendation.

\- Expected learning outcome.

\- Suggested priority.



\## FR-REC-004: Explainable Recommendations



The system shall provide the analytical reasoning behind each recommendation.



\## FR-REC-005: Prerequisite Validation



The recommendation engine should consider prerequisite skills when suggesting advanced development programs.



\## FR-REC-006: Recommendation Prioritization



Recommendations shall be ranked according to configured priority criteria.



\## FR-REC-007: Configurable Rules



Authorized administrators shall be able to maintain recommendation rules and skill progression relationships.



\## FR-REC-008: Human Review



Generated recommendations shall be treated as decision-support suggestions rather than automatically approved institutional programs.



\---



\# 12. HOD Dashboard



\## FR-HOD-001: Department Overview



\*\*Priority:\*\* Must Have



HODs shall be able to access analytical information for their authorized departments.



\## FR-HOD-002: Skill Analytics



The dashboard shall display departmental skill distribution and proficiency statistics.



\## FR-HOD-003: Skill Gap Review



HODs shall be able to review identified departmental competency gaps.



\## FR-HOD-004: Recommendation Review



HODs shall be able to review generated development recommendations.



\## FR-HOD-005: Program Proposal



The application should allow HODs to prepare and submit development program proposals to the authorized Dean.



A proposal shall include:



\- Proposed program.

\- Target skills.

\- Target students.

\- Expected outcomes.

\- Proposed duration.

\- Resource requirements.

\- Supporting analysis.



\---



\# 13. Dean Dashboard



\## FR-DEAN-001: Institutional Overview



\*\*Priority:\*\* Must Have



Deans shall be able to view consolidated analytics for their authorized institutional scope.



\## FR-DEAN-002: Department Comparison



The dashboard shall support comparison of skill distributions across authorized departments.



\## FR-DEAN-003: Institutional Skill Gaps



The system shall identify common skill deficiencies across departments.



\## FR-DEAN-004: Recommendation Review



Deans shall be able to review system-generated recommendations and HOD proposals.



\## FR-DEAN-005: Program Decision



Authorized Deans shall be able to:



\- Approve.

\- Reject.

\- Request modifications.

\- Defer a proposal.



\## FR-DEAN-006: Decision Recording



The system shall record the decision, authorized user, timestamp and relevant session reference.



Approval records shall remain temporary unless an explicitly approved separate governance record-retention mechanism is introduced.



\## FR-DEAN-007: Export Access



Deans shall be able to download authorized reports and complete analysis packages.



\---



\# 14. Live Analytics Dashboard



\## FR-DASH-001: Interactive Visualization



\*\*Priority:\*\* Must Have



The application shall present analytical results through interactive charts and tables.



\## FR-DASH-002: Skill Distribution Charts



The dashboard shall visualize departmental skill coverage.



\## FR-DASH-003: Proficiency Charts



The dashboard shall display Beginner, Intermediate and Expert distributions.



\## FR-DASH-004: Gap Visualization



The application shall highlight identified competency deficiencies.



\## FR-DASH-005: Recommendation Visualization



The dashboard shall present prioritized development recommendations.



\## FR-DASH-006: Live Session Status



Users shall be able to view the current assessment or analysis session status.



\## FR-DASH-007: Filter Synchronization



Changing dashboard filters shall update all relevant visualizations and analytical summaries consistently.



\---



\# 15. Export Engine



\## FR-EXPORT-001: Export Centre



\*\*Priority:\*\* Must Have



The application shall provide a dedicated export interface.



\## FR-EXPORT-002: Reports-Only Export



The application shall generate reports containing aggregated analytical information.



Supported formats:



\- PDF.

\- Excel.

\- CSV.



\## FR-EXPORT-003: Complete Analysis Package



The application shall generate a ZIP archive containing:



\- Original source dataset, where applicable.

\- Normalized records.

\- Departmental analysis.

\- Proficiency results.

\- Skill gap analysis.

\- Recommendation details.

\- Generated reports.

\- Analysis metadata.



\## FR-EXPORT-004: Export Selection



Users shall be able to select the export mode before generation.



\## FR-EXPORT-005: Export Authorization



The system shall verify the user's access permissions before generating or downloading identifiable student information.



\## FR-EXPORT-006: Export Integrity



The application shall validate generated files and ensure that exported results correspond to the active analysis session.



\## FR-EXPORT-007: Export Metadata



Each export shall include:



\- Generation timestamp.

\- Assessment session reference.

\- Academic period, where available.

\- Dataset summary.

\- Analysis methodology.

\- Proficiency rules.

\- Recommendation rule version.



\## FR-EXPORT-008: Download



Generated files shall be made available through secure browser downloads.



\## FR-EXPORT-009: Temporary Export Cleanup



Server-side generated files shall be deleted according to the configured temporary export retention policy.



Downloaded files shall not be automatically retained by the application.



\---



\# 16. Security and Privacy



\## FR-SEC-001: Secure File Processing



Uploaded files shall be validated before processing.



\## FR-SEC-002: Session Isolation



Users shall only access authorized collection and analysis sessions.



\## FR-SEC-003: Data Protection



Student information shall be protected during transmission and temporary processing.



\## FR-SEC-004: Restricted Logging



The application shall not log raw student assessment records, sensitive identifiers or uploaded dataset contents.



\## FR-SEC-005: Access Validation



Every sensitive backend operation shall verify authentication, authorization and session ownership or permitted access.



\## FR-SEC-006: Automatic Cleanup



Expired temporary data and associated server-side files shall be removed according to the configured cleanup policy.



\## FR-SEC-007: Download Protection



Identifiable data exports shall require explicit authorization.



\---



\# 17. Error Handling and Notifications



\## FR-ERROR-001: Validation Errors



The application shall display understandable validation errors.



\## FR-ERROR-002: Upload Errors



The application shall identify unsupported, corrupted or malformed files.



\## FR-ERROR-003: Processing Errors



The application shall communicate analysis failures without exposing internal server details.



\## FR-ERROR-004: Session Expiration



Users shall receive a clear notification when their temporary session expires.



\## FR-ERROR-005: Export Errors



The application shall notify users when report generation or downloads fail.



\## FR-ERROR-006: Access Errors



Unauthorized requests shall be rejected and handled securely.



\---



\# 18. Functional Acceptance Criteria



The initial release shall satisfy the following acceptance conditions.



| ID | Acceptance condition |

|---|---|

| AC-001 | Authorized users can authenticate |

| AC-002 | Students can access assigned assessment forms |

| AC-003 | Multiple skills can be submitted by a student |

| AC-004 | HODs and Deans can create authorized collection sessions |

| AC-005 | Excel and CSV files can be uploaded |

| AC-006 | Invalid records are identified with row-level errors |

| AC-007 | Form and upload data are normalized into one structure |

| AC-008 | Duplicate records are handled according to defined rules |

| AC-009 | Skills are classified using the configured taxonomy |

| AC-010 | Proficiency distributions are calculated correctly |

| AC-011 | Department-level analytics are generated |

| AC-012 | Skill gaps are identified using documented criteria |

| AC-013 | Recommendations include supporting explanations |

| AC-014 | HODs can review and propose development programs |

| AC-015 | Deans can review and decide on proposals |

| AC-016 | Dashboards respect departmental access boundaries |

| AC-017 | Reports-only exports are generated successfully |

| AC-018 | Complete analysis ZIP packages are generated successfully |

| AC-019 | Temporary sessions expire according to policy |

| AC-020 | Expired session data is cleared |

| AC-021 | Unauthorized users cannot access other sessions |

| AC-022 | Application remains accessible through its live website |



\---



\# 19. Requirement Traceability



Every functional requirement must be linked to its corresponding implementation module and test case.



Recommended tracking format:



| Requirement ID | Module | Implementation status | Test status |

|---|---|---|---|

| FR-ASSESS-001 | Assessment | Pending | Pending |

| FR-UPLOAD-001 | Ingestion | Pending | Pending |

| FR-INTEL-001 | Intelligence | Pending | Pending |

| FR-REC-001 | Recommendations | Pending | Pending |

| FR-EXPORT-001 | Exports | Pending | Pending |



Requirement status values:



\- Pending.

\- In Progress.

\- Implemented.

\- Verified.

\- Deferred.



\---



\*\*End of FUNCTIONAL\_REQUIREMENTS.md\*\*

