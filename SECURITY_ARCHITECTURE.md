\# SECURITY\_ARCHITECTURE.md



\*\*Document Version:\*\* 1.0  

\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Status:\*\* Proposed  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the security architecture of the Student Skill Intelligence Platform.



The objective is to protect the confidentiality, integrity, and availability of the platform, its users, assessment information, analytical results, and institutional operations.



The security architecture establishes:



\- Identity and authentication controls.

\- Role-based and resource-level authorization.

\- Student assessment data protection.

\- Secure temporary data processing.

\- API and application security.

\- File upload and export security.

\- Infrastructure and deployment security.

\- Security monitoring and incident response.

\- Data retention and cleanup requirements.



Security must be incorporated into the application architecture rather than added as a separate feature after development.



\## 2. Security Objectives



The platform follows the three fundamental information-security objectives.



\### 2.1 Confidentiality



Ensure that information is accessible only to authorized users.



Controls include:



\- Authentication.

\- RBAC and ABAC.

\- Department-level resource restrictions.

\- Encryption in transit.

\- Restricted exports.

\- Secure temporary storage.

\- Protection against unauthorized data disclosure.



\### 2.2 Integrity



Ensure that assessment information, analytical results, recommendations, and configuration cannot be modified without authorization.



Controls include:



\- Input validation.

\- Backend authorization.

\- Data normalization.

\- Controlled configuration changes.

\- Analysis revision tracking.

\- Recommendation rule versioning.

\- Audit logging.

\- Secure file processing.



\### 2.3 Availability



Ensure that authorized users can access the platform and its functionality when required.



Controls include:



\- Application health monitoring.

\- Resource limits.

\- Error handling.

\- Session lifecycle management.

\- Infrastructure monitoring.

\- Controlled deployment.

\- Recovery procedures for application and infrastructure failures.



Availability must be balanced with the platform's temporary-data retention policy.



\## 3. Security Architecture Overview



The security architecture operates across multiple layers.



```text

&#x20;                 USERS

&#x20;                   |

&#x20;                   v

&#x20;         HTTPS / Secure Connection

&#x20;                   |

&#x20;                   v

&#x20;         Reverse Proxy / Nginx

&#x20;                   |

&#x20;                   v

&#x20;          Authentication Layer

&#x20;                   |

&#x20;                   v

&#x20;         Authorization Layer

&#x20;            RBAC + ABAC

&#x20;                   |

&#x20;                   v

&#x20;          Application Layer

&#x20;                   |

&#x20;         +---------+----------+

&#x20;         |         |          |

&#x20;         v         v          v

&#x20;     Assessment Analytics  Recommendations

&#x20;         |         |          |

&#x20;         +---------+----------+

&#x20;                   |

&#x20;                   v

&#x20;         Temporary Data Layer

&#x20;                   |

&#x20;         +---------+----------+

&#x20;         |                    |

&#x20;         v                    v

&#x20;   Session Storage       Temporary Files

&#x20;         |                    |

&#x20;         +---------+----------+

&#x20;                   |

&#x20;                   v

&#x20;         Export and Cleanup Layer

&#x20;                   |

&#x20;                   v

&#x20;         Security Monitoring

```



Security controls must apply across all layers.



\## 4. Security Design Principles



\### 4.1 Defense in Depth



The platform must use multiple independent security controls.



A failure in one security layer must not automatically expose the entire application.



\### 4.2 Least Privilege



Users receive only the permissions necessary for their responsibilities.



\### 4.3 Deny by Default



Access must be denied unless an explicit authorization rule permits the requested operation.



\### 4.4 Separation of Duties



Platform administration, departmental review, and institutional approval remain separate responsibilities.



\### 4.5 Secure by Design



Security requirements must be considered during architecture, development, testing, and deployment.



\### 4.6 Minimize Data Collection



The platform should collect only information required for skill assessment and institutional analysis.



\### 4.7 Minimize Data Retention



Student assessment information must remain temporary and must be deleted according to the approved session retention policy.



\### 4.8 Fail Securely



If authentication, authorization, validation, or security checks fail, the application must reject the operation rather than grant access.



\## 5. Threat Model



The platform must consider threats involving users, application endpoints, uploaded files, temporary datasets, exports, and infrastructure.



\### 5.1 Assets to Protect



| Asset | Security importance |

|---|---|

| User credentials | Prevent account compromise |

| User identities | Prevent impersonation |

| Student assessment submissions | Protect confidential information |

| Uploaded datasets | Prevent unauthorized disclosure or modification |

| Analytical results | Protect institutional information integrity |

| Recommendations | Prevent unauthorized manipulation |

| Assessment sessions | Protect temporary data and access boundaries |

| Taxonomy configuration | Preserve analytical consistency |

| Proficiency configuration | Prevent unauthorized academic rule changes |

| Recommendation rules | Preserve decision-support integrity |

| Export files | Prevent unauthorized data distribution |

| Audit records | Preserve accountability |

| Infrastructure credentials | Prevent system compromise |



\### 5.2 Threat Categories



| Threat | Potential impact | Primary mitigation |

|---|---|---|

| Unauthorized access | Confidential data exposure | Authentication and authorization |

| Privilege escalation | Unauthorized administrative operations | RBAC and ABAC |

| Cross-department access | Departmental data exposure | Resource-scope validation |

| IDOR/BOLA | Unauthorized resource retrieval | Ownership validation |

| SQL injection | Database compromise | Parameterized queries and ORM safeguards |

| Cross-site scripting | Session theft or unauthorized actions | Output encoding and CSP |

| Cross-site request forgery | Unauthorized authenticated actions | CSRF protections where applicable |

| Malicious file upload | Server compromise or resource exhaustion | File validation and isolated processing |

| Denial of service | Service unavailability | Rate limits and resource controls |

| Session hijacking | Account impersonation | Secure session handling |

| Export leakage | Student or institutional data exposure | Export authorization and expiry |

| Configuration manipulation | Incorrect analytical results | Restricted configuration and versioning |

| Supply-chain compromise | Application compromise | Dependency management and scanning |

| Insecure deployment | Infrastructure exposure | Hardened server configuration |



\### 5.3 Threat Modelling Approach



The development team should use a structured threat-modelling approach.



The STRIDE model can be used to classify threats:



| STRIDE category | SSIP example |

|---|---|

| Spoofing | Attacker impersonates an HOD |

| Tampering | Unauthorized modification of assessment data |

| Repudiation | User denies approving a proposal |

| Information Disclosure | HOD retrieves another department's data |

| Denial of Service | Large upload exhausts server resources |

| Elevation of Privilege | Student gains administrative permissions |



Threat modelling should be updated when new modules, integrations, or data flows are introduced.



\## 6. Identity and Authentication Security



Authentication establishes the identity of the user before protected operations are permitted.



\### 6.1 Authentication Requirements



\- Every protected operation requires authentication.

\- Inactive accounts must be denied access.

\- Passwords must never be stored in plaintext.

\- Authentication credentials must be protected in transit.

\- Login attempts should be rate-limited.

\- Password reset operations must use secure verification.

\- Authentication errors must not disclose sensitive account information.

\- Authentication sessions must have appropriate expiry and revocation.



\### 6.2 Password Security



If platform-managed passwords are used:



\- Use a modern password hashing algorithm such as Argon2id.

\- Use unique salts generated by the hashing implementation.

\- Apply appropriate password length and complexity policy.

\- Prevent common and compromised passwords where feasible.

\- Do not log passwords or authentication secrets.

\- Require secure password-reset tokens with limited validity.



Passwords must be hashed, not reversibly encrypted.



\### 6.3 Multi-Factor Authentication



MFA should be required for privileged roles, particularly:



\- Administrator.

\- Dean.

\- Other users with sensitive export or configuration privileges.



The final MFA policy must be approved by the institution.



\### 6.4 Session Security



Authentication sessions must:



\- Use secure session identifiers.

\- Expire after the configured inactivity period.

\- Support explicit logout and revocation.

\- Prevent session fixation.

\- Avoid exposing tokens in URLs.

\- Use secure cookie attributes when cookie-based authentication is selected.



For cookie-based sessions, use appropriate `HttpOnly`, `Secure`, and `SameSite` settings.



The final authentication mechanism, including JWT versus server-side sessions, remains an implementation decision.



\## 7. Authorization and Access Security



The platform uses a hybrid RBAC and ABAC model.



\### 7.1 RBAC



RBAC determines which operations a role can perform.



Primary roles:



\- Administrator.

\- Dean.

\- HOD.

\- Student.



\### 7.2 ABAC



ABAC applies contextual restrictions based on:



\- User identity.

\- Department association.

\- Resource ownership.

\- Session status.

\- Data classification.

\- Requested operation.

\- Institutional scope.



\### 7.3 Authorization Requirements



Every protected backend operation must:



1\. Verify the authenticated identity.

2\. Confirm that the account is active.

3\. Check the required permission.

4\. Validate resource ownership or organizational scope.

5\. Check applicable session restrictions.

6\. Apply data-classification restrictions.

7\. Reject unauthorized requests.



Frontend role checks must never be considered sufficient authorization.



\### 7.4 Privileged Operations



Additional restrictions should apply to:



\- User role assignment.

\- Taxonomy modification.

\- Proficiency framework modification.

\- Recommendation rule modification.

\- Institutional proposal approval.

\- Identifiable data exports.

\- Security configuration changes.



Privileged operations should be auditable.



\## 8. Student Assessment Data Protection



Student assessment information is a primary sensitive asset.



\### 8.1 Data Collection



The platform must:



\- Collect only required assessment information.

\- Validate submitted values.

\- Avoid unnecessary personal information.

\- Restrict assessment access to authorized sessions.

\- Protect submissions during transmission and processing.



\### 8.2 Data Classification



| Data type | Classification |

|---|---|

| Public platform information | Public |

| General platform configuration | Internal |

| Departmental analytics | Restricted |

| Identifiable student assessment data | Confidential |

| Authentication secrets | Highly restricted |

| Security credentials and tokens | Highly restricted |



The classification model is proposed and must be aligned with university policies.



\### 8.3 Data Minimization



Student identifiers should be separated from analytical attributes where practical.



Where identification is not required for analysis, the processing pipeline should use pseudonymous identifiers or aggregated records.



Pseudonymization does not make information anonymous if the identity can still be recovered.



\### 8.4 Data Exposure Restrictions



\- Student submissions must not be publicly accessible.

\- HODs must be restricted to their authorized departments.

\- Students must not retrieve other students' submissions.

\- Institutional dashboards should prefer aggregated information.

\- Identifiable exports require explicit authorization.

\- Sensitive information must not appear in application error messages.



\## 9. Temporary Data Security Architecture



The platform follows a no-permanent-student-skill-storage policy.



Student assessment information is processed temporarily within assessment sessions.



\### 9.1 Temporary Storage Requirements



The platform may use:



\- Application memory for a controlled prototype.

\- Redis with TTL for shared temporary session state.

\- Protected temporary filesystem locations for uploaded and generated files.



The selected storage mechanism must not unintentionally introduce persistent student assessment records.



\### 9.2 Redis Security



If Redis is used:



\- Restrict network access.

\- Require authentication where supported.

\- Do not expose Redis directly to the public internet.

\- Use dedicated credentials.

\- Apply appropriate key expiry.

\- Disable persistence mechanisms for student assessment data when strict non-persistence is required.

\- Ensure backups and snapshots do not capture prohibited assessment data.

\- Restrict access to the Redis service account.



Disabling Redis persistence alone does not guarantee that data cannot be recovered from every infrastructure or memory layer. The complete deployment and provider environment must be considered.



\### 9.3 Temporary File Security



Uploaded and generated files must:



\- Be stored outside public web directories.

\- Use unpredictable internal filenames.

\- Be accessible only through authorized backend operations.

\- Be subject to file size and type limits.

\- Be validated before processing.

\- Be deleted when their retention period expires.

\- Never be executed as application code.



\### 9.4 Cleanup Security



Cleanup must cover:



\- In-memory session records.

\- Temporary Redis keys.

\- Uploaded files.

\- Normalized datasets.

\- Intermediate analytical results.

\- Recommendation results.

\- Generated reports.

\- Temporary ZIP packages.

\- Export download references.



Cleanup must be monitored and failures must be reported.



The platform must not claim guaranteed forensic erasure merely because a file or key has been deleted.



\## 10. API Security



All API endpoints must be protected against unauthorized access and malicious input.



\### 10.1 Transport Security



\- Enforce HTTPS.

\- Redirect HTTP requests to HTTPS.

\- Use valid TLS certificates.

\- Disable obsolete TLS protocols.

\- Apply secure HTTP response headers.



\### 10.2 Input Validation



Validate:



\- Request body structure.

\- Query parameters.

\- Path parameters.

\- File metadata.

\- Data types.

\- Field lengths.

\- Allowed values.

\- Session identifiers.

\- Department identifiers.

\- Resource identifiers.



Use explicit request schemas in FastAPI.



\### 10.3 Injection Protection



\- Use SQLAlchemy parameterized queries.

\- Avoid constructing SQL queries from untrusted strings.

\- Avoid unsafe shell command execution.

\- Validate file paths.

\- Use safe serialization and deserialization practices.



\### 10.4 Rate Limiting



Apply rate limits to:



\- Authentication endpoints.

\- Password reset operations.

\- Assessment submission endpoints.

\- File uploads.

\- Analytics processing.

\- Export generation.

\- Resource-intensive API operations.



Limits should be configurable according to the deployment capacity and expected institutional usage.



\### 10.5 CORS



Cross-Origin Resource Sharing must:



\- Allow only approved frontend origins.

\- Avoid wildcard origins when credentials are enabled.

\- Restrict allowed methods.

\- Restrict allowed headers.

\- Be configured separately for development and production.



\### 10.6 API Error Security



API errors must not expose:



\- Database credentials.

\- Internal file paths.

\- Stack traces.

\- Authentication tokens.

\- Session secrets.

\- Sensitive student data.

\- Internal infrastructure details.



Detailed exceptions should remain in protected server-side logs.



\## 11. File Upload Security



The platform accepts Excel and CSV datasets.



File uploads introduce risks such as malicious content, resource exhaustion, parser vulnerabilities, and formula injection.



\### 11.1 Upload Validation



The backend must validate:



\- Permitted file extensions.

\- Actual file format.

\- File size.

\- File structure.

\- Expected columns.

\- Row and column limits.

\- Encoding.

\- Data types.

\- Required fields.



Do not trust the filename or MIME type supplied by the client.



\### 11.2 File Processing



\- Process files through approved parsing libraries.

\- Use bounded processing resources.

\- Reject malformed files.

\- Prevent path traversal.

\- Avoid executing uploaded content.

\- Isolate processing from public file-serving locations.

\- Handle parser errors safely.



\### 11.3 Spreadsheet Formula Injection



CSV and spreadsheet exports may contain values beginning with formula-triggering characters.



The export module must apply suitable escaping or neutralization when generating spreadsheet-compatible files.



This prevents untrusted text from being interpreted as executable spreadsheet formulas by common spreadsheet applications.



\### 11.4 Malware Scanning



Malware scanning may be introduced depending on the hosting environment and institutional requirements.



The initial implementation must at minimum validate formats and isolate uploaded content.



\## 12. Application Security



\### 12.1 Frontend Security



The React application must:



\- Avoid unsafe HTML rendering.

\- Validate user input where appropriate.

\- Avoid storing sensitive data unnecessarily in browser storage.

\- Protect authenticated routes.

\- Use secure API communication.

\- Avoid exposing secrets in frontend environment variables.

\- Apply a suitable Content Security Policy.



Frontend controls are usability mechanisms, not substitutes for backend validation.



\### 12.2 Backend Security



The FastAPI backend must:



\- Use strict request validation.

\- Enforce authorization centrally.

\- Handle exceptions safely.

\- Avoid unsafe dynamic execution.

\- Restrict file access.

\- Protect application secrets.

\- Apply resource limits.

\- Maintain secure dependencies.



\### 12.3 Security Headers



The reverse proxy or application should configure suitable headers, including:



\- `Strict-Transport-Security`

\- `Content-Security-Policy`

\- `X-Content-Type-Options`

\- `Referrer-Policy`

\- `X-Frame-Options`, or an appropriate CSP `frame-ancestors` policy.



Header values must be configured according to the actual frontend and deployment requirements.



\## 13. Export Security



Exports may contain institutional or student assessment information.



\### 13.1 Export Authorization



Before generating an export, the backend must verify:



\- User identity.

\- Required export permission.

\- Department or institutional scope.

\- Session accessibility.

\- Export type.

\- Data classification.

\- Identifiable-data authorization, where applicable.



\### 13.2 Export Storage



\- Store files outside public directories.

\- Use unpredictable download identifiers.

\- Enforce expiry.

\- Restrict download access.

\- Delete temporary files after the retention period.

\- Avoid exposing storage paths.



\### 13.3 Reports-Only Mode



The default reporting mode should contain aggregated information.



Student-identifiable information must be excluded unless explicitly authorized.



\### 13.4 Complete Analysis Package



The complete analysis package may include original uploaded data, normalized data, analytics, recommendations, reports, and a manifest.



Only authorized users may generate and retrieve this package.



Once downloaded, the file is under the recipient's control and must be handled according to institutional policy.



\## 14. Infrastructure and Deployment Security



\### 14.1 Deployment Architecture



The proposed deployment consists of:



\- React frontend.

\- FastAPI backend.

\- Nginx reverse proxy.

\- Linux VPS.

\- Temporary session storage.

\- Protected temporary file storage.

\- HTTPS.

\- Monitoring and logging.



\### 14.2 Linux Server Hardening



The server must:



\- Use a supported Linux distribution.

\- Apply security updates.

\- Disable unnecessary services.

\- Restrict SSH access.

\- Use key-based SSH authentication where possible.

\- Disable direct root login where operationally appropriate.

\- Configure a host firewall.

\- Restrict exposed ports.

\- Use non-root application processes.

\- Protect configuration and secret files.



\### 14.3 Network Security



Only necessary services should be publicly accessible.



Example:



| Service | Exposure |

|---|---|

| HTTPS reverse proxy | Public |

| HTTP redirect | Public |

| FastAPI application | Private/internal |

| Redis | Private/internal |

| Administrative SSH | Restricted |

| Internal monitoring | Restricted |



Redis and the application server must not be exposed directly to the public internet unless a documented architecture explicitly requires it and appropriate controls are implemented.



\### 14.4 Docker Security



Where Docker is used:



\- Use trusted base images.

\- Pin dependency and image versions.

\- Avoid privileged containers.

\- Avoid unnecessary host mounts.

\- Run containers as non-root users.

\- Restrict container capabilities.

\- Keep secrets outside image layers.

\- Scan container images.

\- Limit CPU and memory consumption.

\- Keep internal services on private Docker networks.



\### 14.5 Secrets Management



Secrets include:



\- Authentication signing keys.

\- Database credentials, if applicable.

\- Redis credentials.

\- SMTP credentials, if applicable.

\- Third-party integration keys.

\- TLS private keys.



Secrets must not be committed to Git repositories or embedded in frontend bundles.



Production secrets should be injected through a protected deployment configuration or secrets-management solution.



\## 15. Database and Persistent Configuration Security



Although student skill assessment data is temporary, some platform information may require persistence.



Potential persistent information includes:



\- User accounts.

\- Role assignments.

\- Department associations.

\- Skill taxonomy.

\- Proficiency configuration.

\- Recommendation rules.

\- Platform settings.

\- Approved governance metadata, if separately authorized.



\### 15.1 Security Requirements



\- Restrict database access to authorized services.

\- Use separate application credentials.

\- Apply least-privilege database permissions.

\- Protect credentials.

\- Validate database operations.

\- Encrypt storage where supported and required.

\- Restrict administrative database access.

\- Avoid logging sensitive values.

\- Define backup policies according to data classification.



\### 15.2 Data Separation



Persistent platform configuration must remain logically separated from temporary student assessment data.



The use of a persistent configuration database must not silently introduce permanent student skill records.



Backups must not include prohibited temporary assessment information.



\## 16. Security Logging and Monitoring



Monitoring provides visibility into security events and application behavior.



\### 16.1 Events to Monitor



\- Failed login attempts.

\- Repeated unauthorized requests.

\- Suspicious API usage.

\- Permission changes.

\- Role assignment changes.

\- Cross-department access attempts.

\- Sensitive export generation.

\- Unusual upload activity.

\- Session expiry failures.

\- Cleanup failures.

\- Server resource exhaustion.

\- Unexpected application errors.



\### 16.2 Log Categories



| Log category | Purpose |

|---|---|

| Authentication logs | Track login activity |

| Authorization logs | Track access decisions |

| Application logs | Diagnose application behavior |

| Session logs | Track session lifecycle |

| Upload logs | Track file processing |

| Export logs | Track report generation and retrieval |

| Infrastructure logs | Monitor server health |

| Security logs | Identify suspicious activity |



\### 16.3 Logging Restrictions



Logs must not contain:



\- Passwords.

\- Authentication tokens.

\- Private keys.

\- Unnecessary student assessment content.

\- Sensitive export contents.

\- Full confidential request bodies.



\### 16.4 Alerting



Alerts should be generated for:



\- Repeated authentication failures.

\- Unexpected privilege changes.

\- Repeated access-control violations.

\- Suspicious export activity.

\- Unexpected service exposure.

\- Cleanup failures.

\- Critical application or infrastructure errors.



Monitoring must be proportional to the actual deployment and available operational capacity.



\## 17. Incident Response



The platform must define a process for responding to security incidents.



\### 17.1 Incident Categories



| Severity | Example |

|---|---|

| Critical | Confirmed compromise of confidential assessment data |

| High | Privilege escalation or unauthorized institutional access |

| Medium | Repeated suspicious requests or attempted data extraction |

| Low | Isolated blocked access attempt |



Final severity classification should follow institutional incident-response policy.



\### 17.2 Incident Response Lifecycle



```text

Detection

&#x20;   |

&#x20;   v

Initial Assessment

&#x20;   |

&#x20;   v

Containment

&#x20;   |

&#x20;   v

Investigation

&#x20;   |

&#x20;   v

Eradication

&#x20;   |

&#x20;   v

Recovery

&#x20;   |

&#x20;   v

Post-Incident Review

```



\### 17.3 Detection



Identify the event through:



\- Application logs.

\- Authentication monitoring.

\- Authorization failures.

\- Infrastructure alerts.

\- User reports.



\### 17.4 Containment



Possible actions include:



\- Suspend affected accounts.

\- Revoke authentication sessions.

\- Disable affected API operations.

\- Restrict network access.

\- Stop suspicious processing.

\- Temporarily disable affected exports.



\### 17.5 Investigation



Determine:



\- What happened.

\- When it happened.

\- Which resources were affected.

\- Whether unauthorized access occurred.

\- Whether information was exposed or modified.

\- Which security controls failed.



\### 17.6 Recovery



\- Restore affected services.

\- Correct the vulnerability.

\- Rotate compromised credentials.

\- Validate application integrity.

\- Verify cleanup and access restrictions.

\- Resume operations after security validation.



\### 17.7 Reporting



Incidents involving personal or institutional information must be escalated according to applicable university policy and legal obligations.



The platform must not independently assume that an incident notification requirement has been satisfied merely because it has recorded the event.



\## 18. Security Testing Strategy



Security testing must be included throughout development.



\### 18.1 Application Security Testing



Test for:



\- SQL injection.

\- Cross-site scripting.

\- Broken access control.

\- IDOR/BOLA.

\- CSRF, where applicable.

\- Authentication weaknesses.

\- Session management weaknesses.

\- Insecure file uploads.

\- Path traversal.

\- Sensitive data exposure.



\### 18.2 Authorization Testing



Verify:



\- HOD cannot access unrelated departments.

\- Student cannot retrieve another student's submission.

\- Administrator cannot automatically access confidential assessment content.

\- HOD cannot approve institutional proposals.

\- Student cannot access administrative endpoints.

\- Unauthorized exports are rejected.



\### 18.3 Infrastructure Testing



Verify:



\- Only necessary ports are exposed.

\- Internal services are not publicly accessible.

\- TLS is correctly configured.

\- Containers run with restricted privileges.

\- Secrets are not exposed.

\- Server permissions are appropriately configured.



\### 18.4 Dependency Security



\- Scan Python dependencies.

\- Scan frontend dependencies.

\- Scan container images.

\- Review security advisories.

\- Remove unused dependencies.

\- Update vulnerable packages.

\- Pin production dependencies.



\### 18.5 Security Validation Tools



Potential tools include:



| Tool | Purpose |

|---|---|

| OWASP ZAP | Web application security testing |

| Burp Suite | HTTP interception and security testing |

| Bandit | Python security linting |

| pip-audit | Python dependency vulnerability checking |

| Semgrep | Static application security analysis |

| Trivy | Container and dependency scanning |

| Nmap | Network service discovery and exposure checks |



Tool selection depends on the development and deployment environment.



\## 19. Secure Development Lifecycle



Security must be integrated into the software development process.



| Development phase | Security activity |

|---|---|

| Requirements | Identify security and privacy requirements |

| Architecture | Threat modelling and trust-boundary definition |

| Development | Secure coding and input validation |

| Code review | Review authorization and sensitive operations |

| Testing | Functional and security testing |

| Build | Dependency and container scanning |

| Deployment | Server hardening and secret configuration |

| Operation | Monitoring and patch management |

| Maintenance | Vulnerability remediation and security reviews |



Security-critical changes must receive appropriate review before production deployment.



\## 20. Security Acceptance Criteria



The security architecture is acceptable when:



1\. Protected operations require authentication.

2\. Backend authorization is enforced.

3\. RBAC and ABAC operate together.

4\. Departmental data isolation is verified.

5\. Student assessment information is protected.

6\. Temporary data is handled according to retention policy.

7\. Uploads are validated and safely processed.

8\. Exports are access-controlled.

9\. APIs enforce input validation and rate limits.

10\. HTTPS is enforced in production.

11\. Secrets are protected.

12\. Infrastructure services are appropriately isolated.

13\. Security events are logged without unnecessary sensitive data.

14\. Cleanup failures are detectable.

15\. Security testing covers application and infrastructure threats.

16\. Incident-response procedures are documented.

17\. Persistent configuration data remains separate from temporary assessment data.



\## 21. Open Security Decisions



| Decision | Current position |

|---|---|

| Authentication provider | University SSO or platform authentication pending |

| Session mechanism | JWT versus server-side sessions pending |

| MFA enforcement | Recommended for privileged roles; approval pending |

| Redis deployment | Required if shared temporary state is needed |

| Redis persistence | Disabled for prohibited assessment data |

| Temporary file cleanup interval | Pending session retention policy |

| Encryption at rest | Deployment and institutional policy decision |

| Student data anonymization | Processing design to be finalized |

| Malware scanning | Deployment-dependent |

| Security monitoring platform | Pending |

| Audit log retention | Pending institutional policy |

| Incident notification process | University policy to be defined |

| Backup scope | Must exclude prohibited temporary assessment data |

| Vulnerability assessment frequency | Pending operational policy |

| Emergency privileged access | Formal break-glass policy required |



\## 22. Final Architectural Position



The Student Skill Intelligence Platform adopts a defense-in-depth security architecture.



Its security controls span:



\- Identity and authentication.

\- Role and resource authorization.

\- Student data protection.

\- Temporary session storage.

\- API and application security.

\- File upload and export protection.

\- Infrastructure hardening.

\- Monitoring and incident response.

\- Secure software development.



The no-permanent-student-skill-storage policy is a core architectural constraint. It must be reflected in storage design, logging, backup configuration, exports, and cleanup mechanisms.



\*\*Core security principle: Every request must be authenticated, every operation must be authorized, every resource must be scope-validated, and every sensitive data lifecycle must have an explicit security policy.\*\*

