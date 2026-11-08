\# DATA\_PRIVACY\_AND\_RETENTION.md



\*\*Document Version:\*\* 1.0  

\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Status:\*\* Proposed  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the data privacy, data protection, retention, deletion, and lifecycle management policies of the Student Skill Intelligence Platform.



The objective is to ensure that personal and institutional information is collected, processed, accessed, exported, and deleted according to defined requirements.



The platform follows a central architectural principle:



\*\*Student skill-assessment data is processed temporarily and is not permanently retained by SSIP.\*\*



This policy applies to:



\- Student assessment form submissions.

\- Uploaded Excel and CSV datasets.

\- Normalized assessment records.

\- Skill proficiency information.

\- Analytical results.

\- Skill-gap findings.

\- Generated recommendations.

\- Temporary reports and export packages.

\- User and authentication information.

\- Platform configuration.

\- Security and audit records.



It also defines the distinction between temporary assessment information and persistent platform information.



\## 2. Privacy Principles



The platform follows the following privacy principles.



\### 2.1 Purpose Limitation



Information must only be processed for the purposes communicated to users and authorized by the institution.



The primary purpose is institutional skill analysis and skill-development planning.



\### 2.2 Data Minimization



The platform must collect only information necessary for assessment, analysis, access management, and authorized institutional operations.



\### 2.3 Storage Limitation



Student assessment information must not be permanently retained in the platform.



Temporary information must have an explicit expiry policy and cleanup mechanism.



\### 2.4 Transparency



Students and authorized institutional users must receive appropriate information about:



\- What information is collected.

\- Why it is collected.

\- How it is processed.

\- Who can access it.

\- How long it remains available.

\- How it is deleted.

\- How assessment information is used in institutional analysis.



\### 2.5 Security



Personal information must be protected against unauthorized access, disclosure, modification, and loss.



\### 2.6 Accountability



Data-processing operations must follow defined responsibilities and be auditable where appropriate.



\### 2.7 Privacy by Design



Privacy requirements must be incorporated into application architecture, database design, processing workflows, exports, and deployment.



\## 3. Data Governance Roles



The platform distinguishes application roles from privacy-governance responsibilities.



| Role | Privacy and data responsibility |

|---|---|

| Administrator | Maintains technical privacy controls, configuration, and cleanup mechanisms |

| Dean | Oversees authorized institutional assessment activities |

| HOD | Oversees authorized departmental assessment activities |

| Student | Provides assessment information and receives appropriate privacy information |

| University / Institutional Authority | Determines institutional purposes, policies, and lawful processing arrangements |

| Hosting / Infrastructure Provider | Processes or stores information as contractually and technically required |



The university must formally determine which legal entity or institution acts as the Data Fiduciary under applicable Indian data-protection law.



The platform development team must not independently assume that the application operator and the university have identical legal responsibilities.



\## 4. Data Inventory and Classification



Every information category must have a defined purpose, classification, storage location, and retention policy.



\### 4.1 Data Categories



| Data category | Examples | Classification |

|---|---|---|

| Identity information | Student ID, name, institutional identifier | Personal |

| Academic information | Department, program, year, semester | Personal / Institutional |

| Skill information | Programming, networking, cloud skills | Personal when linked to an individual |

| Proficiency information | Beginner, Intermediate, Expert | Personal when linked to an individual |

| Evidence information | Project experience, assessment evidence | Personal / Confidential |

| Uploaded datasets | Excel and CSV assessment files | Confidential |

| Analytical information | Skill distributions and departmental metrics | Restricted |

| Recommendation information | Suggested development initiatives | Restricted |

| Authentication information | Password hashes, session identifiers | Highly restricted |

| Configuration information | Taxonomy, rules, system settings | Internal |

| Security information | Login events, access-denied events | Restricted |

| Export information | PDF, Excel, CSV, ZIP packages | Depends on contents |



A skill profile is personal data when it can be associated with an identifiable student.



Aggregated information should not automatically be classified as anonymous. Small groups, rare skills, and combinations of attributes may allow individuals to be inferred.



\### 4.2 Data Inventory Requirements



For each data category, the implementation must identify:



\- Data owner or responsible authority.

\- Processing purpose.

\- Collection source.

\- Whether it identifies an individual.

\- Storage mechanism.

\- Authorized access roles.

\- Retention period.

\- Deletion method.

\- Whether it appears in exports.

\- Whether it is included in backups.



\## 5. Data Collection Policy



The platform supports two assessment collection mechanisms.



\### 5.1 Student Assessment Forms



Students submit skill information through authorized assessment sessions.



Potential information includes:



\- Student identifier.

\- Department.

\- Academic year.

\- Skill selection.

\- Self-reported proficiency.

\- Practical experience.

\- Supporting evidence, where required.



Only fields necessary for the approved assessment purpose should be collected.



\### 5.2 Bulk Dataset Uploads



Authorized HODs and Deans may upload Excel or CSV datasets.



The platform must:



\- Validate the uploaded file.

\- Verify the required fields.

\- Reject unsupported file structures.

\- Normalize accepted records.

\- Identify missing or invalid values.

\- Process the dataset within the authorized session.



The original uploaded file must follow the same temporary retention policy as the normalized assessment data.



\### 5.3 Data Collection Restrictions



The platform should not collect unnecessary information such as:



\- Personal contact details unrelated to assessment.

\- Home addresses.

\- Financial information.

\- Personal passwords.

\- Unrelated health information.

\- Sensitive personal information unrelated to the assessment purpose.



Additional fields require a documented purpose and institutional approval.



\## 6. Processing Purpose and Limitations



SSIP processes student skill information for the following purposes:



1\. Skill distribution analysis.

2\. Proficiency distribution analysis.

3\. Departmental skill coverage analysis.

4\. Skill-gap identification.

5\. Institutional skill comparison.

6\. Recommendation generation.

7\. Institutional development planning.

8\. Authorized reporting and exports.



\### 6.1 Prohibited Secondary Uses



Unless separately authorized under an appropriate institutional and legal framework, assessment information must not be used for:



\- Selling student information.

\- Commercial advertising.

\- Unrelated profiling.

\- Public ranking of individual students.

\- Automated disciplinary decisions.

\- Unrelated employment screening.

\- Unapproved external research.

\- Training external AI models.

\- Sharing identifiable information with unauthorized third parties.



The platform is designed for institutional skill intelligence, not individual career ranking.



\### 6.2 Recommendation Limitations



Recommendations must be generated using approved analytical rules.



They must not be treated as definitive judgments about an individual student's abilities or future potential.



An evidence gap must not be interpreted as proof of incompetence.



\## 7. Temporary Data Architecture



The platform uses temporary assessment sessions instead of permanent student skill records.



\### 7.1 Temporary Data Categories



The following information is temporary:



\- Form submissions.

\- Uploaded source datasets.

\- Normalized student records.

\- Proficiency classifications.

\- Intermediate processing data.

\- Skill analysis results.

\- Skill-gap results.

\- Generated recommendations.

\- Temporary reports.

\- ZIP analysis packages.

\- Temporary download references.



\### 7.2 Temporary Storage Options



The implementation may use:



| Storage mechanism | Purpose | Retention approach |

|---|---|---|

| Application memory | Prototype session data | Cleared on expiry or restart |

| Redis | Shared temporary session state | TTL and controlled cleanup |

| Temporary filesystem | Uploaded files and generated exports | Scheduled deletion |

| Processing memory | Intermediate calculations | Released after processing |



For production deployments requiring multiple backend workers, shared temporary storage is preferable to process-local memory.



\### 7.3 Persistent Storage Restrictions



The following must not become permanent student assessment records:



\- Individual skill profiles.

\- Student proficiency histories.

\- Student-level analytical results.

\- Student-linked recommendations.

\- Original uploaded assessment datasets.

\- Normalized student assessment datasets.



The use of a persistent configuration database must not violate this restriction.



\## 8. Persistent Platform Information



The no-permanent-student-skill-storage policy does not mean the entire platform must be stateless.



Some information may require persistence for platform operation.



\### 8.1 Potential Persistent Information



| Data | Persistence | Reason |

|---|---|---|

| User accounts | Yes, if platform-managed authentication is used | Identity management |

| Role assignments | Yes | Authorization |

| Department associations | Yes | Resource access scope |

| Skill taxonomy | Yes | Consistent skill classification |

| Proficiency configuration | Yes | Consistent assessment interpretation |

| Recommendation rules | Yes | Consistent recommendation generation |

| Platform configuration | Yes | Application operation |

| Security audit records | Subject to approved policy | Accountability |

| Governance decisions | Only if separately approved | Institutional decision history |



\### 8.2 Logical Separation



Persistent platform information must be logically separated from temporary assessment data.



The application must maintain clear boundaries between:



\- Identity and access information.

\- Platform configuration.

\- Temporary assessment sessions.

\- Security and operational records.

\- Optional persistent governance records.



\### 8.3 Persistent Data Restrictions



Persistent tables must not silently accumulate:



\- Student skill profiles.

\- Student assessment submissions.

\- Student-linked proficiency records.

\- Student-level recommendations.



Database migrations and new features must be reviewed against this requirement.



\## 9. Data Retention Policy



Every data category must have a defined retention rule.



\### 9.1 Retention Categories



| Data category | Retention policy |

|---|---|

| Student form submissions | Until configured assessment session expiry |

| Original uploaded files | Until session cleanup |

| Normalized datasets | Until session cleanup |

| Intermediate processing data | Until processing completes or session cleanup |

| Skill analysis results | Until session expiry |

| Skill-gap results | Until session expiry |

| Recommendations | Until session expiry |

| Generated reports | Until export expiry |

| ZIP analysis packages | Until export expiry |

| Temporary download references | Until export expiry |

| User accounts | Until account deactivation or approved deletion |

| Taxonomy and configuration | Until replaced or retired |

| Security logs | According to approved security retention policy |

| Governance records | According to a separately approved governance retention policy |



Exact retention durations must be configurable and institutionally approved.



The platform must not invent a permanent default retention period for student assessment data.



\### 9.2 Distinct Time Controls



The following time controls must remain separate:



\*\*Collection deadline:\*\* The last permitted time for new submissions.



\*\*Session access expiry:\*\* The point after which users can no longer access the session.



\*\*Assessment data retention:\*\* The period during which temporary assessment data remains stored.



\*\*Export expiry:\*\* The point after which a generated file or download reference becomes unavailable.



\*\*Audit retention:\*\* The period for which permitted security and accountability records are retained.



A collection deadline does not automatically determine data deletion time.



\## 10. Session-Based Data Lifecycle



Every assessment dataset must belong to a controlled session.



\### 10.1 Lifecycle



```text

Data Collection

&#x20;      |

&#x20;      v

Temporary Storage

&#x20;      |

&#x20;      v

Validation

&#x20;      |

&#x20;      v

Normalization

&#x20;      |

&#x20;      v

Skill Analysis

&#x20;      |

&#x20;      v

Gap Analysis

&#x20;      |

&#x20;      v

Recommendation Generation

&#x20;      |

&#x20;      v

Dashboard and Export

&#x20;      |

&#x20;      v

Session Expiry

&#x20;      |

&#x20;      v

Cleanup

&#x20;      |

&#x20;      v

Temporary Data Unavailable

```



\### 10.2 Lifecycle Requirements



\- Every temporary dataset must be associated with a session.

\- Access must be restricted by session scope.

\- Session expiry must be explicitly defined.

\- Export files must have independent expiry controls.

\- Cleanup must cover all derived information.

\- Expired data must not remain accessible through old API references.

\- Failed cleanup must trigger an operational alert.



\### 10.3 Session Restart and Failure



If application memory is used for temporary data:



\- An application restart may destroy active sessions.

\- The platform must not promise recovery unless a separate recovery mechanism is implemented.

\- Users must receive appropriate failure notifications.



If Redis is used, expiry and cleanup policies must remain effective across backend restarts.



\## 11. Data Deletion and Cleanup



Deletion must cover the complete temporary data lifecycle.



\### 11.1 Data Covered by Cleanup



\- Original uploaded files.

\- Form submission records.

\- Normalized datasets.

\- Intermediate processing objects.

\- Cached analytical results.

\- Skill-gap outputs.

\- Recommendation outputs.

\- Generated reports.

\- ZIP packages.

\- Temporary download references.

\- Session metadata that is no longer required.



\### 11.2 Cleanup Process



```text

Session Expiry Detected

&#x20;         |

&#x20;         v

Block Further Access

&#x20;         |

&#x20;         v

Identify Session Resources

&#x20;         |

&#x20;         v

Delete Temporary Records

&#x20;         |

&#x20;         v

Delete Uploaded Files

&#x20;         |

&#x20;         v

Delete Generated Exports

&#x20;         |

&#x20;         v

Invalidate Download References

&#x20;         |

&#x20;         v

Verify Cleanup

&#x20;         |

&#x20;         +------> Success: Mark Cleaned

&#x20;         |

&#x20;         +------> Failure: Alert and Retry

```



\### 11.3 Cleanup Requirements



\- Cleanup must be automated.

\- Cleanup must be idempotent.

\- Failed cleanup operations must be retried safely.

\- Cleanup execution must be monitored.

\- Deleted resources must not remain accessible through the application.

\- Temporary files must not be stored in public directories.

\- Cleanup must not delete unrelated sessions or configuration.



\### 11.4 Deletion Verification



The platform should verify that:



\- Temporary session keys have expired or been deleted.

\- Temporary files no longer exist at their expected paths.

\- Export references are invalid.

\- Session access is blocked.

\- Derived assessment information is unavailable.



Application-level deletion does not guarantee forensic erasure from physical storage media, provider-managed snapshots, or all underlying memory systems.



The infrastructure configuration must therefore be reviewed for prohibited persistence and backup behavior.



\## 12. Backup and Recovery Policy



Backups create a potential conflict with the temporary-data architecture.



\### 12.1 Backup Scope



Permitted backup candidates may include:



\- Application configuration.

\- User and role configuration.

\- Skill taxonomy.

\- Approved recommendation rules.

\- Proficiency framework configuration.

\- Other authorized persistent platform information.



Student assessment datasets and temporary analysis outputs must be excluded from persistent backups.



\### 12.2 Prohibited Backup Contents



Unless the institution explicitly changes the architecture and approves a different policy, backups must not contain:



\- Original student assessment uploads.

\- Student form submissions.

\- Normalized student datasets.

\- Student-level analytical outputs.

\- Temporary recommendation records.

\- Temporary export packages.



\### 12.3 Redis and Filesystem Backups



If Redis contains student assessment data:



\- Persistence must be disabled for those data.

\- Snapshots and AOF must not capture prohibited assessment records.

\- Backup agents must not copy temporary data directories.

\- Monitoring and configuration checks must verify the intended behavior.



\### 12.4 Recovery Limitations



Because student assessment information is intentionally temporary, the platform must not promise recovery of expired or lost assessment sessions.



Persistent platform configuration may be restored from approved backups.



Recovery of assessment information would require a separately approved architecture and data-retention policy.



\## 13. Data Export and User-Controlled Retention



The platform supports two export modes.



\### 13.1 Reports-Only Mode



Formats:



\- PDF.

\- Excel.

\- CSV.



Default contents:



\- Aggregated skill distributions.

\- Proficiency summaries.

\- Departmental comparisons.

\- Skill-gap analysis.

\- Recommendation summaries.



Student-identifiable information must be excluded by default.



\### 13.2 Complete Analysis Package



Format:



\- ZIP.



Potential contents:



\- Original uploaded dataset, where applicable.

\- Normalized dataset.

\- Analytical JSON.

\- Recommendation output.

\- Generated reports.

\- Export manifest.



The package must reflect the selected session and analysis revision.



Form-only sessions must not contain fabricated original-upload files.



\### 13.3 Export Security



\- Export generation requires explicit permission.

\- Download links must be protected.

\- Temporary export files must expire.

\- Files must be stored outside public directories.

\- Identifiable information must require separate authorization.

\- Export contents must be documented in a manifest.



\### 13.4 Responsibility After Download



Once a file has been downloaded, SSIP cannot technically enforce its deletion from the recipient's device.



The recipient and institution must handle downloaded files according to applicable privacy and information-security policies.



The institution should define permitted storage locations, sharing restrictions, and offline retention periods for downloaded reports.



\## 14. Privacy and Access Control



Privacy policies must be enforced through the access-control architecture.



| Role | Permitted information |

|---|---|

| Administrator | Platform configuration and operational metadata; confidential assessment access is not automatic |

| Dean | Authorized institutional analytics and permitted assessment information |

| HOD | Authorized departmental analytics and permitted departmental assessment information |

| Student | Own permitted assessment information |



\### 14.1 Access Requirements



\- Enforce backend authorization.

\- Restrict HOD access to assigned departments.

\- Restrict students to their own submissions.

\- Restrict exports according to their contents.

\- Avoid unnecessary exposure of individual records.

\- Prevent unauthorized cross-department access.



\### 14.2 Aggregation and Small Groups



Aggregated results can still expose individuals when groups are very small or contain unusual combinations of skills.



The platform should support configurable minimum group-size thresholds.



Where a threshold is not met, the system may:



\- Suppress the result.

\- Combine categories where analytically appropriate.

\- Display a privacy warning.

\- Prevent export of the affected breakdown.



Threshold values must be approved and validated rather than arbitrarily fixed.



\## 15. Data Accuracy and Correction



Incorrect assessment information can produce misleading analytical outcomes.



The platform must provide mechanisms to:



\- Validate submissions.

\- Identify invalid values.

\- Detect duplicate submissions according to session policy.

\- Correct permitted submissions.

\- Reprocess updated datasets.

\- Regenerate affected analytical results.

\- Regenerate recommendations from the latest valid analysis revision.



A correction to source information must not silently modify an unrelated or previously generated analysis snapshot.



The platform should clearly identify the analysis revision used for each report.



\## 16. Data Subject Requests and Institutional Privacy Handling



The institution must define a process for handling applicable requests relating to personal information.



Potential request categories include:



\- Access to personal information.

\- Correction of inaccurate information.

\- Erasure where applicable.

\- Withdrawal of consent where consent is the applicable processing basis.

\- Grievance submission.

\- Information about processing purposes.



\### 16.1 Temporary Data Considerations



If a student requests correction or deletion while an assessment session is active:



1\. Verify the student's identity.

2\. Identify the relevant assessment session and records.

3\. Determine whether the request is valid under institutional policy and applicable law.

4\. Apply the approved correction or deletion process.

5\. Recalculate affected analytical results where necessary.

6\. Regenerate recommendations if their inputs have changed.

7\. Confirm completion through the institution's designated process.



The platform must not automatically reject a request merely because the data is temporary.



\### 16.2 Request Handling After Expiry



If the relevant assessment data has already been deleted, the platform should not claim to retrieve information that no longer exists.



Any remaining information in persistent logs or governance records must be evaluated separately.



\### 16.3 Responsibility



The university must identify the appropriate privacy contact or grievance-handling authority.



The application Administrator is responsible for implementing authorized technical actions, not independently deciding the legal validity of every privacy request.



\## 17. Third-Party and External Service Restrictions



External services may introduce additional data-retention and processing risks.



Potential integrations include:



\- Hosting providers.

\- Email providers.

\- Authentication providers.

\- Monitoring platforms.

\- Malware-scanning services.

\- External analytics services.



\### 17.1 Requirements



Before integrating an external service:



\- Identify what information is shared.

\- Define the processing purpose.

\- Review the provider's privacy and security practices.

\- Determine storage location and retention behavior.

\- Review access permissions.

\- Establish appropriate contractual safeguards.

\- Verify whether data is used for unrelated purposes.



Student assessment information must not be sent to external AI or analytics services without explicit institutional approval and an appropriate privacy assessment.



\### 17.2 Hosting Provider Considerations



The hosting provider may process infrastructure-level information such as:



\- Network metadata.

\- Server logs.

\- System diagnostics.

\- Backup metadata.



The institution must review provider terms and configurations to understand whether temporary assessment information could be captured by infrastructure snapshots, backups, or support operations.



\## 18. Indian Data Protection Framework



The platform is intended for use in India and should be designed with reference to applicable Indian data-protection requirements.



\### 18.1 Digital Personal Data Protection Act, 2023



The Digital Personal Data Protection Act, 2023 establishes a framework for processing digital personal data.



Relevant design principles include:



\- Lawful processing.

\- Purpose limitation.

\- Appropriate notice and consent where applicable.

\- Data minimization.

\- Security safeguards.

\- Accuracy.

\- Storage limitation.

\- Accountability.

\- Data principal rights.



Official source: \[Digital Personal Data Protection Act, 2023 — MeitY](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf).



\### 18.2 Digital Personal Data Protection Rules, 2025



The Digital Personal Data Protection Rules, 2025 were notified in November 2025.



The Act and Rules have a phased commencement schedule. As of November 2026, the core processing obligations and associated rights provisions are scheduled to commence on 13 May 2027 under the notified commencement arrangements.



Therefore:



\- The platform should implement privacy controls ahead of the applicable commencement dates.

\- The institution must verify the provisions in force at the time of deployment.

\- The privacy notice, consent or other applicable processing basis, retention, security, and grievance processes must be reviewed before production use.

\- Legal compliance must not be inferred solely from implementing this technical document.



Official references:



\- \[Digital Personal Data Protection Rules, 2025 — MeitY](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025)

\- \[DPDP Act commencement notification — Gazette of India](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)

\- \[MeitY explanation of the DPDP Rules](https://www.meity.gov.in/writereaddata/files/Explanatory-Note-DPDP-Rules-2025.pdf)



The institution should obtain legal or privacy-governance review before production deployment.



\## 19. Privacy Notice Requirements



Before assessment collection begins, the institution should provide an appropriate privacy notice.



The notice should explain:



1\. Identity of the responsible institution or Data Fiduciary.

2\. Purpose of the assessment.

3\. Categories of information collected.

4\. How information is processed.

5\. Who can access the information.

6\. Whether external service providers are involved.

7\. Session-based retention and deletion.

8\. Export and offline storage implications.

9\. Applicable individual rights.

10\. Grievance or privacy contact details.



The notice must be understandable to students and available before they submit information.



The final notice and applicable processing basis must be approved by the institution.



\## 20. Privacy Testing Requirements



Privacy testing must verify that the implementation follows the documented data lifecycle.



\### 20.1 Data Minimization Tests



\- Unnecessary fields are not collected.

\- Optional fields remain optional where appropriate.

\- Uploaded datasets reject unauthorized or unexpected fields.

\- Processing does not create unnecessary personal information.



\### 20.2 Data Retention Tests



\- Sessions expire as configured.

\- Temporary data is deleted.

\- Expired exports are inaccessible.

\- Uploaded files are removed.

\- Derived analysis and recommendations are removed.

\- Cleanup failures generate alerts.



\### 20.3 Persistence Tests



\- Student assessment records are not written to permanent tables.

\- Prohibited data is not included in backups.

\- Redis persistence is configured appropriately.

\- Logs do not contain student assessment content unnecessarily.

\- Temporary files are not exposed through public directories.



\### 20.4 Access Tests



\- HODs cannot access unrelated departments.

\- Students cannot access other students' records.

\- Administrators cannot automatically retrieve identifiable assessment data.

\- Export restrictions are enforced.

\- Expired sessions cannot be accessed.



\### 20.5 Export Tests



\- Reports-only exports exclude identifiable data by default.

\- Complete packages contain only permitted session information.

\- ZIP contents match the selected analysis revision.

\- Temporary download references expire.

\- Spreadsheet formula injection is mitigated.



\## 21. Acceptance Criteria



The privacy and retention architecture is acceptable when:



1\. All data categories are inventoried.

2\. Processing purposes are documented.

3\. Unnecessary data collection is restricted.

4\. Student assessment information is temporary.

5\. Persistent platform information is logically separated.

6\. Session and export expiry are independently configured.

7\. Cleanup covers original and derived assessment information.

8\. Backup policies exclude prohibited student assessment data.

9\. Access restrictions are enforced by role and resource scope.

10\. Identifiable exports require explicit authorization.

11\. Privacy requests have a defined institutional handling process.

12\. Third-party processing is reviewed before integration.

13\. Security and audit logs follow separate retention policies.

14\. Privacy testing verifies actual deletion and access restrictions.

15\. Institutional privacy and legal approval is obtained before production deployment.



\## 22. Open Decisions



| Decision | Current position |

|---|---|

| Institutional Data Fiduciary identification | University authority to confirm |

| Applicable processing basis | Institutional legal review required |

| Privacy notice approval | Pending |

| Exact session retention duration | Pending institutional approval |

| Default export expiry | Pending |

| Minimum aggregation threshold | Pending |

| Persistent audit log retention | Pending |

| Governance decision retention | Separate approval required |

| Privacy grievance contact | Pending |

| Third-party provider list | Pending deployment selection |

| External data-processing agreements | Pending |

| Backup scope validation | Required before production |

| Privacy request workflow | Pending institutional approval |

| Data breach response ownership | University authority to define |

| Production privacy review | Required before launch |



\## 23. Final Architectural Position



SSIP is designed around temporary student skill-assessment processing rather than permanent student skill-profile storage.



Its privacy architecture distinguishes:



\- Temporary assessment information.

\- Persistent platform configuration.

\- Security and operational records.

\- Optional governance records.

\- Recipient-controlled downloaded exports.



The system must explicitly control collection, access, processing, retention, export, and deletion.



The no-permanent-student-skill-storage policy must be enforced throughout the complete architecture, including application memory, Redis, filesystems, logs, backups, monitoring systems, and external integrations.



\*\*Core privacy principle: Collect only what the assessment requires, use it only for authorized institutional purposes, retain it only for the approved period, and remove it from the platform when that period ends.\*\*

