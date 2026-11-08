\# API\_DOCUMENTATION.md



\*\*Document Version:\*\* 1.0  

\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*API Version:\*\* v1  

\*\*Status:\*\* Proposed  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the REST API architecture and endpoint specifications for the Student Skill Intelligence Platform.



The API acts as the communication layer between:



\- React frontend.

\- FastAPI backend.

\- Authentication and authorization modules.

\- Assessment collection modules.

\- Session management.

\- Skill analysis engine.

\- Skill gap analysis.

\- Recommendation engine.

\- Dashboard and reporting modules.

\- Export and cleanup services.



The API must provide consistent, secure, and predictable communication across all platform modules.



\## 2. API Design Principles



The API follows these principles:



1\. RESTful resource-oriented design.

2\. Consistent endpoint naming.

3\. JSON-based request and response formats by default.

4\. Explicit authentication and authorization.

5\. Backend-enforced resource scoping.

6\. Session-based temporary assessment processing.

7\. Structured validation and error responses.

8\. Versioned API contracts.

9\. Pagination for collection endpoints where necessary.

10\. No permanent student skill-assessment storage.



\## 3. Technology Stack



| Component | Technology |

|---|---|

| Backend framework | FastAPI |

| Programming language | Python |

| API architecture | REST |

| Data format | JSON |

| File uploads | Multipart/form-data |

| Authentication | Pending implementation decision |

| Authorization | RBAC + ABAC |

| Request validation | Pydantic |

| API documentation | OpenAPI / Swagger UI |

| Frontend integration | React + TypeScript |

| Processing | Pandas + NumPy |

| Temporary session storage | In-memory / Redis |

| Export generation | ReportLab, OpenPyXL, ZIP utilities |



\## 4. Base URL and Versioning



\### 4.1 Base URL



Development:



```text

http://localhost:8000/api/v1

```



Production:



```text

https://<configured-api-domain>/api/v1

```



The production domain must be configured during deployment.



\### 4.2 API Versioning



All public API endpoints must include a version prefix.



```text

/api/v1/

```



A breaking API change should introduce a new version rather than silently changing an existing contract.



\### 4.3 API Naming Convention



Use:



\- Lowercase resource names.

\- Hyphens only where needed for multiword names.

\- Plural resource names for collections.

\- HTTP methods to represent operations.



Examples:



```text

GET    /api/v1/sessions

POST   /api/v1/sessions

GET    /api/v1/sessions/{session\_id}

DELETE /api/v1/sessions/{session\_id}

```



Avoid creating multiple endpoints for the same operation without a clear requirement.



\## 5. HTTP Methods



| Method | Purpose | Example |

|---|---|---|

| GET | Retrieve information | Get session details |

| POST | Create a resource or execute an operation | Create assessment session |

| PUT | Replace an existing resource | Replace configuration |

| PATCH | Partially update a resource | Update session settings |

| DELETE | Delete an authorized resource | Delete temporary session |



The backend must enforce the appropriate authorization and lifecycle conditions for every method.



\## 6. Authentication



All protected endpoints require an authenticated user.



\### 6.1 Authentication Options



The final authentication mechanism is pending institutional and implementation decisions.



Possible approaches:



\- University Single Sign-On.

\- Platform-managed authentication.

\- A compatible institutional identity provider.



The API must support secure authentication without exposing credentials to unauthorized services.



\### 6.2 Authentication Endpoints



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/auth/login` | Authenticate a user, if platform-managed login is used |

| POST | `/auth/logout` | End the authenticated session |

| POST | `/auth/refresh` | Refresh authentication credentials, if supported |

| GET | `/auth/me` | Retrieve the current user's permitted profile |

| POST | `/auth/forgot-password` | Initiate password recovery, if supported |

| POST | `/auth/reset-password` | Complete password recovery, if supported |



University SSO may replace some of these endpoints with an identity-provider integration flow.



\### 6.3 Current User Response



Example:



```json

{

&#x20; "user\_id": "USR-001",

&#x20; "role": "HOD",

&#x20; "department\_id": "DEPT-CSE",

&#x20; "permissions": \[

&#x20;   "analytics.view\_department",

&#x20;   "sessions.create",

&#x20;   "recommendations.review",

&#x20;   "proposals.submit"

&#x20; ],

&#x20; "account\_status": "ACTIVE"

}

```



The response must contain only information the authenticated user is authorized to receive.



\## 7. Authorization Requirements



The API uses hybrid RBAC and ABAC authorization.



Every protected request must evaluate:



1\. Authentication status.

2\. Account status.

3\. Required permission.

4\. Resource ownership.

5\. Department or institutional scope.

6\. Session lifecycle state.

7\. Data classification restrictions.



\### 7.1 Role Access Summary



| Module | Administrator | Dean | HOD | Student |

|---|---|---|---|---|

| User management | Authorized | No | No | No |

| Platform configuration | Authorized | No | No | No |

| Institutional analytics | No by default | Yes | No | No |

| Departmental analytics | No by default | Yes | Assigned department | No |

| Institutional sessions | No by default | Yes | No | Assigned access |

| Departmental sessions | No by default | Yes | Delegated scope | Assigned access |

| Assessment submission | No | No | No | Own submission |

| Recommendations | Configuration | Institutional review | Departmental review | No |

| Proposal approval | No | Yes | No | No |

| Departmental proposal | No | No | Yes | No |

| Exports | No by default | Authorized | Authorized department | No |



This table describes the proposed default model. The actual permission registry remains authoritative.



\### 7.2 Department Scope



Every departmental endpoint must verify that the requested department matches the authenticated user's authorized department.



A client-supplied `department\_id` must never be trusted as proof of access.



\### 7.3 Backend Enforcement



The backend must independently authorize every protected operation.



Frontend navigation restrictions are not security controls.



\## 8. Standard Request and Response Formats



\### 8.1 JSON Request



Example:



```json

{

&#x20; "session\_name": "CSE Skill Assessment",

&#x20; "session\_type": "FORM\_COLLECTION",

&#x20; "department\_id": "DEPT-CSE"

}

```



\### 8.2 Successful Response



The API should use consistent response structures.



Example:



```json

{

&#x20; "success": true,

&#x20; "message": "Session created successfully",

&#x20; "data": {

&#x20;   "session\_id": "SES-001",

&#x20;   "session\_status": "CREATED"

&#x20; },

&#x20; "meta": {

&#x20;   "api\_version": "v1"

&#x20; }

}

```



\### 8.3 Error Response



Example:



```json

{

&#x20; "success": false,

&#x20; "error": {

&#x20;   "code": "INSUFFICIENT\_PERMISSION",

&#x20;   "message": "You are not authorized to perform this operation"

&#x20; },

&#x20; "meta": {

&#x20;   "api\_version": "v1"

&#x20; }

}

```



The API must not expose stack traces, credentials, internal paths, or confidential assessment information in error responses.



\## 9. Module 1 — User Management APIs



These endpoints manage user accounts and organizational associations.



\### 9.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/users` | Create user | `users.create` |

| GET | `/users` | List authorized users | `users.view` |

| GET | `/users/{user\_id}` | Retrieve user | `users.view` |

| PATCH | `/users/{user\_id}` | Update user | `users.update` |

| PATCH | `/users/{user\_id}/status` | Activate or deactivate account | `users.deactivate` |

| PUT | `/users/{user\_id}/role` | Assign application role | `users.assign\_role` |

| PUT | `/users/{user\_id}/department` | Assign department | `users.assign\_department` |



\### 9.2 Create User



\*\*Request\*\*



```json

{

&#x20; "institutional\_id": "EMP-001",

&#x20; "display\_name": "Department HOD",

&#x20; "role": "HOD",

&#x20; "department\_id": "DEPT-CSE"

}

```



\*\*Response\*\*



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "user\_id": "USR-001",

&#x20;   "role": "HOD",

&#x20;   "department\_id": "DEPT-CSE",

&#x20;   "account\_status": "ACTIVE"

&#x20; }

}

```



The backend must validate role eligibility and department association.



\## 10. Module 2 — Assessment Session APIs



These endpoints manage temporary assessment workspaces.



\### 10.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/sessions` | Create session | `sessions.create` |

| GET | `/sessions` | List authorized sessions | `sessions.view` |

| GET | `/sessions/{session\_id}` | Retrieve session details | `sessions.view` |

| PATCH | `/sessions/{session\_id}` | Update permitted settings | `sessions.update` |

| POST | `/sessions/{session\_id}/activate` | Activate session | `sessions.activate` |

| POST | `/sessions/{session\_id}/close` | Close session | `sessions.close` |

| POST | `/sessions/{session\_id}/expire` | Request authorized expiry | `sessions.expire` |

| GET | `/sessions/{session\_id}/status` | Retrieve lifecycle status | `sessions.view` |

| DELETE | `/sessions/{session\_id}` | Delete eligible temporary session | `sessions.delete` |



\### 10.2 Create Session



\*\*Request\*\*



```json

{

&#x20; "session\_name": "Department Skill Assessment",

&#x20; "session\_type": "COMBINED",

&#x20; "department\_id": "DEPT-CSE",

&#x20; "collection\_deadline": "2026-11-20T18:00:00",

&#x20; "retention\_policy\_id": "POLICY-DEFAULT"

}

```



Supported session types:



\- `FORM\_COLLECTION`

\- `BULK\_UPLOAD`

\- `COMBINED`



The retention policy identifier must reference an approved configuration. The backend must not accept arbitrary retention overrides from unauthorized users.



\*\*Response\*\*



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "session\_id": "SES-001",

&#x20;   "session\_status": "CREATED",

&#x20;   "session\_type": "COMBINED",

&#x20;   "created\_at": "2026-11-07T10:00:00Z"

&#x20; }

}

```



Timestamps in examples are illustrative.



\### 10.3 Session Status



Possible lifecycle states:



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



The backend must validate all state transitions.



\## 11. Module 3 — Student Assessment APIs



These endpoints support form-based skill collection.



\### 11.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| GET | `/sessions/{session\_id}/assessment-form` | Retrieve permitted form structure | `assessment.form.view` |

| POST | `/sessions/{session\_id}/submissions` | Submit assessment | `assessment.submit` |

| GET | `/submissions/{submission\_id}` | Retrieve permitted submission | `assessment.view\_own` |

| PATCH | `/submissions/{submission\_id}` | Revise permitted submission | `assessment.revise` |

| GET | `/submissions/{submission\_id}/status` | Retrieve submission status | `assessment.view\_own` |



\### 11.2 Submit Assessment



\*\*Request\*\*



```json

{

&#x20; "skills": \[

&#x20;   {

&#x20;     "skill\_id": "SKILL-PYTHON",

&#x20;     "self\_reported\_level": "INTERMEDIATE",

&#x20;     "experience\_type": \[

&#x20;       "PROJECT",

&#x20;       "PRACTICAL"

&#x20;     ],

&#x20;     "evidence\_description": "Used Python for academic projects"

&#x20;   },

&#x20;   {

&#x20;     "skill\_id": "SKILL-LINUX",

&#x20;     "self\_reported\_level": "BEGINNER",

&#x20;     "experience\_type": \[

&#x20;       "PRACTICAL"

&#x20;     ]

&#x20;   }

&#x20; ]

}

```



\*\*Response\*\*



```json

{

&#x20; "success": true,

&#x20; "message": "Assessment submitted",

&#x20; "data": {

&#x20;   "submission\_id": "SUB-001",

&#x20;   "submission\_status": "SUBMITTED"

&#x20; }

}

```



\### 11.3 Submission Security



The backend must:



\- Derive the student identity from the authenticated user.

\- Validate the session assignment.

\- Validate the session status.

\- Prevent unauthorized submission modification.

\- Apply duplicate-submission policy.

\- Avoid trusting a client-supplied student identifier.



The duplicate policy remains a separate session-management decision.



\## 12. Module 4 — File Upload APIs



These endpoints support authorized bulk dataset uploads.



\### 12.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/sessions/{session\_id}/uploads` | Upload dataset | `uploads.create` |

| GET | `/uploads/{upload\_id}` | Retrieve upload status | `uploads.view` |

| POST | `/uploads/{upload\_id}/validate` | Validate uploaded file | `uploads.validate` |

| GET | `/uploads/{upload\_id}/validation-report` | Retrieve validation report | `uploads.view` |

| POST | `/uploads/{upload\_id}/process` | Process valid dataset | `uploads.process` |

| DELETE | `/uploads/{upload\_id}` | Delete eligible temporary upload | `uploads.delete` |



\### 12.2 Supported Formats



\- `.xlsx`

\- `.csv`



Additional formats require explicit implementation and validation.



\### 12.3 Upload Request



Content type:



```text

multipart/form-data

```



Fields:



```text

file: assessment\_dataset.xlsx

```



Example using cURL:



```bash

curl -X POST \\

&#x20; "http://localhost:8000/api/v1/sessions/SES-001/uploads" \\

&#x20; -H "Authorization: Bearer <token>" \\

&#x20; -F "file=@assessment\_dataset.xlsx"

```



The authentication example is illustrative; the final credential transport depends on the selected authentication architecture.



\### 12.4 Upload Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "upload\_id": "UPL-001",

&#x20;   "filename": "assessment\_dataset.xlsx",

&#x20;   "upload\_status": "UPLOADED",

&#x20;   "validation\_status": "PENDING"

&#x20; }

}

```



\### 12.5 Validation Report



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "upload\_id": "UPL-001",

&#x20;   "validation\_status": "COMPLETED",

&#x20;   "total\_rows": 500,

&#x20;   "valid\_rows": 480,

&#x20;   "invalid\_rows": 20,

&#x20;   "errors": \[

&#x20;     {

&#x20;       "row": 12,

&#x20;       "field": "department",

&#x20;       "error\_code": "INVALID\_DEPARTMENT"

&#x20;     }

&#x20;   ]

&#x20; }

}

```



The response should not unnecessarily expose identifiable student data.



\### 12.6 Upload Security



The backend must validate:



\- File extension.

\- Actual file format.

\- File size.

\- File structure.

\- Column names.

\- Row limits.

\- Data types.

\- Encoding.

\- File-processing resource limits.



Uploaded files must remain outside public web directories.



\## 13. Module 5 — Skill Taxonomy APIs



These endpoints expose the approved skill classification structure.



\### 13.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| GET | `/taxonomy/domains` | List skill domains | `taxonomy.view` |

| GET | `/taxonomy/categories` | List skill categories | `taxonomy.view` |

| GET | `/taxonomy/skills` | List skills | `taxonomy.view` |

| GET | `/taxonomy/skills/{skill\_id}` | Retrieve skill details | `taxonomy.view` |

| POST | `/taxonomy/skills` | Create skill | `taxonomy.manage` |

| PATCH | `/taxonomy/skills/{skill\_id}` | Update skill | `taxonomy.manage` |

| DELETE | `/taxonomy/skills/{skill\_id}` | Retire or remove eligible skill | `taxonomy.manage` |

| GET | `/taxonomy/versions` | List taxonomy versions | `taxonomy.view` |



\### 13.2 Skill Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "skill\_id": "SKILL-PYTHON",

&#x20;   "skill\_name": "Python Programming",

&#x20;   "category\_id": "CAT-PROGRAMMING",

&#x20;   "domain\_id": "DOM-SOFTWARE",

&#x20;   "aliases": \[

&#x20;     "Python"

&#x20;   ],

&#x20;   "status": "ACTIVE"

&#x20; }

}

```



Taxonomy changes must be versioned so existing analytical results remain interpretable.



\## 14. Module 6 — Proficiency Framework APIs



These endpoints expose proficiency definitions and authorized configuration.



\### 14.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| GET | `/proficiency/framework` | Retrieve active framework | `proficiency.view` |

| GET | `/proficiency/levels` | Retrieve proficiency levels | `proficiency.view` |

| GET | `/proficiency/evidence-types` | Retrieve evidence types | `proficiency.view` |

| PATCH | `/proficiency/framework` | Update approved configuration | `proficiency.manage` |

| GET | `/proficiency/versions` | Retrieve framework versions | `proficiency.view` |



\### 14.2 Proficiency Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "levels": \[

&#x20;     "BEGINNER",

&#x20;     "INTERMEDIATE",

&#x20;     "EXPERT"

&#x20;   ],

&#x20;   "evidence\_types": \[

&#x20;     "SELF\_REPORTED",

&#x20;     "ASSESSMENT\_BASED",

&#x20;     "PROJECT\_BASED",

&#x20;     "CERTIFICATION\_BASED",

&#x20;     "FACULTY\_VERIFIED"

&#x20;   ],

&#x20;   "framework\_version": "1.0"

&#x20; }

}

```



The actual scoring criteria and thresholds must come from the approved proficiency configuration.



\## 15. Module 7 — Skill Analysis APIs



These endpoints execute and retrieve skill analysis results.



\### 15.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/sessions/{session\_id}/analysis/run` | Execute skill analysis | `analytics.generate` |

| GET | `/sessions/{session\_id}/analysis` | Retrieve analysis summary | Appropriate analytics permission |

| GET | `/sessions/{session\_id}/analysis/skills` | Retrieve skill distributions | Appropriate analytics permission |

| GET | `/sessions/{session\_id}/analysis/proficiency` | Retrieve proficiency distribution | Appropriate analytics permission |

| GET | `/sessions/{session\_id}/analysis/departments` | Retrieve departmental metrics | Appropriate analytics permission |

| GET | `/sessions/{session\_id}/analysis/metadata` | Retrieve analysis metadata | Appropriate analytics permission |



\### 15.2 Execute Analysis



\*\*Request\*\*



```json

{

&#x20; "analysis\_scope": "DEPARTMENT",

&#x20; "force\_recalculation": false

}

```



\*\*Response\*\*



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "analysis\_id": "ANL-001",

&#x20;   "session\_id": "SES-001",

&#x20;   "analysis\_status": "COMPLETED",

&#x20;   "analysis\_revision": 1,

&#x20;   "taxonomy\_version": "1.0",

&#x20;   "proficiency\_framework\_version": "1.0"

&#x20; }

}

```



\### 15.3 Skill Distribution Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "department\_id": "DEPT-CSE",

&#x20;   "skills": \[

&#x20;     {

&#x20;       "skill\_id": "SKILL-PYTHON",

&#x20;       "skill\_name": "Python Programming",

&#x20;       "student\_count": 120,

&#x20;       "coverage\_percentage": 65.5

&#x20;     }

&#x20;   ]

&#x20; }

}

```



All values are illustrative.



\### 15.4 Analysis Requirements



\- Analysis must operate on a consistent session snapshot.

\- The source dataset revision must be recorded.

\- Taxonomy and proficiency versions must be recorded.

\- Invalid or incomplete analysis must not be presented as complete.

\- Recalculation must produce a distinguishable analysis revision.

\- Results must follow the temporary retention policy.



\## 16. Module 8 — Skill Gap Analysis APIs



The Skill Gap Analysis Module compares validated analytical metrics against approved institutional or departmental targets.



\### 16.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/sessions/{session\_id}/gaps/run` | Execute gap analysis | `gaps.generate` |

| GET | `/sessions/{session\_id}/gaps` | Retrieve gap summary | Appropriate analytics permission |

| GET | `/sessions/{session\_id}/gaps/skills` | Retrieve skill-level gaps | Appropriate analytics permission |

| GET | `/sessions/{session\_id}/gaps/departments` | Retrieve departmental gaps | Appropriate analytics permission |

| GET | `/sessions/{session\_id}/gaps/{gap\_id}` | Retrieve gap details | Appropriate analytics permission |



\### 16.2 Gap Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "gap\_id": "GAP-001",

&#x20;   "department\_id": "DEPT-CSE",

&#x20;   "skill\_id": "SKILL-PYTHON",

&#x20;   "current\_coverage": 45,

&#x20;   "target\_coverage": 70,

&#x20;   "coverage\_gap": 25,

&#x20;   "gap\_status": "IDENTIFIED"

&#x20; }

}

```



The example values are not approved institutional targets.



\### 16.3 Gap Analysis Requirements



\- Only approved targets may be used.

\- Missing targets must be reported explicitly.

\- Departmental relevance must be considered.

\- Assessment participation must be considered.

\- Evidence gaps must remain distinct from competency gaps.

\- The source analysis revision must be recorded.



\## 17. Module 9 — Recommendation APIs



These endpoints generate and retrieve development recommendations.



\### 17.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/sessions/{session\_id}/recommendations/generate` | Generate recommendations | `recommendations.generate` |

| GET | `/sessions/{session\_id}/recommendations` | Retrieve recommendations | `recommendations.view` |

| GET | `/recommendations/{recommendation\_id}` | Retrieve recommendation details | `recommendations.view` |

| GET | `/sessions/{session\_id}/recommendations/summary` | Retrieve recommendation summary | `recommendations.view` |

| POST | `/recommendations/{recommendation\_id}/validate` | Validate recommendation | `recommendations.validate` |



\### 17.2 Generate Recommendations



\*\*Request\*\*



```json

{

&#x20; "analysis\_revision": 1,

&#x20; "generation\_mode": "RULE\_BASED"

}

```



\*\*Response\*\*



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "generation\_id": "GEN-001",

&#x20;   "session\_id": "SES-001",

&#x20;   "generation\_status": "COMPLETED",

&#x20;   "recommendation\_count": 8

&#x20; }

}

```



\### 17.3 Recommendation Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "recommendation\_id": "REC-001",

&#x20;   "skill\_id": "SKILL-PYTHON",

&#x20;   "department\_id": "DEPT-CSE",

&#x20;   "need\_type": "PRACTICAL\_SKILL\_GAP",

&#x20;   "initiative\_category": "PRACTICAL\_LAB",

&#x20;   "priority": "MEDIUM",

&#x20;   "justification": "The configured practical skill target has not been reached.",

&#x20;   "rule\_id": "REC-PRACTICAL-001",

&#x20;   "rule\_version": "1.0",

&#x20;   "analysis\_revision": 1

&#x20; }

}

```



Recommendations must be explainable and linked to their source analytical results.



The engine generates recommendations; it does not approve initiatives.



\## 18. Module 10 — Proposal and Governance APIs



These endpoints support HOD review and Dean decisions.



\### 18.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/recommendations/{recommendation\_id}/review` | Record HOD review | `recommendations.review` |

| POST | `/proposals` | Create departmental proposal | `proposals.create` |

| GET | `/proposals` | List authorized proposals | `proposals.view` |

| GET | `/proposals/{proposal\_id}` | Retrieve proposal | `proposals.view` |

| PATCH | `/proposals/{proposal\_id}` | Update eligible proposal | `proposals.update` |

| POST | `/proposals/{proposal\_id}/submit` | Submit to Dean | `proposals.submit` |

| POST | `/proposals/{proposal\_id}/approve` | Approve proposal | `proposals.approve` |

| POST | `/proposals/{proposal\_id}/reject` | Reject proposal | `proposals.reject` |

| POST | `/proposals/{proposal\_id}/request-changes` | Request modification | `proposals.request\_changes` |

| POST | `/proposals/{proposal\_id}/defer` | Defer decision | `proposals.defer` |



\### 18.2 Create Proposal



\*\*Request\*\*



```json

{

&#x20; "recommendation\_id": "REC-001",

&#x20; "department\_id": "DEPT-CSE",

&#x20; "proposal\_title": "Practical Python Development Program",

&#x20; "initiative\_category": "PRACTICAL\_LAB",

&#x20; "learning\_outcomes": \[

&#x20;   "Develop practical Python programming skills",

&#x20;   "Build small applications",

&#x20;   "Apply debugging techniques"

&#x20; ],

&#x20; "justification": "Address the identified practical skill-development requirement."

}

```



\*\*Response\*\*



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "proposal\_id": "PROP-001",

&#x20;   "proposal\_status": "DRAFT"

&#x20; }

}

```



\### 18.3 Approval Request



\*\*Request\*\*



```json

{

&#x20; "decision": "APPROVED",

&#x20; "remarks": "Approved subject to institutional scheduling."

}

```



\*\*Response\*\*



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "proposal\_id": "PROP-001",

&#x20;   "proposal\_status": "APPROVED"

&#x20; }

}

```



The backend must verify the Dean's authority and proposal lifecycle state.



Governance decision persistence after assessment-session expiry requires a separate approved storage policy.



\## 19. Module 11 — Dashboard and Analytics APIs



These endpoints provide dashboard data.



\### 19.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| GET | `/dashboard/summary` | Retrieve role-specific summary | Appropriate dashboard permission |

| GET | `/dashboard/skills` | Retrieve skill overview | Appropriate analytics permission |

| GET | `/dashboard/proficiency` | Retrieve proficiency overview | Appropriate analytics permission |

| GET | `/dashboard/skill-gaps` | Retrieve skill-gap summary | Appropriate analytics permission |

| GET | `/dashboard/recommendations` | Retrieve recommendation summary | `recommendations.view` |

| GET | `/dashboard/departments` | Retrieve departmental comparisons | `analytics.compare\_departments` |



\### 19.2 Dashboard Filters



Where applicable, endpoints may support:



```text

?session\_id=SES-001

?department\_id=DEPT-CSE

?domain\_id=DOM-CYBERSECURITY

?skill\_id=SKILL-PYTHON

?proficiency\_level=INTERMEDIATE

```



All filters must be validated against the user's authorized scope.



A query parameter must never override backend authorization.



\### 19.3 Dashboard Response



```json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "session\_id": "SES-001",

&#x20;   "total\_assessments": 500,

&#x20;   "valid\_submissions": 480,

&#x20;   "departments\_covered": 4,

&#x20;   "analysis\_status": "COMPLETED",

&#x20;   "recommendation\_count": 8

&#x20; }

}

```



These figures are illustrative.



\## 20. Module 12 — Export APIs



The export module provides reports and complete analysis packages.



\### 20.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| POST | `/sessions/{session\_id}/exports` | Generate export | Appropriate export permission |

| GET | `/exports/{export\_id}` | Retrieve export metadata | `exports.view` |

| GET | `/exports/{export\_id}/download` | Download export | Appropriate export permission |

| GET | `/exports/{export\_id}/status` | Retrieve export status | `exports.view` |

| DELETE | `/exports/{export\_id}` | Delete eligible temporary export | `exports.delete` |



\### 20.2 Generate Reports-Only Export



\*\*Request\*\*



```json

{

&#x20; "export\_mode": "REPORTS\_ONLY",

&#x20; "format": "PDF",

&#x20; "include\_student\_identifiers": false,

&#x20; "analysis\_revision": 1

}

```



Supported formats:



\- PDF.

\- XLSX.

\- CSV.



\### 20.3 Generate Complete Analysis Package



\*\*Request\*\*



```json

{

&#x20; "export\_mode": "COMPLETE\_ANALYSIS",

&#x20; "format": "ZIP",

&#x20; "include\_original\_upload": true,

&#x20; "include\_identifiable\_data": false,

&#x20; "analysis\_revision": 1

}

```



The backend must independently verify authorization for every requested content category.



For form-only sessions, `include\_original\_upload` must not create or imply the existence of an original uploaded file.



\### 20.4 Export Response



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



The expiry timestamp is illustrative. Actual expiry must come from approved configuration.



\### 20.5 Download Security



\- Download access requires authentication and authorization.

\- Download identifiers must be unpredictable.

\- Expired files must not be downloadable.

\- Export files must remain outside public directories.

\- Identifiable information requires explicit authorization.



\## 21. Module 13 — Recommendation Rule Management APIs



These endpoints manage recommendation rules.



\### 21.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| GET | `/admin/recommendation-rules` | List rules | `recommendation\_rules.view` |

| POST | `/admin/recommendation-rules` | Create rule | `recommendation\_rules.manage` |

| GET | `/admin/recommendation-rules/{rule\_id}` | Retrieve rule | `recommendation\_rules.view` |

| PUT | `/admin/recommendation-rules/{rule\_id}` | Replace rule | `recommendation\_rules.manage` |

| PATCH | `/admin/recommendation-rules/{rule\_id}/status` | Activate or deactivate rule | `recommendation\_rules.manage` |

| GET | `/admin/recommendation-rules/{rule\_id}/versions` | Retrieve rule versions | `recommendation\_rules.view` |



Rule changes must be versioned.



\## 22. Module 14 — Platform Configuration APIs



\### 22.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| GET | `/admin/settings` | Retrieve permitted settings | `settings.view` |

| PATCH | `/admin/settings` | Update approved settings | `settings.manage` |

| GET | `/admin/retention-policies` | Retrieve retention policies | `retention.view` |

| POST | `/admin/retention-policies` | Create approved retention policy | `retention.manage` |

| PATCH | `/admin/retention-policies/{policy\_id}` | Update retention policy | `retention.manage` |



Retention-policy modifications must follow institutional approval.



An administrator must not be able to silently create a retention policy that violates the no-permanent-student-skill-storage requirement.



\## 23. Module 15 — System Health and Cleanup APIs



These endpoints support operational monitoring.



\### 23.1 Endpoints



| Method | Endpoint | Purpose | Permission |

|---|---|---|---|

| GET | `/health` | Basic application health | Public or restricted according to deployment |

| GET | `/health/ready` | Readiness check | Internal monitoring |

| GET | `/admin/system/status` | Detailed system status | `system.monitor` |

| GET | `/admin/cleanup/status` | Retrieve cleanup status | `cleanup.monitor` |

| POST | `/admin/cleanup/run` | Trigger authorized cleanup | `cleanup.execute` |

| GET | `/admin/cleanup/history` | Retrieve cleanup execution history | `cleanup.monitor` |



\### 23.2 Health Endpoint



Example:



```json

{

&#x20; "status": "healthy",

&#x20; "service": "ssip-api",

&#x20; "version": "1.0"

}

```



Public health endpoints must not expose internal infrastructure details.



\### 23.3 Cleanup Endpoint



Cleanup must operate according to approved expiry policies.



Manual cleanup must:



\- Require explicit authorization.

\- Validate the requested scope.

\- Avoid deleting unrelated sessions.

\- Record the execution result.

\- Report failures.



\## 24. Pagination, Filtering, and Sorting



Collection endpoints should support pagination where datasets may be large.



\### 24.1 Query Parameters



```text

?page=1

\&page\_size=20

\&sort\_by=created\_at

\&sort\_order=desc

```



\### 24.2 Pagination Response



```json

{

&#x20; "success": true,

&#x20; "data": \[],

&#x20; "meta": {

&#x20;   "page": 1,

&#x20;   "page\_size": 20,

&#x20;   "total\_items": 100,

&#x20;   "total\_pages": 5

&#x20; }

}

```



The backend must enforce reasonable maximum page sizes.



Pagination must not reveal the existence or count of resources outside the user's authorized scope.



\## 25. Standard HTTP Status Codes



| Status | Meaning | Example |

|---|---|---|

| 200 | OK | Successful retrieval |

| 201 | Created | Session created |

| 202 | Accepted | Analysis or export processing started |

| 204 | No Content | Successful deletion |

| 400 | Bad Request | Invalid request |

| 401 | Unauthorized | Missing or invalid authentication |

| 403 | Forbidden | Insufficient permission |

| 404 | Not Found | Resource unavailable or intentionally concealed |

| 409 | Conflict | Invalid lifecycle transition |

| 410 | Gone | Expired resource |

| 413 | Payload Too Large | Upload exceeds configured size |

| 415 | Unsupported Media Type | Unsupported upload format |

| 422 | Unprocessable Entity | Schema or field validation failure |

| 429 | Too Many Requests | Rate limit exceeded |

| 500 | Internal Server Error | Unexpected backend failure |

| 503 | Service Unavailable | Required service unavailable |



The exact status code may depend on the endpoint and whether resource existence can safely be disclosed.



\## 26. Error Code Convention



Application errors should use stable machine-readable codes.



| Error code | Meaning |

|---|---|

| `AUTHENTICATION\_REQUIRED` | Authentication missing |

| `INVALID\_CREDENTIALS` | Authentication failed |

| `ACCOUNT\_INACTIVE` | Account disabled |

| `INSUFFICIENT\_PERMISSION` | Required permission missing |

| `RESOURCE\_SCOPE\_VIOLATION` | Resource outside authorized scope |

| `SESSION\_NOT\_FOUND` | Session unavailable |

| `SESSION\_EXPIRED` | Session expired |

| `INVALID\_SESSION\_STATE` | Operation not allowed in current state |

| `INVALID\_FILE\_FORMAT` | Unsupported or invalid file |

| `FILE\_TOO\_LARGE` | Upload exceeds size limit |

| `DATA\_VALIDATION\_FAILED` | Assessment data validation failed |

| `ANALYSIS\_NOT\_AVAILABLE` | Analysis unavailable |

| `TARGET\_CONFIGURATION\_MISSING` | Required skill target unavailable |

| `RECOMMENDATION\_GENERATION\_FAILED` | Recommendation processing failed |

| `EXPORT\_EXPIRED` | Export expired |

| `RESOURCE\_NOT\_FOUND` | Resource unavailable |

| `RATE\_LIMIT\_EXCEEDED` | Request limit exceeded |

| `INTERNAL\_ERROR` | Unexpected backend failure |



Error codes must remain stable across frontend and backend releases wherever possible.



\## 27. API Security Requirements



Every API module must follow the security architecture.



\### 27.1 Authentication



\- Protected endpoints require valid authentication.

\- Inactive accounts must be rejected.

\- Credentials must never be logged.

\- Authentication sessions must support revocation.



\### 27.2 Authorization



\- Enforce RBAC and ABAC.

\- Validate department scope.

\- Validate resource ownership.

\- Validate session state.

\- Enforce export permissions.

\- Apply deny-by-default behavior.



\### 27.3 Input Security



\- Validate all request schemas.

\- Restrict file sizes.

\- Validate file formats.

\- Prevent injection.

\- Avoid unsafe dynamic queries.

\- Restrict unexpected fields.



\### 27.4 API Abuse Protection



\- Apply rate limits.

\- Limit concurrent resource-intensive processing.

\- Prevent repeated expensive analysis requests.

\- Restrict export generation frequency.

\- Monitor unusual request patterns.



\### 27.5 Transport Security



Production API communication must use HTTPS.



CORS must permit only approved frontend origins.



\## 28. Asynchronous Processing



Some operations may require significant processing time.



Examples:



\- Large dataset validation.

\- Bulk upload normalization.

\- Skill analysis.

\- Skill-gap analysis.

\- Recommendation generation.

\- Export generation.

\- Session cleanup.



\### 28.1 Processing Pattern



```text

Client Request

&#x20;     |

&#x20;     v

Validate Request

&#x20;     |

&#x20;     v

Create Processing Job

&#x20;     |

&#x20;     v

Return Job Identifier

&#x20;     |

&#x20;     v

Background Processing

&#x20;     |

&#x20;     v

Update Job Status

&#x20;     |

&#x20;     v

Client Retrieves Result

```



\### 28.2 Processing Endpoints



Where needed, the API may expose:



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/jobs/{job\_id}` | Retrieve processing status |

| GET | `/jobs/{job\_id}/result` | Retrieve completed result |

| POST | `/jobs/{job\_id}/cancel` | Cancel an eligible processing job |



\### 28.3 Job Statuses



\- QUEUED

\- RUNNING

\- COMPLETED

\- FAILED

\- CANCELLED



The initial implementation may use FastAPI background tasks for suitable workloads.



For longer-running or resource-intensive jobs, a dedicated task queue may be introduced.



Background processing must not bypass session expiry, authorization, or cleanup policies.



\## 29. API Documentation and Discovery



FastAPI should expose OpenAPI documentation.



Proposed development endpoints:



```text

/docs

/redoc

/openapi.json

```



Production exposure must be controlled.



The API documentation should describe:



\- Endpoint purpose.

\- HTTP method.

\- Authentication requirement.

\- Required permissions.

\- Resource-scope restrictions.

\- Request schema.

\- Response schema.

\- Error responses.

\- Example requests.

\- Example responses.



Sensitive administrative endpoints must not become accessible merely because they appear in public API documentation.



\## 30. Backend Implementation Structure



Suggested implementation:



```text

backend/

└── app/

&#x20;   ├── main.py

&#x20;   │

&#x20;   ├── api/

&#x20;   │   ├── router.py

&#x20;   │   └── dependencies.py

&#x20;   │

&#x20;   ├── core/

&#x20;   │   ├── config.py

&#x20;   │   ├── security.py

&#x20;   │   ├── authentication.py

&#x20;   │   ├── authorization.py

&#x20;   │   ├── permissions.py

&#x20;   │   └── exceptions.py

&#x20;   │

&#x20;   ├── schemas/

&#x20;   │   ├── common.py

&#x20;   │   └── responses.py

&#x20;   │

&#x20;   ├── modules/

&#x20;   │   ├── auth/

&#x20;   │   ├── users/

&#x20;   │   ├── sessions/

&#x20;   │   ├── assessment/

&#x20;   │   ├── uploads/

&#x20;   │   ├── taxonomy/

&#x20;   │   ├── proficiency/

&#x20;   │   ├── analysis/

&#x20;   │   ├── gaps/

&#x20;   │   ├── recommendations/

&#x20;   │   ├── proposals/

&#x20;   │   ├── dashboard/

&#x20;   │   ├── exports/

&#x20;   │   ├── configuration/

&#x20;   │   └── cleanup/

&#x20;   │

&#x20;   └── middleware/

&#x20;       ├── request\_id.py

&#x20;       ├── security\_headers.py

&#x20;       └── request\_logging.py

```



The module structure represents logical application boundaries within a modular monolith.



It does not imply that each module runs as an independent microservice.



\## 31. API Testing Requirements



API testing must include functional, authorization, security, and lifecycle tests.



\### 31.1 Functional Testing



\- User creation.

\- Authentication.

\- Session creation.

\- Assessment submission.

\- File upload.

\- Dataset validation.

\- Analysis execution.

\- Gap analysis.

\- Recommendation generation.

\- Proposal review.

\- Export generation.

\- Cleanup execution.



\### 31.2 Authorization Testing



\- Student cannot access administrative endpoints.

\- HOD cannot access unrelated departments.

\- HOD cannot approve institutional proposals.

\- Dean can access authorized institutional analytics.

\- Administrator cannot automatically access confidential student records.

\- Direct resource identifier manipulation does not bypass authorization.



\### 31.3 Lifecycle Testing



\- Expired sessions reject requests.

\- Closed sessions reject submissions.

\- Processing sessions prevent conflicting operations.

\- Expired exports cannot be downloaded.

\- Cleanup invalidates old resource references.



\### 31.4 Security Testing



\- SQL injection.

\- Broken access control.

\- IDOR/BOLA.

\- Authentication bypass.

\- File upload abuse.

\- Rate-limit bypass.

\- Sensitive data exposure.

\- Mass assignment.

\- Insecure direct file access.



\## 32. Acceptance Criteria



The API architecture is acceptable when:



1\. All endpoints follow consistent versioning.

2\. Every module has documented endpoint contracts.

3\. Request and response schemas are defined.

4\. Authentication is enforced for protected endpoints.

5\. RBAC and ABAC checks are applied.

6\. Departmental and institutional scope is enforced.

7\. Assessment data remains temporary.

8\. Uploads are validated.

9\. Analysis and recommendation operations reference source revisions.

10\. Proposal approval is separated from recommendation generation.

11\. Exports are independently authorized.

12\. Expired sessions and exports become inaccessible.

13\. Errors follow a consistent structure.

14\. Rate limiting and input validation are implemented.

15\. OpenAPI documentation is generated.

16\. Functional and security tests cover all protected modules.



\## 33. Open API Decisions



| Decision | Current position |

|---|---|

| Authentication mechanism | University SSO or platform authentication pending |

| JWT versus server-side sessions | Pending |

| Token refresh strategy | Depends on authentication selection |

| API rate limits | Pending deployment benchmarking |

| Upload size limit | Pending |

| Maximum processing concurrency | Pending |

| Background job framework | Pending workload assessment |

| Pagination defaults | Proposed; final values pending |

| API response envelope | Proposed; implementation pending |

| Export expiry | Configurable; exact value pending |

| API version deprecation policy | Pending |

| WebSocket support | Not required for initial release |

| API idempotency strategy | Required for selected retry-sensitive operations; design pending |

| Governance history persistence | Separate decision |

| Production OpenAPI exposure | Deployment policy pending |



\## 34. Final Architectural Position



The SSIP API is the central communication contract between the frontend and backend.



It exposes controlled operations for:



\- Authentication and identity.

\- User and role management.

\- Assessment sessions.

\- Student submissions.

\- Bulk uploads.

\- Skill taxonomy.

\- Proficiency configuration.

\- Skill analysis.

\- Skill-gap analysis.

\- Recommendation generation.

\- Departmental proposals.

\- Institutional decisions.

\- Dashboards.

\- Reports and exports.

\- System monitoring.

\- Temporary data cleanup.



The API must preserve the platform's architectural constraints:



\- Modular monolith.

\- Hybrid RBAC and ABAC.

\- Backend-enforced authorization.

\- Departmental and institutional resource isolation.

\- Temporary student assessment processing.

\- Versioned analytical outputs.

\- Explainable recommendations.

\- Controlled exports and cleanup.



\*\*Core API principle: Every endpoint must have a defined purpose, an explicit permission requirement, a validated resource scope, a documented contract, and a controlled data lifecycle.\*\*

