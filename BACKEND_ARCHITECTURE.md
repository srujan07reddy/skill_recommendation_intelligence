\# BACKEND\_ARCHITECTURE.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Architecture  

\*\*Backend Framework:\*\* Python + FastAPI  

\*\*Architecture Style:\*\* Modular Monolith  

\*\*Processing:\*\* Pandas + NumPy  

\*\*Temporary Session Storage:\*\* In-memory prototype / Redis with TTL  

\*\*Deployment:\*\* Docker + Linux VPS



\---



\## 1. Purpose



This document defines the backend architecture of the Student Skill Intelligence Platform.



The backend is responsible for:



1\. Authentication and authorization.

2\. Assessment session creation and management.

3\. Student assessment submission.

4\. Bulk data ingestion.

5\. Data validation and normalization.

6\. Skill taxonomy management.

7\. Proficiency classification.

8\. Skill intelligence analysis.

9\. Skill-gap identification.

10\. Development recommendation generation.

11\. HOD and Dean governance workflows.

12\. Report and export generation.

13\. Temporary data lifecycle management.

14\. Security, monitoring, and operational management.



The backend acts as the central source of truth for application logic, permissions, analytical results, processing status, and temporary assessment data.



\## 2. Architectural Principles



The backend must follow these principles:



\- Modular architecture with clear business boundaries.

\- Separation of API, business logic, and data access.

\- No permanent storage of student skill assessment records.

\- Temporary storage with explicit retention and cleanup.

\- Centralized validation and normalization.

\- Deterministic and explainable analytical calculations.

\- Backend-enforced authorization.

\- Independent skill analysis and recommendation engines.

\- Reproducible analytical processing through versioned configurations.

\- Secure file handling and export generation.

\- Controlled resource consumption.

\- Testable and maintainable code.



\### 2.1 Architecture style



The initial implementation will use a modular monolith.



A modular monolith means the backend is deployed as one application while its internal business modules remain logically separated.



It avoids unnecessary distributed-system complexity while preserving the ability to extract individual services later if actual operational requirements justify doing so.



Microservices are not part of the initial release.



\## 3. Technology Stack



| Component | Technology | Responsibility |

|---|---|---|

| Backend framework | FastAPI | REST API |

| Language | Python | Application logic |

| ASGI server | Uvicorn | Application serving |

| Data processing | Pandas | Data manipulation |

| Numerical processing | NumPy | Numerical calculations |

| Excel processing | OpenPyXL | XLSX ingestion and generation |

| CSV processing | Python CSV / Pandas | CSV handling |

| PDF generation | ReportLab | PDF reports |

| ZIP generation | Python zipfile | Complete analysis packages |

| Validation | Pydantic | Request and response validation |

| ORM | SQLAlchemy, if required | Persistent configuration access |

| Database migrations | Alembic, if required | Persistent schema management |

| Temporary shared storage | Redis, if required | Session and job state |

| Testing | Pytest | Backend testing |

| Containerization | Docker | Application packaging |

| Reverse proxy | Nginx | HTTPS and request routing |



The initial backend must not introduce PostgreSQL merely to store student skill records. Any persistent database must have a clearly defined purpose outside the prohibited permanent assessment-data store.



\## 4. High-Level Architecture



```text

Frontend Application

&#x20;       |

&#x20;       | HTTPS / REST API

&#x20;       v

Nginx Reverse Proxy

&#x20;       |

&#x20;       v

FastAPI Application

&#x20;       |

&#x20;       +---------------------------+

&#x20;       |                           |

&#x20;       v                           v

Authentication \&               API Middleware

Authorization                  Validation / Errors

&#x20;       |

&#x20;       v

Application Service Layer

&#x20;       |

&#x20;       +--------------------------------------+

&#x20;       |                                      |

&#x20;       v                                      v

Assessment \& Session Modules             Governance Modules

&#x20;       |                                      |

&#x20;       v                                      v

Data Ingestion \& Validation               HOD / Dean Workflows

&#x20;       |

&#x20;       v

Normalization Layer

&#x20;       |

&#x20;       v

Skill Intelligence Modules

&#x20;       |

&#x20;       +-------------------------------+

&#x20;       |                               |

&#x20;       v                               v

Skill Analysis Engine              Skill Gap Analysis

&#x20;       |                               |

&#x20;       +---------------+---------------+

&#x20;                       |

&#x20;                       v

&#x20;              Recommendation Engine

&#x20;                       |

&#x20;                       v

&#x20;                 Export Service

&#x20;                       |

&#x20;                       v

&#x20;            Temporary Export Storage



Supporting Infrastructure:

\- Temporary Session Storage

\- Persistent Configuration Store, if approved

\- Processing Job Management

\- Cleanup Service

\- Logging and Monitoring

```



\## 5. Backend Layers



\### 5.1 API Layer



The API layer receives HTTP requests and returns structured responses.



Responsibilities:

\- Route registration.

\- Request validation.

\- Authentication dependency injection.

\- Permission checks.

\- Response serialization.

\- HTTP status codes.

\- API versioning.

\- Error handling.



The API layer must not contain complex business calculations.



\### 5.2 Application Service Layer



This layer coordinates business operations.



Examples:

\- Create an assessment session.

\- Submit student assessment.

\- Process an uploaded file.

\- Run skill analysis.

\- Generate recommendations.

\- Submit an initiative proposal.

\- Approve an initiative.

\- Generate an export.



Services coordinate domain modules and storage interfaces.



\### 5.3 Domain Layer



The domain layer contains the core business rules.



It includes:

\- Session lifecycle rules.

\- Skill taxonomy rules.

\- Proficiency classification.

\- Skill distribution calculations.

\- Skill-gap rules.

\- Recommendation rules.

\- Governance rules.

\- Export eligibility rules.



Domain logic should remain independent of HTTP request handling.



\### 5.4 Repository and Storage Layer



This layer abstracts data access.



It may include:

\- Temporary session repository.

\- Temporary assessment repository.

\- Temporary file repository.

\- Temporary export repository.

\- Persistent user repository, if required.

\- Persistent configuration repository, if required.

\- Taxonomy repository.



The repository interface should allow the temporary storage implementation to change without rewriting the business logic.



\## 6. Core Backend Modules



\### 6.1 Authentication Module



Responsibilities:

\- Authenticate users.

\- Establish user sessions or issue tokens.

\- Validate authentication credentials.

\- Handle logout.

\- Handle authentication expiry.

\- Integrate institutional SSO if selected.

\- Support MFA if approved.



Authentication must be separated from authorization.



\### 6.2 Authorization Module



Responsibilities:

\- Role-based permissions.

\- Department-level scope.

\- Institutional-level scope.

\- Resource ownership.

\- Session-level access.

\- Export permissions.

\- Identifiable-data access restrictions.



The backend must deny access by default.



The Administrator role must not automatically grant access to all student-level assessment data.



\### 6.3 User and Role Module



Responsibilities:

\- User profile management.

\- Role assignment.

\- Department association.

\- Account status.

\- Permission configuration.

\- Role changes and revocation.



User identity and authorization configuration are separate from temporary assessment records.



\### 6.4 Session Management Module



Responsibilities:

\- Create sessions.

\- Configure collection methods.

\- Manage opening and closing times.

\- Track session lifecycle.

\- Manage session access.

\- Track submissions.

\- Enforce expiry.

\- Initiate cleanup.



Supported session types:



1\. Form Collection.

2\. Bulk Upload.

3\. Combined Collection.



A session represents a temporary assessment workspace, not a permanent student assessment database.



\### 6.5 Assessment Module



Responsibilities:

\- Receive student assessment submissions.

\- Validate assessment payloads.

\- Check required fields.

\- Apply submission rules.

\- Handle duplicate submissions.

\- Associate submissions with a valid session.

\- Return submission status.



The module must not independently invent proficiency scores or analytical results.



\### 6.6 File Ingestion Module



Responsibilities:

\- Accept supported upload formats.

\- Validate file extensions and content.

\- Check file size.

\- Read CSV and XLSX files.

\- Detect malformed records.

\- Generate row-level validation errors.

\- Prepare valid records for normalization.



Supported initial formats:

\- CSV.

\- XLSX.



Uploaded files must be stored in protected temporary locations, not in a publicly accessible directory.



\### 6.7 Data Validation Module



Responsibilities:

\- Validate required columns.

\- Validate field types.

\- Check missing values.

\- Identify invalid department references.

\- Identify unknown skill values.

\- Detect duplicate records.

\- Validate proficiency inputs.

\- Generate a validation summary.



Validation must happen before records enter the analytical pipeline.



\### 6.8 Data Normalization Module



Responsibilities:

\- Convert form and upload inputs into a common schema.

\- Normalize skill names.

\- Resolve aliases.

\- Map skills to canonical taxonomy identifiers.

\- Standardize department references.

\- Normalize proficiency inputs.

\- Preserve evidence-source metadata.

\- Prepare normalized records.



Both collection channels must produce the same internal data structure.



\### 6.9 Skill Taxonomy Module



Responsibilities:

\- Maintain domains.

\- Maintain categories.

\- Maintain skills.

\- Manage aliases.

\- Manage skill relationships.

\- Manage department relevance.

\- Maintain taxonomy versions.



The taxonomy is a separate configuration concern and must not be mixed with student assessment records.



\### 6.10 Proficiency Module



Responsibilities:

\- Interpret proficiency declarations.

\- Apply approved assessment criteria.

\- Calculate proficiency scores where applicable.

\- Classify Beginner, Intermediate, and Expert.

\- Track evidence sources.

\- Distinguish self-reported and verified proficiency.

\- Handle missing or insufficient evidence.



The proposed numerical thresholds are provisional and must be configurable.



\### 6.11 Skill Analysis Engine



Responsibilities:

\- Calculate skill distributions.

\- Calculate proficiency distributions.

\- Aggregate results by department.

\- Calculate institutional distributions.

\- Calculate skill coverage.

\- Produce analytical metrics.

\- Generate structured analysis outputs.



The engine should be deterministic and version-aware.



\### 6.12 Skill Gap Analysis Module



Responsibilities:

\- Compare actual coverage with approved targets.

\- Identify coverage gaps.

\- Identify proficiency gaps.

\- Identify practical skill gaps.

\- Identify evidence gaps.

\- Consider department relevance.

\- Produce structured gap records.



The gap module consumes analysis outputs. It should remain separate from the calculation of basic skill distribution metrics.



\### 6.13 Recommendation Engine



Responsibilities:

\- Consume skill-gap results.

\- Evaluate configured recommendation rules.

\- Identify suitable development activities.

\- Assign recommendation categories.

\- Assign priority based on approved rules.

\- Generate explanations.

\- Return structured recommendations.



The initial release uses deterministic rule-based recommendations.



It must not autonomously approve institutional initiatives.



\### 6.14 Governance Module



Responsibilities:

\- HOD review.

\- Initiative proposal creation.

\- Proposal submission.

\- Dean review.

\- Approval.

\- Rejection.

\- Request for changes.

\- Deferral.

\- Decision status.



Governance records must follow the approved persistence policy.



If decision history must survive session expiry, it requires a separate persistent governance store. This must not silently result in permanent student skill record storage.



\### 6.15 Dashboard Module



Responsibilities:

\- Provide role-specific dashboard data.

\- Aggregate departmental metrics.

\- Provide institutional metrics.

\- Apply authorization filters.

\- Return chart-ready data.

\- Support filtering and pagination.



The frontend must not be responsible for independently calculating authoritative analytical metrics.



\### 6.16 Export Module



Responsibilities:

\- Validate export permissions.

\- Prepare report data.

\- Generate PDF files.

\- Generate Excel files.

\- Generate CSV files.

\- Generate complete ZIP packages.

\- Validate generated files.

\- Store files temporarily.

\- Provide secure downloads.

\- Expire and clean generated files.



Export generation must use a consistent analysis snapshot.



\### 6.17 Cleanup Module



Responsibilities:

\- Detect expired sessions.

\- Delete expired temporary assessment data.

\- Delete temporary upload files.

\- Delete analytical intermediate data.

\- Delete temporary recommendations.

\- Delete expired export files.

\- Clear expired job state.

\- Record cleanup outcomes without exposing sensitive content.



Cleanup must cover every storage location used by temporary assessment data.



\## 7. Data Storage Architecture



\### 7.1 Storage classification



The backend separates data into three broad categories.



| Category | Storage policy |

|---|---|

| Student assessment data | Temporary only |

| Platform configuration | Persistent where required |

| Generated exports | Temporary with independent expiry policy |



\### 7.2 Temporary assessment storage



Temporary data may include:

\- Assessment submissions.

\- Uploaded source datasets.

\- Normalized records.

\- Validation results.

\- Analytical outputs.

\- Skill-gap outputs.

\- Recommendations.

\- Temporary session metadata.



These records must not be permanently written to the student assessment database.



\### 7.3 In-memory prototype



A Python in-memory repository may be used during initial local development.



Example:



```python

class InMemorySessionRepository:

&#x20;   def \_\_init\_\_(self):

&#x20;       self.sessions = {}



&#x20;   def create(self, session\_id, session\_data):

&#x20;       self.sessions\[session\_id] = session\_data



&#x20;   def get(self, session\_id):

&#x20;       return self.sessions.get(session\_id)



&#x20;   def delete(self, session\_id):

&#x20;       self.sessions.pop(session\_id, None)

```



Limitations:

\- Data disappears when the process restarts.

\- Data is not shared between multiple worker processes.

\- Multiple application instances cannot share state.

\- Memory usage must be controlled.

\- Concurrent updates require synchronization.



This is suitable only for a controlled prototype or single-process deployment.



\### 7.4 Redis temporary storage



Redis may be introduced when multiple backend workers or instances are required.



Responsibilities:

\- Temporary session state.

\- Temporary assessment data.

\- Processing job status.

\- Short-lived coordination data.



Requirements:

\- TTL for temporary records.

\- Appropriate access controls.

\- Network isolation.

\- Memory limits.

\- Explicit cleanup.

\- No prohibited persistence or backups of student assessment data.



If the no-persistence policy applies strictly, Redis persistence features such as RDB snapshots and AOF must be disabled for this data, and backup mechanisms must not capture it.



\### 7.5 Persistent configuration storage



A separate persistent store may be used for:

\- User accounts.

\- Roles and permissions.

\- Skill taxonomy.

\- Proficiency configuration.

\- Recommendation rules.

\- Platform configuration.

\- Governance history, if approved.



These records must be logically separated from temporary student assessment data.



The final database design must define the exact persistent entities.



\## 8. Backend Project Structure



Proposed structure:



```text

backend/

│

├── app/

│   ├── main.py

│   │

│   ├── core/

│   │   ├── config.py

│   │   ├── security.py

│   │   ├── permissions.py

│   │   ├── exceptions.py

│   │   └── logging.py

│   │

│   ├── api/

│   │   └── v1/

│   │       ├── router.py

│   │       └── endpoints/

│   │

│   ├── modules/

│   │   ├── authentication/

│   │   ├── users/

│   │   ├── sessions/

│   │   ├── assessment/

│   │   ├── uploads/

│   │   ├── validation/

│   │   ├── normalization/

│   │   ├── taxonomy/

│   │   ├── proficiency/

│   │   ├── skill\_analysis/

│   │   ├── skill\_gaps/

│   │   ├── recommendations/

│   │   ├── governance/

│   │   ├── dashboards/

│   │   ├── exports/

│   │   └── cleanup/

│   │

│   ├── storage/

│   │   ├── interfaces/

│   │   ├── memory/

│   │   ├── redis/

│   │   └── persistent/

│   │

│   ├── workers/

│   │   ├── processing.py

│   │   ├── exports.py

│   │   └── cleanup.py

│   │

│   ├── schemas/

│   ├── dependencies/

│   └── utils/

│

├── tests/

│   ├── unit/

│   ├── integration/

│   ├── security/

│   └── api/

│

├── scripts/

├── migrations/

├── Dockerfile

├── requirements.txt

├── .env.example

└── README.md

```



Each module should contain its own relevant:

\- `router.py`

\- `schemas.py`

\- `service.py`

\- `repository.py`

\- `models.py`, where applicable

\- `exceptions.py`

\- `tests/`



Avoid creating empty abstraction files without an actual responsibility.



\## 9. API Architecture



\### 9.1 API versioning



All application APIs use:



`/api/v1/`



\### 9.2 Endpoint organization



| Module | Example route |

|---|---|

| Authentication | `/api/v1/auth/login` |

| Users | `/api/v1/users` |

| Sessions | `/api/v1/sessions` |

| Assessment | `/api/v1/assessment/submissions` |

| Uploads | `/api/v1/uploads` |

| Taxonomy | `/api/v1/taxonomy` |

| Proficiency | `/api/v1/proficiency` |

| Analysis | `/api/v1/analysis` |

| Skill gaps | `/api/v1/skill-gaps` |

| Recommendations | `/api/v1/recommendations` |

| Governance | `/api/v1/governance/proposals` |

| Dashboards | `/api/v1/dashboards` |

| Exports | `/api/v1/exports` |

| Health | `/api/v1/health` |



The detailed request and response contracts are defined in `API\_DOCUMENTATION.md`.



\## 10. Processing Architecture



\### 10.1 Processing pipeline



```text

Input

&#x20; |

&#x20; v

Authentication and Authorization

&#x20; |

&#x20; v

Session Validation

&#x20; |

&#x20; v

Input Validation

&#x20; |

&#x20; v

Normalization

&#x20; |

&#x20; v

Taxonomy Mapping

&#x20; |

&#x20; v

Proficiency Processing

&#x20; |

&#x20; v

Skill Analysis

&#x20; |

&#x20; v

Skill Gap Analysis

&#x20; |

&#x20; v

Recommendation Generation

&#x20; |

&#x20; v

Dashboard / Governance / Export

&#x20; |

&#x20; v

Temporary Retention

&#x20; |

&#x20; v

Cleanup

```



\### 10.2 Processing execution



Small operations may execute directly within the API request.



Long-running operations should use background processing.



Potential long-running operations:

\- Large file validation.

\- Large dataset normalization.

\- Skill analysis.

\- Recommendation generation.

\- PDF report generation.

\- Complete ZIP package generation.



The initial background-job implementation is an open architectural decision.



Possible approaches:

\- FastAPI background tasks for simple, limited operations.

\- A dedicated worker and job queue when reliability, concurrency, or processing duration requires it.



FastAPI background tasks are not a substitute for a durable distributed job queue when jobs must survive process restarts.



\### 10.3 Job state



Processing jobs should expose a controlled status model:



```text

REQUESTED

&#x20;  |

&#x20;  v

QUEUED

&#x20;  |

&#x20;  v

PROCESSING

&#x20;  |

&#x20;  +----> COMPLETED

&#x20;  |

&#x20;  +----> FAILED

&#x20;  |

&#x20;  +----> CANCELLED (if supported)

```



Job records must contain only the information required to track the operation.



They must not expose sensitive assessment data through status APIs.



\## 11. Session Lifecycle Integration



The backend must enforce the session lifecycle:



\- CREATED

\- SCHEDULED

\- ACTIVE

\- PROCESSING

\- COMPLETED

\- CLOSED

\- EXPIRED

\- CLEANING

\- CLEANED

\- FAILED



The backend is responsible for:

\- Enforcing session opening time.

\- Enforcing collection deadline.

\- Validating session status on submissions.

\- Preventing unauthorized access.

\- Initiating processing.

\- Enforcing expiry.

\- Triggering cleanup.



The collection deadline, session access expiry, temporary data retention, and export expiry are separate concepts.



\## 12. Security Architecture



Security controls must be applied across all backend layers.



\### 12.1 Authentication



\- Secure authentication mechanisms.

\- Password hashing if local passwords are used.

\- Token or session expiry.

\- MFA if approved.

\- Secure logout and revocation.

\- Institutional SSO integration if selected.



\### 12.2 Authorization



\- RBAC and ABAC.

\- Deny-by-default.

\- Department-level restrictions.

\- Institutional-level restrictions.

\- Resource ownership checks.

\- Export-specific permissions.

\- Identifiable-data authorization.



\### 12.3 Input security



\- Pydantic request validation.

\- File type validation.

\- File size limits.

\- Safe filename handling.

\- Upload content validation.

\- Protection against path traversal.

\- Protection against malicious spreadsheet content.

\- Rate limiting.



\### 12.4 Temporary data security



\- Protected storage.

\- Explicit TTL.

\- Restricted Redis access.

\- No public file paths.

\- Controlled cleanup.

\- No sensitive data in logs.

\- No unauthorized backup copies.



\### 12.5 API security



\- HTTPS.

\- CORS restrictions.

\- Secure headers at the reverse proxy.

\- Authentication on protected routes.

\- Authorization at resource level.

\- Request size limits.

\- Safe error responses.

\- Appropriate rate limits.



Detailed controls are specified in `SECURITY\_ARCHITECTURE.md`.



\## 13. Error Handling



All modules should use a consistent error response format.



Example:



```json

{

&#x20; "success": false,

&#x20; "error": {

&#x20;   "code": "SESSION\_EXPIRED",

&#x20;   "message": "The assessment session has expired.",

&#x20;   "details": null

&#x20; }

}

```



Error categories:

\- Authentication errors.

\- Authorization errors.

\- Validation errors.

\- Session errors.

\- Upload errors.

\- Processing errors.

\- Export errors.

\- Resource errors.

\- Internal errors.



Internal stack traces and secrets must not be returned to clients.



\## 14. Logging and Monitoring



Backend monitoring should cover:



\- Application health.

\- API response times.

\- API error rates.

\- Authentication failures.

\- Authorization failures.

\- Upload failures.

\- Processing duration.

\- Processing failures.

\- Temporary storage usage.

\- Redis memory usage, if deployed.

\- Export generation duration.

\- Cleanup execution.

\- Expired session counts.



Logs must not contain:

\- Passwords.

\- Authentication tokens.

\- Full student assessment payloads.

\- Sensitive exported data.

\- Unnecessary personally identifiable information.



Operational audit metadata should be separated from sensitive assessment content.



\## 15. Deployment Architecture



\### 15.1 Production deployment



```text

Internet

&#x20;  |

&#x20;  v

Domain / DNS

&#x20;  |

&#x20;  v

Nginx

&#x20;  |

&#x20;  +---- HTTPS termination

&#x20;  |

&#x20;  v

FastAPI / Uvicorn

&#x20;  |

&#x20;  +---- Application Modules

&#x20;  |

&#x20;  +---- Temporary Storage

&#x20;  |

&#x20;  +---- Persistent Configuration Store

&#x20;  |

&#x20;  +---- Processing Worker, if deployed

&#x20;  |

&#x20;  +---- Protected Temporary File Storage

```



\### 15.2 Containerization



Docker should package:

\- FastAPI application.

\- Processing worker, if separated.

\- Redis, if required.

\- Persistent database, if approved.



Docker Compose may be used for local development and initial deployment.



\### 15.3 Environment configuration



Environment variables should contain deployment-specific settings.



Example:



```env

APP\_ENV=development

APP\_NAME=SSIP

API\_V1\_PREFIX=/api/v1



DATABASE\_URL=

REDIS\_URL=



SECRET\_KEY=

ACCESS\_TOKEN\_EXPIRE\_MINUTES=30



MAX\_UPLOAD\_SIZE\_MB=20

SESSION\_RETENTION\_MINUTES=1440

EXPORT\_RETENTION\_MINUTES=1440



ALLOWED\_ORIGINS=

```



Values are illustrative. Actual retention periods, limits, authentication configuration, and secret-management mechanisms must be approved before deployment.



Secrets must never be committed to source control.



\## 16. Scalability and Reliability



The backend should support controlled growth.



Initial measures:

\- Modular code boundaries.

\- Efficient Pandas processing.

\- Upload size restrictions.

\- Pagination.

\- Processing concurrency limits.

\- Temporary storage limits.

\- Request timeouts.

\- Background jobs for expensive tasks.

\- Cleanup scheduling.

\- Health checks.



If multiple FastAPI workers are introduced, shared temporary state is required. Process-local memory cannot provide consistent cross-worker sessions.



Horizontal scaling should be introduced only after the shared-state and job-processing architecture is established.



\## 17. Backend Testing Strategy



\### Unit testing

\- Proficiency classification.

\- Skill normalization.

\- Taxonomy mapping.

\- Skill coverage calculation.

\- Skill-gap calculations.

\- Recommendation rules.

\- Session lifecycle rules.

\- Export validation.



\### Integration testing

\- Assessment submission.

\- Bulk upload.

\- Data validation.

\- Analysis pipeline.

\- Recommendation pipeline.

\- Governance workflow.

\- Export generation.

\- Cleanup.



\### API testing

\- Authentication.

\- Role permissions.

\- Department boundaries.

\- Session expiry.

\- Upload restrictions.

\- Error responses.

\- Rate limiting.



\### Security testing

\- Broken access control.

\- Privilege escalation.

\- Insecure direct object references.

\- File upload vulnerabilities.

\- Injection.

\- Authentication weaknesses.

\- Sensitive data exposure.

\- Temporary data retention failures.



\### Reliability testing

\- Backend restart during processing.

\- Redis unavailability.

\- Large upload handling.

\- Concurrent submissions.

\- Cleanup failure.

\- Export generation failure.

\- Worker failure.



\## 18. Implementation Phases



\### Phase 1 — Backend foundation

\- FastAPI setup.

\- Configuration management.

\- Centralized error handling.

\- API versioning.

\- Authentication foundation.

\- Application structure.



\### Phase 2 — Access and session management

\- User and role modules.

\- Authorization.

\- Session creation.

\- Session lifecycle.

\- Temporary repository interfaces.



\### Phase 3 — Assessment ingestion

\- Student assessment APIs.

\- Bulk upload APIs.

\- File validation.

\- Data normalization.

\- Taxonomy mapping.



\### Phase 4 — Intelligence processing

\- Proficiency framework.

\- Skill analysis engine.

\- Skill-gap analysis.

\- Recommendation engine.



\### Phase 5 — Governance and dashboards

\- HOD workflows.

\- Dean workflows.

\- Proposal handling.

\- Dashboard APIs.



\### Phase 6 — Export and cleanup

\- PDF generation.

\- Excel and CSV generation.

\- ZIP package generation.

\- Export lifecycle.

\- Cleanup service.



\### Phase 7 — Production readiness

\- Docker deployment.

\- HTTPS.

\- Monitoring.

\- Security testing.

\- Performance testing.

\- Backup policy for permitted persistent data.

\- Operational documentation.



\## 19. Architectural Constraints



1\. Student skill assessment data must not be permanently stored.

2\. Temporary data must have explicit expiry and cleanup.

3\. Persistent configuration must remain separate from assessment records.

4\. All authorization decisions must be enforced by the backend.

5\. API routes must not contain complex business calculations.

6\. The Skill Analysis Engine and Recommendation Engine must remain separate.

7\. Skill Gap Analysis must remain a distinct analytical responsibility.

8\. Recommendations must be explainable and rule-based in the initial release.

9\. Export generation must respect data authorization and retention policies.

10\. Long-running operations must expose accurate processing status.

11\. The initial deployment must remain a modular monolith.

12\. Process-local memory must not be treated as shared storage across multiple workers.



\## 20. Open Architectural Decisions



| Decision | Current position |

|---|---|

| Persistent database | Required only for approved persistent entities |

| Authentication | Institutional SSO or application authentication |

| Authentication mechanism | JWT or secure server-side sessions |

| Temporary storage | In-memory prototype; Redis for shared state |

| Background job framework | To be selected |

| Job status transport | Polling initially; SSE if justified |

| Redis persistence | Disabled for prohibited student assessment data |

| Governance persistence | Requires explicit approval |

| Audit retention | To be defined |

| Upload limits | To be benchmarked and approved |

| Processing concurrency | To be benchmarked |

| Export retention | Separate policy to be finalized |

| Deployment | Docker on Linux VPS |



\## 21. Definition of Completion



The backend architecture is considered implemented when:



\- All defined modules have clear responsibilities.

\- Authentication and authorization work correctly.

\- Student assessment data remains temporary.

\- Form and bulk upload inputs share a normalized schema.

\- Validation and normalization operate reliably.

\- Skill analysis produces reproducible outputs.

\- Skill-gap calculations use approved targets.

\- Recommendations follow versioned rules.

\- HOD and Dean workflows enforce permissions.

\- Export generation follows the approved privacy policy.

\- Cleanup removes expired temporary data.

\- Processing states reflect actual job status.

\- API contracts are documented and tested.

\- Deployment and monitoring are operational.



\---



\*\*End of BACKEND\_ARCHITECTURE.md\*\*

