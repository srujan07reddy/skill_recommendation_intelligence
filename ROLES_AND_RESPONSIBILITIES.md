\# ROLES\_AND\_RESPONSIBILITIES.md



\*\*Document Version:\*\* 1.0  

\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Status:\*\* Proposed  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the roles, responsibilities, authority boundaries, and access permissions of users operating within the Student Skill Intelligence Platform.



The objective is to establish a clear governance structure so that:



\- Every operation has an authorized owner.

\- Users can access only the information required for their responsibilities.

\- Departmental and institutional decisions follow defined authority boundaries.

\- Administrative configuration is separated from academic decision-making.

\- Student assessment information is protected.

\- Recommendations and analytical results are reviewed by authorized personnel.

\- Unauthorized access and conflicting responsibilities are minimized.



This document serves as the foundation for the platform's Role-Based Access Control (RBAC) implementation.



\## 2. Governance Principles



The platform follows these governance principles:



\### 2.1 Least Privilege



Users receive only the permissions necessary to perform their assigned responsibilities.



\### 2.2 Separation of Duties



Platform configuration, departmental review, and institutional approval must remain distinct responsibilities.



\### 2.3 Departmental Ownership



HODs are responsible for reviewing skill intelligence and development proposals within their authorized departments.



\### 2.4 Institutional Oversight



Deans are responsible for institutional-level review, prioritization, and approval of initiatives within their delegated authority.



\### 2.5 Administrative Neutrality



Administrators maintain the platform and its configurations. They do not automatically possess academic approval authority.



\### 2.6 Student Data Protection



Students participate in assessments, but cannot access other students' submissions or departmental analytics unless separately authorized.



\### 2.7 Accountability



Important actions must identify the responsible user, operation, timestamp, and relevant session or resource wherever logging is applicable.



\## 3. Defined User Roles



The initial release defines four primary roles.



| Role ID | Role | Primary Responsibility |

|---|---|---|

| ROLE-001 | Administrator | Platform administration and configuration |

| ROLE-002 | Dean | Institutional oversight and approval |

| ROLE-003 | HOD | Departmental review and proposal |

| ROLE-004 | Student | Skill assessment participation |



These are application roles. They do not necessarily represent every organizational designation within the university.



Additional roles may be introduced through an approved governance change.



\## 4. Role 1 — Administrator



\### 4.1 Role Objective



The Administrator is responsible for maintaining the technical and operational integrity of the Student Skill Intelligence Platform.



The role focuses on platform configuration, user access management, taxonomy maintenance, recommendation rules, and system-level monitoring.



\### 4.2 Responsibilities



\*\*A. User and Access Management\*\*



\- Create and manage platform user accounts.

\- Assign authorized application roles.

\- Associate HOD accounts with their respective departments.

\- Configure Dean-level institutional access.

\- Activate, deactivate, or suspend accounts.

\- Review role assignments.

\- Handle access-related administrative requests.



\*\*B. Skill Taxonomy Management\*\*



\- Maintain skill domains and categories.

\- Add or modify recognized skills.

\- Manage skill identifiers and aliases.

\- Configure skill relationships.

\- Maintain department-to-skill relevance mappings.

\- Manage taxonomy versions.



\*\*C. Proficiency Configuration\*\*



\- Maintain proficiency classification configuration.

\- Configure approved assessment criteria.

\- Manage evidence classification options.

\- Maintain proficiency framework versions.



Changes to institutional proficiency standards must follow the university's authorized approval process.



\*\*D. Recommendation Configuration\*\*



\- Maintain recommendation rules.

\- Configure initiative categories.

\- Maintain recommendation templates.

\- Configure priority criteria after institutional approval.

\- Activate or deactivate approved rules.

\- Maintain rule versions.



\*\*E. Platform Operations\*\*



\- Monitor application health.

\- Monitor processing failures.

\- Maintain session configuration.

\- Configure temporary data expiry policies.

\- Monitor cleanup execution.

\- Manage deployment configuration.

\- Coordinate technical maintenance.



\*\*F. Security Administration\*\*



\- Maintain authentication configuration.

\- Enforce access policies.

\- Monitor security events.

\- Review suspicious access activity.

\- Manage security configuration.

\- Coordinate incident response.



\### 4.3 Authority Boundaries



The Administrator may:



\- Configure platform functionality.

\- Manage application roles and permissions.

\- Maintain approved taxonomy and rules.

\- Monitor platform operations.

\- Investigate technical failures.



The Administrator may not automatically:



\- Approve departmental development proposals.

\- Override a Dean's institutional decision.

\- Change academic skill targets without authorization.

\- Modify assessment results to influence recommendations.

\- Access identifiable student assessment data merely because of administrative privileges.



Any exceptional access to sensitive assessment data must have a documented operational justification and appropriate authorization.



\## 5. Role 2 — Dean



\### 5.1 Role Objective



The Dean provides institutional-level oversight of skill intelligence and development planning.



The role evaluates departmental analytical findings, identifies common institutional requirements, and makes decisions on development proposals within the Dean's delegated authority.



\### 5.2 Responsibilities



\*\*A. Institutional Skill Intelligence\*\*



\- View authorized institutional dashboards.

\- Review skill distribution across departments.

\- Compare departmental skill coverage.

\- Identify common institutional skill-development needs.

\- Review proficiency distributions.

\- Identify institution-wide development opportunities.



\*\*B. Assessment Session Management\*\*



\- Create institutional assessment sessions.

\- Configure session parameters within authorized limits.

\- Initiate form-based assessments.

\- Upload authorized Excel and CSV datasets.

\- Monitor assessment collection.

\- Review data validation results.

\- Close sessions when appropriate.



\*\*C. Recommendation Review\*\*



\- Review recommendations generated by the Recommendation Engine.

\- Examine the supporting analytical evidence.

\- Compare recommendations across departments.

\- Identify overlapping development initiatives.

\- Evaluate institutional relevance.

\- Prioritize institutional requirements.



\*\*D. Institutional Decision-Making\*\*



\- Approve eligible proposals.

\- Reject proposals with a recorded reason.

\- Request modifications.

\- Defer proposals.

\- Return proposals for additional departmental review.

\- Approve institution-wide development initiatives within delegated authority.



\*\*E. Reporting and Export\*\*



\- Export authorized institutional reports.

\- Download departmental comparison reports.

\- Generate institution-level skill intelligence summaries.

\- Download complete analysis packages where authorized.



\### 5.3 Authority Boundaries



The Dean may:



\- Review institutional analytical results.

\- Review proposals submitted by HODs.

\- Make authorized institutional decisions.

\- Create institutional assessment sessions.

\- Download authorized institutional reports.



The Dean may not automatically:



\- Modify raw student assessment submissions.

\- Change analytical results manually.

\- Alter recommendation engine rules without the appropriate administrative process.

\- Access information outside the institution's authorized scope.

\- Treat an analytical recommendation as an automatically approved initiative.



\## 6. Role 3 — Head of Department (HOD)



\### 6.1 Role Objective



The HOD is responsible for understanding and acting upon skill intelligence within the department.



The role evaluates departmental skill distribution, identifies development requirements, reviews recommendations, and proposes suitable initiatives to the Dean.



\### 6.2 Responsibilities



\*\*A. Departmental Skill Intelligence\*\*



\- View the authorized department dashboard.

\- Review departmental skill distribution.

\- Examine proficiency classifications.

\- Identify skill coverage gaps.

\- Review assessment participation.

\- Identify foundation, practical, and advanced skill-development needs.



\*\*B. Assessment Session Management\*\*



\- Create departmental assessment sessions where authorized.

\- Configure departmental assessment parameters.

\- Monitor student form submissions.

\- Upload authorized departmental Excel or CSV datasets.

\- Review validation errors.

\- Monitor collection progress.

\- Close departmental sessions where authorized.



\*\*C. Recommendation Review\*\*



\- Review recommendations for the department.

\- Examine recommendation justifications.

\- Evaluate supporting analytical metrics.

\- Compare proposed initiative categories.

\- Identify departmental priorities.

\- Reject unsuitable recommendations with a reason.

\- Request changes where additional information is required.



\*\*D. Development Proposals\*\*



\- Prepare departmental development proposals.

\- Select suitable initiative categories.

\- Define proposed learning outcomes.

\- Identify the intended student group.

\- Provide academic justification.

\- Submit proposals to the Dean.

\- Respond to requests for modification.



\*\*E. Departmental Reporting\*\*



\- Download departmental reports.

\- Export authorized analytical summaries.

\- Share approved reports through authorized university channels.



\### 6.3 Authority Boundaries



The HOD may:



\- Access analytics for the assigned department.

\- Manage authorized departmental assessment sessions.

\- Review departmental recommendations.

\- Submit departmental proposals.

\- Download authorized departmental reports.



The HOD may not automatically:



\- Access unrelated departmental student-level data.

\- Approve institution-wide initiatives.

\- Modify platform-wide recommendation rules.

\- Change institutional proficiency standards.

\- Override the Dean's decision.

\- Modify analytical results to alter departmental performance.



\## 7. Role 4 — Student



\### 7.1 Role Objective



Students provide information about their skills, knowledge, practical experience, and supporting evidence through authorized assessment mechanisms.



The Student role is designed for assessment participation rather than institutional administration.



\### 7.2 Responsibilities



\*\*A. Assessment Participation\*\*



\- Access assigned assessment forms.

\- Submit required skill information.

\- Select relevant skills from available taxonomy options.

\- Provide proficiency self-assessments.

\- Submit supporting evidence where requested.

\- Complete assessments within the permitted period.



\*\*B. Submission Management\*\*



\- Review submission status where supported.

\- Correct or revise submissions when the session permits.

\- Follow assessment instructions.

\- Avoid submitting misleading or fabricated information.



\*\*C. Data Accuracy\*\*



\- Provide accurate information.

\- Distinguish between theoretical knowledge and practical experience.

\- Identify skills they have actually used.

\- Provide valid supporting evidence when requested.



\### 7.3 Authority Boundaries



The Student may:



\- Submit an assessment.

\- View permitted submission status.

\- Revise a submission if the session configuration allows it.



The Student may not:



\- View another student's submission.

\- Access departmental analytics.

\- View institutional comparison dashboards.

\- Modify skill taxonomy.

\- Modify proficiency framework configuration.

\- Generate or approve institutional recommendations.

\- Access administrative session controls.



\## 8. Role Responsibility Matrix



The following matrix identifies the primary operational responsibility for each role.



| Operation | Administrator | Dean | HOD | Student |

|---|---|---|---|---|

| Manage user accounts | Yes | No | No | No |

| Assign application roles | Yes | No | No | No |

| Configure skill taxonomy | Yes | No | No | No |

| Configure proficiency framework | Yes\* | No | No | No |

| Configure recommendation rules | Yes\* | No | No | No |

| View institutional analytics | No by default | Yes | No | No |

| View departmental analytics | No by default | Yes | Yes\*\* | No |

| Create institutional sessions | No by default | Yes | No | No |

| Create departmental sessions | No by default | Yes | Yes\*\* | No |

| Upload assessment datasets | No by default | Yes | Yes\*\* | No |

| Submit skill assessment | No | No | No | Yes |

| Review recommendations | No | Yes | Yes\*\* | No |

| Submit departmental proposals | No | No | Yes | No |

| Approve institutional proposals | No | Yes | No | No |

| Manage platform configuration | Yes | No | No | No |

| Monitor technical health | Yes | No | No | No |

| Export institutional reports | No by default | Yes | No | No |

| Export departmental reports | No by default | Yes | Yes\*\* | No |



\\\* Configuration changes must follow approved institutional standards.



\\\*\* Restricted to the HOD's assigned department and delegated permissions.



The matrix describes proposed default permissions. Final permission assignments must be implemented and validated through the RBAC configuration.



\## 9. Permission Categories



The platform should organize permissions into functional categories rather than relying only on role names.



\### 9.1 Authentication Permissions



\- `auth.login`

\- `auth.logout`

\- `auth.change\_password`

\- `auth.manage\_sessions`



\### 9.2 User Management Permissions



\- `users.create`

\- `users.view`

\- `users.update`

\- `users.deactivate`

\- `users.assign\_role`

\- `users.assign\_department`



\### 9.3 Assessment Permissions



\- `assessment.create`

\- `assessment.view`

\- `assessment.update`

\- `assessment.close`

\- `assessment.submit`

\- `assessment.revise`

\- `assessment.upload`

\- `assessment.validate`



\### 9.4 Analytics Permissions



\- `analytics.view\_department`

\- `analytics.view\_institution`

\- `analytics.view\_skill\_distribution`

\- `analytics.view\_proficiency`

\- `analytics.view\_skill\_gaps`

\- `analytics.compare\_departments`



\### 9.5 Recommendation Permissions



\- `recommendations.generate`

\- `recommendations.view`

\- `recommendations.review`

\- `recommendations.accept`

\- `recommendations.reject`

\- `recommendations.request\_changes`



\### 9.6 Proposal and Approval Permissions



\- `proposals.create`

\- `proposals.submit`

\- `proposals.view`

\- `proposals.approve`

\- `proposals.reject`

\- `proposals.defer`

\- `proposals.request\_changes`



\### 9.7 Configuration Permissions



\- `taxonomy.manage`

\- `proficiency.manage`

\- `recommendation\_rules.manage`

\- `session\_policy.manage`

\- `platform\_settings.manage`



\### 9.8 Export Permissions



\- `exports.department\_report`

\- `exports.institution\_report`

\- `exports.analysis\_package`

\- `exports.identifiable\_data`



The `exports.identifiable\_data` permission must be separately controlled and should not be granted merely because a user can download aggregated reports.



\## 10. Department and Institutional Access Scope



Role assignment alone is insufficient to determine what information a user can access.



The platform must combine role permissions with resource scope.



\### 10.1 Administrator Scope



Platform configuration and operational resources.



Student assessment data is excluded by default.



\### 10.2 Dean Scope



Institutional analytics and authorized departmental information.



\### 10.3 HOD Scope



The department explicitly associated with the HOD's account.



\### 10.4 Student Scope



The student's own assessment submissions and permitted status information.



\### 10.5 Scope Enforcement



Every protected backend request must verify:



1\. Whether the user is authenticated.

2\. Whether the user has the required permission.

3\. Whether the requested resource belongs to the user's authorized scope.

4\. Whether the resource is associated with an active session.

5\. Whether the requested operation is permitted in the current lifecycle state.



Frontend visibility is not a substitute for backend authorization.



\## 11. Governance and Approval Responsibilities



The platform separates technical configuration from academic and institutional decisions.



\### 11.1 Operational Ownership



| Activity | Responsible role |

|---|---|

| Platform maintenance | Administrator |

| User account management | Administrator |

| Taxonomy configuration | Administrator |

| Proficiency configuration | Administrator, subject to approval |

| Recommendation rule configuration | Administrator, subject to approval |

| Departmental assessment | HOD / Dean |

| Institutional assessment | Dean |

| Skill assessment submission | Student |

| Departmental analysis review | HOD |

| Institutional analysis review | Dean |

| Departmental development proposal | HOD |

| Institutional proposal approval | Dean |



\### 11.2 Decision Boundaries



The following distinction must be maintained:



\- The Administrator controls how the platform operates.

\- The HOD determines what departmental development needs should be proposed.

\- The Dean determines which institutional proposals are approved within delegated authority.

\- The Student supplies assessment information.



No role should automatically inherit the responsibilities of another role.



\### 11.3 Approval of Configuration Changes



Changes to the following should follow an institutionally approved process:



\- Institutional skill targets.

\- Proficiency thresholds.

\- Departmental skill relevance.

\- Recommendation priority weights.

\- Assessment policies.

\- Data retention policies.



The Administrator implements approved configuration changes. The Administrator is not automatically the authority that approves their academic content.



\## 12. Temporary Data and Accountability



The platform does not permanently store student skill assessment records.



This has implications for role accountability.



\### 12.1 Temporary Assessment Data



\- Student submissions belong to an assessment session.

\- HODs and Deans access data according to their authorized scope.

\- Recommendations are linked to their source session and analysis revision.

\- Temporary records are removed according to the session expiry policy.



\### 12.2 Audit Information



Where technically and legally appropriate, the platform should record:



\- User identifier.

\- Assigned role at the time of the operation.

\- Action performed.

\- Resource identifier.

\- Session identifier, where applicable.

\- Timestamp.

\- Outcome.

\- Relevant authorization context.



Audit logs must avoid unnecessarily storing student assessment content or sensitive personal information.



\### 12.3 Governance History



Approval and rejection history may need to survive assessment-session expiry.



If this is required, a separate persistent governance record store must be approved.



That store should retain only the necessary decision metadata and must not silently become a permanent student-skill database.



The retention period and permitted contents of governance records remain institutional decisions.



\## 13. Role Assignment and Account Lifecycle



\### 13.1 Account Creation



Accounts may be created through an authorized institutional process.



The platform should support:



\- Account creation.

\- Role assignment.

\- Department association.

\- Account activation.

\- Account suspension.

\- Account deactivation.



\### 13.2 Role Assignment Rules



\- Every account must have an explicitly assigned role.

\- HOD accounts must have a valid department association.

\- Dean accounts must have an authorized institutional scope.

\- Student accounts must have a valid student identity reference.

\- Role changes must be restricted to authorized administrators.

\- A user must not gain additional privileges through frontend manipulation.



\### 13.3 Role Changes



When a user's organizational responsibility changes:



1\. The previous role assignment must be reviewed.

2\. The old department association must be removed where applicable.

3\. The new role and scope must be assigned.

4\. Existing sessions and tokens must be evaluated for revocation.

5\. The change should be recorded in the audit system.



\## 14. Security Requirements



The RBAC implementation must enforce:



\- Deny-by-default access.

\- Backend authorization.

\- Department-level resource isolation.

\- Institutional scope validation.

\- Explicit permission assignment.

\- Secure authentication.

\- Session expiry.

\- Protection against privilege escalation.

\- Protection against insecure direct object references.

\- Restricted export permissions.

\- Administrative action logging.

\- Secure handling of temporary assessment data.



A user must never gain access merely by changing a URL, request parameter, resource identifier, or frontend role value.



\## 15. Future Roles



The following roles may be considered in future versions, but are not part of the initial four-role model.



| Potential role | Possible responsibility |

|---|---|

| Faculty Coordinator | Coordinate departmental assessment activities |

| Skill Development Coordinator | Coordinate approved development initiatives |

| Institutional Auditor | Review authorized governance and compliance records |

| Placement Cell Representative | Provide approved institutional skill-demand context |

| External Trainer | Access only assigned program-related information |

| System Support Engineer | Perform restricted technical support operations |



Introducing these roles requires a separate permission and governance review.



\## 16. Acceptance Criteria



The role governance model is acceptable when:



1\. All four primary roles are defined.

2\. Responsibilities are documented for each role.

3\. Authority boundaries are explicit.

4\. Permissions are separated from role descriptions.

5\. HOD access is restricted to the assigned department.

6\. Dean access covers authorized institutional information.

7\. Students can access only permitted assessment functions.

8\. Administrators cannot automatically access identifiable student data.

9\. Configuration changes follow approved governance.

10\. Approval authority is separated from technical administration.

11\. Sensitive exports have explicit permissions.

12\. Backend authorization is enforced for every protected operation.

13\. Temporary assessment data follows the session retention policy.

14\. Governance history persistence is handled as a separate decision.



\## 17. Open Governance Decisions



The following require institutional confirmation.



| Decision | Current position |

|---|---|

| Who authorizes Administrator accounts? | Pending |

| Who approves new HOD and Dean role assignments? | Pending |

| Can HODs create sessions independently? | Proposed, subject to delegation |

| Can HODs upload datasets directly? | Proposed, subject to delegation |

| Can Deans access identifiable student records? | Not granted by default |

| Who approves proficiency framework changes? | Institutional authority to be defined |

| Who approves skill target changes? | Institutional authority to be defined |

| Who approves recommendation priority configuration? | Institutional authority to be defined |

| Must approval history survive session expiry? | Pending |

| Is an institutional auditor required? | Future consideration |

| Is university SSO required? | Pending integration decision |



\## 18. Final Governance Position



The Student Skill Intelligence Platform uses four primary roles:



\- \*\*Administrator:\*\* Maintains the platform and its technical configuration.

\- \*\*Dean:\*\* Provides institutional oversight and approval.

\- \*\*HOD:\*\* Reviews departmental skill intelligence and proposes development initiatives.

\- \*\*Student:\*\* Participates in skill assessments.



The platform must enforce role permissions together with departmental or institutional resource scope.



No role should receive unrestricted authority simply because of its organizational seniority.



The governing principle is:



\*\*Administrative control manages the platform. Academic responsibility evaluates the findings. Institutional authority approves the initiatives. Students provide the assessment data.\*\*

