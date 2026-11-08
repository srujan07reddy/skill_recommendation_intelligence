\# ACCESS\_CONTROL.md



\*\*Document Version:\*\* 1.0  

\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Status:\*\* Proposed  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the access-control architecture of the Student Skill Intelligence Platform.



It establishes how the platform determines:



\- Who can access the application.

\- What operations an authenticated user can perform.

\- Which resources a user can access.

\- What data a user can view or modify.

\- How access is restricted by department and institutional scope.

\- How privileged operations are protected.

\- How unauthorized access attempts are handled.



The access-control system must enforce authorization on the backend. Frontend restrictions are supplementary and must never be treated as security boundaries.



\## 2. Access Control Objectives



The system must satisfy the following objectives:



1\. Prevent unauthorized application access.

2\. Enforce role-based permissions.

3\. Restrict access according to organizational scope.

4\. Protect student assessment information.

5\. Prevent unauthorized data modification.

6\. Separate administrative configuration from academic decision-making.

7\. Protect assessment sessions and temporary datasets.

8\. Restrict sensitive exports.

9\. Maintain accountability for privileged operations.

10\. Support secure access revocation.



\## 3. Access Control Model



The platform will use a combination of:



\- \*\*Role-Based Access Control (RBAC):\*\* Determines which operations a user is permitted to perform.

\- \*\*Attribute-Based Access Control (ABAC):\*\* Evaluates contextual attributes such as department ownership, resource scope, session status, and data classification.



RBAC provides the permission foundation. ABAC applies additional restrictions to individual resources and requests.



\### 3.1 Authorization model



```text

&#x20;               User Request

&#x20;                    |

&#x20;                    v

&#x20;             Authentication

&#x20;                    |

&#x20;                    v

&#x20;             Identify User

&#x20;                    |

&#x20;                    v

&#x20;             Load User Role

&#x20;                    |

&#x20;                    v

&#x20;            Check Permission

&#x20;                    |

&#x20;                    v

&#x20;          Evaluate Resource Scope

&#x20;                    |

&#x20;                    v

&#x20;          Evaluate Context Conditions

&#x20;                    |

&#x20;             +------+------+

&#x20;             |             |

&#x20;          Allowed        Denied

&#x20;             |             |

&#x20;             v             v

&#x20;        Execute Action   Reject Request

&#x20;             |

&#x20;             v

&#x20;        Record Audit Event

```



\### 3.2 Authorization decision



An operation is permitted only when all applicable conditions are satisfied:



\\\[

Access = Authenticated \\land Permission \\land Scope \\land Context

\\]



Where:



\- `Authenticated`: The user has a valid authenticated identity.

\- `Permission`: The assigned role includes the required permission.

\- `Scope`: The requested resource belongs to the user's authorized scope.

\- `Context`: The requested action is valid under current session and resource conditions.



The default authorization decision is \*\*Deny\*\*.



\## 4. Authentication and Authorization Separation



Authentication and authorization are separate security processes.



| Process | Purpose |

|---|---|

| Authentication | Establishes the identity of the user |

| Authorization | Determines what the authenticated user can do |



A successful login does not automatically grant access to every platform feature.



After authentication, the backend must resolve the user's active role, permissions, and organizational scope.



\## 5. Role-Based Permission Model



The platform initially supports four primary roles.



| Role | Access responsibility |

|---|---|

| Administrator | Platform administration and approved configuration |

| Dean | Institutional analytics and authorized institutional decisions |

| HOD | Departmental analytics and departmental proposals |

| Student | Own assessment participation and permitted submission information |



\### 5.1 Administrator permissions



The Administrator may receive permissions for:



\- User account management.

\- Role assignment.

\- Department association management.

\- Skill taxonomy configuration.

\- Proficiency configuration.

\- Recommendation rule configuration.

\- Platform settings.

\- Technical monitoring.

\- Session policy configuration.



Administrative permissions do not automatically grant access to identifiable student assessment data.



\### 5.2 Dean permissions



The Dean may receive permissions for:



\- Institutional dashboard access.

\- Department comparison.

\- Institutional assessment session management.

\- Authorized assessment dataset uploads.

\- Recommendation review.

\- Institutional proposal approval.

\- Institutional report exports.



\### 5.3 HOD permissions



The HOD may receive permissions for:



\- Assigned department dashboard access.

\- Departmental session management where delegated.

\- Departmental assessment uploads where delegated.

\- Departmental recommendation review.

\- Departmental proposal creation and submission.

\- Departmental report exports.



\### 5.4 Student permissions



The Student may receive permissions for:



\- Assigned assessment access.

\- Assessment submission.

\- Submission status viewing.

\- Submission revision where permitted.



Students must not access other students' submissions or departmental analytics.



\## 6. Permission Architecture



Permissions must be defined independently of frontend pages and components.



\### 6.1 Permission naming convention



Use the following convention:



```text

<resource>.<action>

```



Examples:



```text

users.create

users.view

users.update



assessment.create

assessment.submit

assessment.upload



analytics.view\_department

analytics.view\_institution



recommendations.review

proposals.approve



taxonomy.manage

exports.institution\_report

```



\### 6.2 Permission categories



| Category | Example permissions |

|---|---|

| Authentication | `auth.login`, `auth.logout` |

| User Management | `users.create`, `users.assign\_role` |

| Assessment | `assessment.create`, `assessment.submit` |

| Session Management | `sessions.create`, `sessions.close` |

| Data Upload | `uploads.create`, `uploads.validate` |

| Analytics | `analytics.view\_department` |

| Skill Taxonomy | `taxonomy.manage` |

| Proficiency | `proficiency.manage` |

| Recommendations | `recommendations.review` |

| Proposals | `proposals.submit`, `proposals.approve` |

| Exports | `exports.department\_report` |

| Configuration | `settings.manage` |



\### 6.3 Permission assignment



Permissions should be assigned through an explicit role-permission mapping.



The backend must not rely on hardcoded assumptions such as:



```python

if user.role == "dean":

&#x20;   allow\_access()

```



Instead, it should evaluate the required permission and resource scope.



This allows the permission model to evolve without rewriting authorization logic across the application.



\## 7. Resource-Level Access Control



Role permissions alone are insufficient.



A user may have permission to view departmental analytics but must only access departments within their authorized scope.



\### 7.1 Department-level restriction



An HOD is associated with an authorized department.



Example:



```text

User:

&#x20;   role = HOD

&#x20;   department\_id = DEPT\_CSE



Requested Resource:

&#x20;   department\_id = DEPT\_CSE



Result:

&#x20;   Access Allowed

```



If the requested resource belongs to another department:



```text

User:

&#x20;   role = HOD

&#x20;   department\_id = DEPT\_CSE



Requested Resource:

&#x20;   department\_id = DEPT\_ECE



Result:

&#x20;   Access Denied

```



The department association must be resolved from trusted backend identity and resource records, not from an untrusted client-supplied value.



\### 7.2 Institutional restriction



A Dean may access authorized institutional analytics across departments.



This does not automatically grant access to every underlying identifiable student record.



Access to student-level information must require a separate permission and an appropriate institutional justification.



\### 7.3 Student-level restriction



Students may access only their own permitted assessment submissions.



The backend must compare the authenticated student's identity with the owner of the requested submission.



Changing a submission identifier must not expose another student's information.



\## 8. Attribute-Based Access Control



ABAC evaluates additional conditions beyond the user's role.



\### 8.1 Relevant attributes



| Attribute | Description |

|---|---|

| user\_id | Authenticated user identifier |

| role | Assigned application role |

| department\_id | Authorized department |

| resource\_department\_id | Department associated with the requested resource |

| resource\_owner\_id | Owner of an individual resource |

| session\_id | Assessment session identifier |

| session\_status | Current session lifecycle state |

| permission | Required operation permission |

| data\_classification | Sensitivity classification |

| export\_type | Requested export category |

| account\_status | Account activation state |



\### 8.2 Example authorization conditions



\*\*HOD viewing departmental analytics\*\*



```text

User is authenticated

AND account is active

AND user has analytics.view\_department

AND requested department matches assigned department

AND session is accessible

```



\*\*Student revising an assessment\*\*



```text

User is authenticated

AND account is active

AND user has assessment.revise

AND submission belongs to authenticated student

AND session permits revision

```



\*\*Dean approving a proposal\*\*



```text

User is authenticated

AND account is active

AND user has proposals.approve

AND proposal is within institutional scope

AND proposal is awaiting an authorized decision

```



\*\*Administrator changing recommendation rules\*\*



```text

User is authenticated

AND account is active

AND user has recommendation\_rules.manage

AND requested rule is within platform configuration scope

AND change satisfies configuration validation

```



\## 9. Assessment Session Access Control



Assessment sessions contain temporary assessment information and must have explicit access policies.



\### 9.1 Session ownership



Every session must identify:



\- Session creator.

\- Session type.

\- Authorized department or institutional scope.

\- Session status.

\- Creation timestamp.

\- Collection deadline, if configured.

\- Data expiry timestamp.

\- Permitted operations.



\### 9.2 Session access rules



| Role | Session access |

|---|---|

| Administrator | Operational metadata and configuration; assessment contents not granted by default |

| Dean | Authorized institutional sessions |

| HOD | Sessions within assigned department and delegated scope |

| Student | Sessions assigned to the student |



\### 9.3 Session lifecycle restrictions



Access must consider the current session state.



| Session state | Example restriction |

|---|---|

| Created | Not yet accepting submissions |

| Scheduled | Access according to configured schedule |

| Active | Permitted collection and review operations |

| Processing | Restrict operations that conflict with processing |

| Completed | Permit authorized result review and exports |

| Closed | Deny further submissions |

| Expired | Deny access to expired assessment content |

| Cleaning | Prevent access during cleanup |

| Cleaned | Temporary assessment data unavailable |

| Failed | Restrict incomplete results and expose appropriate error information |



The exact operations permitted in each state must be defined in the Session Management module.



\## 10. Data Access Classification



Different categories of platform information require different access restrictions.



\### 10.1 Proposed classification



| Classification | Examples | Default access |

|---|---|---|

| Public | Public platform information | Unauthenticated users, where published |

| Internal | General platform configuration information | Authorized platform users |

| Restricted | Departmental analytical information | Authorized HOD and Dean |

| Confidential | Student assessment submissions and identifiable data | Explicitly authorized access |

| Administrative | User roles, security settings, platform configuration | Administrator |



The classification is a proposed logical model and must be validated against university information-security policies.



\### 10.2 Access principles



\- Aggregate reports should be preferred over identifiable records.

\- Student-level information must not be exposed through departmental dashboards by default.

\- Sensitive exports must require explicit authorization.

\- Data classification must be enforced at the backend.

\- Error messages must not reveal confidential resource information.



\## 11. Export Access Control



Exports create a separate data-exposure risk because downloaded files leave the application environment.



\### 11.1 Export categories



\*\*Reports-only export\*\*



May include:



\- Departmental skill summaries.

\- Institutional skill distribution.

\- Proficiency distribution.

\- Skill gap analysis.

\- Recommendation summaries.



\*\*Complete analysis package\*\*



May include:



\- Original uploaded dataset, where applicable.

\- Normalized assessment data.

\- Analytics JSON.

\- Recommendation results.

\- Reports.

\- Export manifest.



\### 11.2 Export permissions



| Export operation | Dean | HOD | Student | Administrator |

|---|---|---|---|---|

| Departmental report | Yes | Assigned department | No | No by default |

| Institutional report | Yes | No | No | No by default |

| Complete institutional package | Authorized | No by default | No | No by default |

| Complete departmental package | Authorized | Authorized | No | No by default |

| Identifiable student data | Explicit authorization required | Explicit authorization required | Own permitted data only | Explicit authorization required |



The table describes proposed access boundaries. Institutional policy must determine who can authorize identifiable-data exports.



\### 11.3 Export security



The system must:



\- Validate export permissions before generation.

\- Apply resource-scope restrictions.

\- Exclude identifiable data by default.

\- Store generated files outside public web directories.

\- Use unpredictable download identifiers.

\- Enforce download expiry.

\- Delete temporary export files according to policy.

\- Prevent unauthorized file access through direct URL manipulation.



Once downloaded, a file is outside the platform's technical control. The recipient is responsible for handling it according to institutional policy.



\## 12. API-Level Authorization



All protected API endpoints must enforce authorization.



\### 12.1 Authorization flow



For every request, the backend must:



1\. Validate the authentication credential.

2\. Resolve the active user account.

3\. Load the user's role and permissions.

4\. Identify the requested resource.

5\. Resolve its ownership and organizational scope.

6\. Evaluate contextual restrictions.

7\. Permit or deny the operation.

8\. Record relevant security and audit events.



\### 12.2 Example endpoint policy



| Endpoint | Required permission | Additional restriction |

|---|---|---|

| `GET /api/v1/analytics/department/{id}` | `analytics.view\_department` | Department scope |

| `GET /api/v1/analytics/institution` | `analytics.view\_institution` | Institutional scope |

| `POST /api/v1/assessment/sessions` | `sessions.create` | Authorized session scope |

| `POST /api/v1/assessment/submit` | `assessment.submit` | Assigned student/session |

| `POST /api/v1/uploads` | `uploads.create` | Session ownership and scope |

| `POST /api/v1/proposals/{id}/approve` | `proposals.approve` | Institutional scope and valid status |

| `GET /api/v1/exports/{id}` | Appropriate export permission | Export ownership, scope, and expiry |



The endpoint list is illustrative. Final API routes must remain consistent with the API documentation.



\## 13. Backend Implementation Requirements



Authorization must be implemented through reusable backend components.



Suggested FastAPI structure:



```text

backend/

└── app/

&#x20;   ├── core/

&#x20;   │   ├── security.py

&#x20;   │   ├── authentication.py

&#x20;   │   ├── authorization.py

&#x20;   │   └── permissions.py

&#x20;   │

&#x20;   ├── dependencies/

&#x20;   │   ├── current\_user.py

&#x20;   │   ├── require\_permission.py

&#x20;   │   └── resource\_scope.py

&#x20;   │

&#x20;   ├── modules/

&#x20;   │   ├── users/

&#x20;   │   ├── sessions/

&#x20;   │   ├── assessment/

&#x20;   │   ├── analytics/

&#x20;   │   ├── recommendations/

&#x20;   │   ├── proposals/

&#x20;   │   └── exports/

&#x20;   │

&#x20;   └── middleware/

&#x20;       ├── authentication\_middleware.py

&#x20;       └── security\_headers.py

```



\### 13.1 Component responsibilities



| Component | Responsibility |

|---|---|

| authentication.py | Authentication validation |

| security.py | Security-related shared functionality |

| authorization.py | Central authorization evaluation |

| permissions.py | Permission definitions and mappings |

| current\_user.py | Resolve authenticated user |

| require\_permission.py | Enforce required permission |

| resource\_scope.py | Validate resource ownership and scope |

| authentication\_middleware.py | Request authentication integration |



Middleware may establish identity context, but resource-specific authorization must still be performed at the relevant application operation.



\### 13.2 FastAPI authorization example



```python

from fastapi import Depends, HTTPException, status



def require\_permission(permission: str):

&#x20;   async def checker(current\_user=Depends(get\_current\_user)):

&#x20;       if not current\_user.is\_active:

&#x20;           raise HTTPException(

&#x20;               status\_code=status.HTTP\_403\_FORBIDDEN,

&#x20;               detail="Account is inactive"

&#x20;           )



&#x20;       if permission not in current\_user.permissions:

&#x20;           raise HTTPException(

&#x20;               status\_code=status.HTTP\_403\_FORBIDDEN,

&#x20;               detail="Insufficient permissions"

&#x20;           )



&#x20;       return current\_user



&#x20;   return checker

```



Usage:



```python

@router.get("/analytics/institution")

async def get\_institution\_analytics(

&#x20;   current\_user=Depends(

&#x20;       require\_permission("analytics.view\_institution")

&#x20;   )

):

&#x20;   return await analytics\_service.get\_institution\_summary()

```



This example demonstrates permission checking only. Resource-scope validation, session checks, and data-classification restrictions must also be applied where relevant.



\## 14. Frontend Access Control



The React frontend should use permissions to control the user interface.



\### 14.1 Frontend responsibilities



\- Display authorized navigation items.

\- Hide unavailable actions.

\- Restrict dashboard views.

\- Display role-specific pages.

\- Prevent accidental access to unavailable workflows.

\- Show appropriate unauthorized-access messages.



\### 14.2 Frontend restrictions are not security enforcement



The frontend must never be trusted to enforce authorization independently.



For example:



```tsx

{permissions.includes("analytics.view\_department") \&\& (

&#x20; <DepartmentAnalytics />

)}

```



This controls presentation only.



The backend must independently verify the permission and department scope before returning analytics.



\## 15. Access Revocation



Access must be revocable when a user:



\- Leaves the university.

\- Changes department.

\- Loses an organizational responsibility.

\- Changes application role.

\- Has an account suspended.

\- Is suspected of account compromise.



\### Revocation requirements



\- Deactivate or update the account.

\- Remove obsolete role assignments.

\- Update department associations.

\- Revoke or invalidate affected authentication sessions.

\- Prevent further access to protected resources.

\- Record the administrative action.



Access revocation must take effect on the backend without relying on the user refreshing the frontend.



\## 16. Security Threats and Mitigations



| Threat | Required mitigation |

|---|---|

| Privilege escalation | Backend permission validation |

| Insecure direct object reference | Resource ownership and scope validation |

| Cross-department data exposure | Department-level authorization |

| Student data exposure | Owner validation and data classification |

| Unauthorized export | Dedicated export permissions |

| Session hijacking | Secure session and token handling |

| Stale permissions | Role and account status validation |

| Frontend manipulation | Independent backend authorization |

| Unauthorized configuration changes | Restricted administrative permissions |

| Expired session access | Session lifecycle validation |

| Mass assignment | Explicit input schemas and permitted-field validation |

| Information leakage | Safe error responses |



\## 17. Audit and Monitoring Requirements



The platform should record important access-control events.



\### 17.1 Events to record



\- Successful authentication.

\- Failed authentication.

\- Access denied.

\- Role assignment or modification.

\- Permission configuration changes.

\- Department association changes.

\- Sensitive export generation.

\- Sensitive export download.

\- Session access violations.

\- Privileged configuration changes.

\- Account suspension and revocation.



\### 17.2 Audit record fields



```text

audit\_event\_id

user\_id

role

action

resource\_type

resource\_id

session\_id

timestamp

result

source\_context

```



Audit records must not contain passwords, authentication tokens, or unnecessary student assessment information.



\### 17.3 Audit retention



Audit retention must be defined separately from temporary assessment data retention.



Security and governance records may require a different retention policy. Their persistence and retention periods must be approved by the institution.



\## 18. Error Handling



| Situation | Expected response |

|---|---|

| Missing authentication | HTTP 401 Unauthorized |

| Invalid or expired credential | HTTP 401 Unauthorized |

| Insufficient permission | HTTP 403 Forbidden |

| Resource outside authorized scope | HTTP 403 or privacy-preserving HTTP 404 |

| Expired assessment session | HTTP 410 Gone, where appropriate |

| Invalid session state | HTTP 409 Conflict |

| Invalid request | HTTP 400 or 422 |

| Inactive account | Reject protected access |

| Unauthorized export download | Deny access |



The API must avoid revealing whether confidential resources exist when such disclosure could expose information.



\## 19. Testing Requirements



Access-control tests must verify both permitted and denied operations.



\### 19.1 Role tests



\- Administrator can manage authorized platform configuration.

\- Dean can access institutional analytics.

\- HOD can access the assigned department.

\- Student can submit an authorized assessment.



\### 19.2 Scope tests



\- HOD cannot access another department's analytics.

\- Student cannot retrieve another student's submission.

\- Dean cannot access resources outside institutional scope.

\- Administrator cannot access confidential assessment data by default.



\### 19.3 Privilege tests



\- Student cannot call administrative endpoints.

\- HOD cannot approve institutional proposals.

\- Administrator cannot approve academic proposals solely through administrative privileges.

\- Frontend permission manipulation does not bypass backend checks.



\### 19.4 Lifecycle tests



\- Expired sessions cannot be accessed.

\- Closed sessions reject new submissions.

\- Suspended accounts cannot access protected endpoints.

\- Revoked permissions take effect.

\- Expired exports cannot be downloaded.



\### 19.5 Security testing



The implementation should include tests for:



\- Broken Access Control.

\- IDOR/BOLA.

\- Privilege escalation.

\- Horizontal privilege abuse.

\- Vertical privilege abuse.

\- Unauthorized file access.

\- Mass assignment.

\- Token/session misuse.



\## 20. Acceptance Criteria



The Access Control implementation is acceptable when:



1\. Authentication and authorization are separate.

2\. The four primary roles have explicit permissions.

3\. Authorization follows deny-by-default.

4\. RBAC and resource-scope checks work together.

5\. HOD access is restricted by department.

6\. Dean access is restricted by institutional scope.

7\. Student access is restricted to permitted personal resources.

8\. Administrator access to identifiable assessment data is not automatic.

9\. Assessment session lifecycle is considered during authorization.

10\. Export permissions are separately enforced.

11\. Every protected API endpoint performs backend authorization.

12\. Frontend restrictions are not treated as security boundaries.

13\. Access revocation works effectively.

14\. Important authorization events are auditable.

15\. Cross-role and cross-department security tests pass.



\## 21. Open Decisions



| Decision | Current position |

|---|---|

| Authentication method | Pending: university SSO or platform authentication |

| Authorization policy storage | Pending implementation design |

| JWT versus server-side sessions | Pending security and deployment decision |

| Multi-factor authentication | Recommended for privileged roles; policy pending |

| Identifiable student data access | Explicit authorization required |

| Temporary session access delegation | Pending |

| Export approval workflow | Pending institutional policy |

| Audit retention period | Pending |

| Persistent governance audit storage | Pending |

| Fine-grained faculty permissions | Future consideration |

| Emergency administrative access | Requires formal break-glass policy |



\## 22. Final Architectural Position



The Student Skill Intelligence Platform uses a hybrid RBAC and ABAC access-control architecture.



\- RBAC determines which operations a user may perform.

\- ABAC determines whether the user may perform those operations on a particular resource under the current conditions.

\- Backend authorization enforces the actual security boundary.

\- Frontend access restrictions improve usability but do not provide security independently.

\- Session lifecycle and data classification influence resource access.

\- Audit records provide accountability for sensitive operations.



\*\*Core security rule: A valid login does not imply permission, a permission does not imply unrestricted resource access, and organizational seniority does not imply unrestricted data access.\*\*

