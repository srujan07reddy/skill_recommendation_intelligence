\# PAGE\_SPECIFICATIONS.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Specification  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the page-level specifications for the Student Skill Intelligence Platform.



It translates the requirements established in `USER\_JOURNEYS.md` and `FRONTEND\_ARCHITECTURE.md` into implementable frontend screens.



Each page specification identifies:



\- Page purpose.

\- Authorized users.

\- Layout structure.

\- UI components.

\- Data displayed.

\- User actions.

\- Navigation behavior.

\- Loading, empty, success, and error states.

\- Access restrictions.

\- API dependencies.



The objective is to maintain consistency across all role-specific workspaces while ensuring that each role receives an interface appropriate to its responsibilities.



\## 2. Design Principles



\### 2.1 Visual Direction



The initial release follows a light-first institutional interface.



| Element | Design direction |

|---|---|

| Default appearance | Light |

| Primary surface | White |

| Secondary surface | Light neutral grey |

| Primary accent | Restrained institutional blue |

| Primary text | Dark charcoal |

| Secondary text | Muted grey |

| Success | Green |

| Warning | Amber |

| Error | Red |

| Borders | Subtle neutral dividers |

| Shadows | Minimal |

| Cards | Used only when they improve grouping or hierarchy |



\### 2.2 Layout Principles



\- Prefer open layouts over excessive card-based interfaces.

\- Avoid unnecessary nested containers.

\- Maintain consistent page spacing and alignment.

\- Use clear typography and information hierarchy.

\- Use tables for detailed records.

\- Use charts for meaningful analytical comparisons.

\- Keep primary actions visually distinguishable.

\- Place filters near the data they control.

\- Avoid presenting too many metrics in a single viewport.

\- Make important data quality warnings visible.



\### 2.3 Responsive Behavior



| Device | Layout behavior |

|---|---|

| Desktop | Full sidebar and primary content area |

| Tablet | Collapsible sidebar and adaptive content |

| Mobile | Compact navigation and vertically stacked content |



Analytical tables should support horizontal scrolling or an appropriate responsive presentation on smaller screens.



\## 3. Global Application Structure



The application uses a shared shell for authenticated users.



\### 3.1 Application Shell



```text

+------------------------------------------------------------+

| Logo       Platform Name             Notifications Profile |

+-------------------+----------------------------------------+

|                   |                                        |

|                   |                                        |

|   Role-Based      |            Page Header                 |

|   Navigation      |----------------------------------------|

|                   |                                        |

|   Dashboard       |            Main Content                |

|   Sessions        |                                        |

|   Analytics       |                                        |

|   Other Modules   |                                        |

|                   |                                        |

|                   |                                        |

+-------------------+----------------------------------------+

```



\### 3.2 Shared Components



| Component | Responsibility |

|---|---|

| AppShell | Global authenticated layout |

| Sidebar | Role-specific navigation |

| Topbar | Platform identity and account actions |

| Breadcrumbs | Current page hierarchy |

| PageHeader | Page title, description, and primary actions |

| FilterBar | Analytical and data filters |

| DataTable | Structured record presentation |

| MetricDisplay | Numerical indicators |

| ChartPanel | Analytical visualization |

| StatusIndicator | Workflow and processing states |

| ConfirmationDialog | Confirmation for consequential actions |

| EmptyState | Guidance when no data exists |

| ErrorState | Safe error presentation |

| LoadingState | Loading and processing feedback |

| NotificationCenter | Authorized notifications |

| UserMenu | Account and session actions |



\### 3.3 Global Navigation Rules



\- Navigation must be generated according to the authenticated user's permissions.

\- Hidden navigation items must not be treated as authorization controls.

\- Direct URL access must undergo backend authorization.

\- Unauthorized pages must display an access-denied state.

\- Role switching, where supported, must refresh permissions and navigation.

\- Breadcrumbs must reflect the actual navigation hierarchy.



\---



\# 4. Public and Authentication Pages



\## 4.1 Login Page



\*\*Page ID:\*\* AUTH-001  

\*\*Route:\*\* `/login`  

\*\*Access:\*\* Public



\### Purpose



Authenticate users and direct them to their authorized workspace.



\### Layout



```text

+------------------------------------------------------+

|                                                      |

|                 Platform Logo                        |

|                                                      |

|          Student Skill Intelligence Platform        |

|                                                      |

|             Institutional Login                     |

|                                                      |

|          Username / Email / University ID            |

|          \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]          |

|                                                      |

|          Password                                    |

|          \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]          |

|                                                      |

|          \[            Sign In             ]          |

|                                                      |

|          Forgot Password?                            |

|                                                      |

+------------------------------------------------------+

```



\### Components



\- Platform logo.

\- Platform name.

\- Username or university identifier input.

\- Password input.

\- Password visibility control.

\- Sign-in button.

\- Password recovery link, if supported.

\- Authentication error message.



\### Actions



| Action | Result |

|---|---|

| Sign In | Submit authentication request |

| Show Password | Toggle password visibility |

| Forgot Password | Open recovery workflow, if enabled |



\### States



\- Default.

\- Submitting.

\- Authentication failed.

\- Account disabled.

\- Session expired.

\- Network error.



\### API Dependencies



\- `POST /api/v1/auth/login`

\- `POST /api/v1/auth/logout`

\- `GET /api/v1/auth/me`



Exact authentication contracts must follow `API\_DOCUMENTATION.md`.



\---



\## 4.2 Access Denied Page



\*\*Page ID:\*\* AUTH-002  

\*\*Route:\*\* `/access-denied`  

\*\*Access:\*\* Authenticated users



\### Purpose



Inform users that they do not have permission to access a requested resource.



\### Components



\- Access-denied illustration or icon.

\- Clear explanation.

\- Return to dashboard action.

\- Optional support information.



\### Behavior



\- Do not reveal restricted resource details.

\- Do not expose backend authorization rules.

\- Provide a safe navigation path.



\---



\# 5. Student Workspace



Student pages focus on assessment participation and submission status.



\## 5.1 Student Dashboard



\*\*Page ID:\*\* STD-001  

\*\*Route:\*\* `/student/dashboard`  

\*\*Access:\*\* Student



\### Purpose



Provide students with an overview of available assessments and their submissions.



\### Layout



```text

+------------------------------------------------------+

| Student Dashboard                                    |

|------------------------------------------------------|

| Welcome / Student Information                        |

|                                                      |

| Available Assessments                                |

|                                                      |

| Assessment Name       Deadline       Status          |

| Assessment A          Date           Available       |

| Assessment B          Date           Submitted       |

|                                                      |

| My Recent Submissions                                |

|                                                      |

| Submission          Date             Status          |

| Submission A        Date             Accepted       |

| Submission B        Date             Under Review   |

|                                                      |

+------------------------------------------------------+

```



\### Components



\- Welcome section.

\- Student profile summary.

\- Available assessment list.

\- Assessment deadline indicator.

\- Submission status table.

\- Recent activity.



\### Actions



| Action | Result |

|---|---|

| Open Assessment | Navigate to assessment details |

| View Submission | Display permitted submission status |

| View Profile | Open profile page |



\### Data Requirements



\- Student account information.

\- Available sessions.

\- Session opening and closing times.

\- Submission references.

\- Submission statuses.



\### States



\- No available assessments.

\- Assessments available.

\- Assessment in progress.

\- Submission completed.

\- Session expired.

\- Loading or retrieval failure.



\---



\## 5.2 Assessment Details Page



\*\*Page ID:\*\* STD-002  

\*\*Route:\*\* `/student/assessments/:sessionId`  

\*\*Access:\*\* Student with authorized session access



\### Purpose



Display assessment information before the student begins.



\### Components



\- Assessment title.

\- Description.

\- Instructions.

\- Opening date and deadline.

\- Expected information.

\- Submission status.

\- Start Assessment button.



\### Actions



| Action | Result |

|---|---|

| Start Assessment | Open assessment form |

| Return | Navigate to dashboard |



\### Restrictions



\- Expired sessions cannot be started.

\- Scheduled sessions cannot accept early submissions unless explicitly configured.

\- Students cannot modify session configuration.



\---



\## 5.3 Student Assessment Form



\*\*Page ID:\*\* STD-003  

\*\*Route:\*\* `/student/assessments/:sessionId/submit`  

\*\*Access:\*\* Student with active session access



\### Purpose



Collect student skill assessment information.



\### Layout



```text

+------------------------------------------------------+

| Assessment Form                                      |

|------------------------------------------------------|

| Step 1: Student Information                          |

| Student Reference                                    |

| Department                                           |

| Programme                                            |

|                                                      |

| Step 2: Skill Selection                              |

| Search Skills                                        |

| Selected Skills                                      |

|                                                      |

| Step 3: Proficiency                                  |

| Skill                Proficiency                    |

| Python               \[Intermediate]                 |

| Linux                \[Beginner]                     |

|                                                      |

| Step 4: Evidence                                      |

| Evidence Source                                      |

| Supporting Information                               |

|                                                      |

| \[Save Draft]                 \[Review Submission]     |

+------------------------------------------------------+

```



\### Form Sections



\*\*Section A: Student Information\*\*

\- Student reference.

\- Department.

\- Programme or specialization, where applicable.



\*\*Section B: Skill Selection\*\*

\- Skill domain selector.

\- Category selector.

\- Skill search.

\- Selected skill list.

\- Add/remove skill actions.



\*\*Section C: Proficiency\*\*

\- Proficiency input for each selected skill.

\- Applicable assessment method.

\- Supporting evidence information where required.



\*\*Section D: Evidence\*\*

\- Evidence source.

\- Evidence status where applicable.

\- Evidence details or upload control if supported.



\*\*Section E: Review\*\*

\- Submission summary.

\- Validation messages.

\- Confirmation checkbox if required.



\### Actions



| Action | Result |

|---|---|

| Add Skill | Add a selected taxonomy skill |

| Remove Skill | Remove selected skill |

| Save Draft | Save recoverable form state if supported |

| Review Submission | Display review page |

| Submit | Submit to backend validation |



\### Validation



Follow `VALIDATION\_RULES.md`.



\### States



\- Empty form.

\- Partially completed.

\- Invalid fields.

\- Submission processing.

\- Accepted.

\- Accepted with warnings.

\- Rejected.

\- Session expired.



\### Important Behavior



\- Do not convert missing proficiency into Beginner.

\- Do not represent self-reported proficiency as verified.

\- Preserve recoverable form state where practical.

\- Do not confirm submission until the backend reports success.



\---



\## 5.4 Submission Confirmation Page



\*\*Page ID:\*\* STD-004  

\*\*Route:\*\* `/student/submissions/:submissionId`  

\*\*Access:\*\* Owner of the submission



\### Purpose



Confirm that a submission has been received and display its current status.



\### Components



\- Submission reference.

\- Assessment name.

\- Submission timestamp.

\- Validation status.

\- Warning summary, if applicable.

\- Next available action.



\### Actions



\- Return to dashboard.

\- View permitted submission details.



\### States



\- Accepted.

\- Accepted with warnings.

\- Rejected.

\- Pending review.

\- Submission unavailable.



\---



\## 5.5 Student Profile Page



\*\*Page ID:\*\* STD-005  

\*\*Route:\*\* `/student/profile`  

\*\*Access:\*\* Student



\### Purpose



Display basic student account information.



\### Components



\- Student reference.

\- Name, where available.

\- Department.

\- Programme.

\- Account information.



The page must not become a permanent student skill portfolio unless that feature is separately approved.



\---



\# 6. HOD Workspace



HOD pages provide departmental session management, analytics, proposals, and exports.



\## 6.1 HOD Dashboard



\*\*Page ID:\*\* HOD-001  

\*\*Route:\*\* `/hod/dashboard`  

\*\*Access:\*\* HOD



\### Purpose



Provide an overview of departmental assessment activity and skill intelligence.



\### Layout



```text

+------------------------------------------------------------+

| Department Dashboard                                      |

|------------------------------------------------------------|

| Department Name                     Assessment Session    |

|                                                            |

| Eligible Students | Participating | Participation Rate    |

|                                                            |

|------------------------------------------------------------|

| Skill Distribution                                        |

|                                                            |

| \[             Skill Coverage Chart              ]          |

|                                                            |

|------------------------------------------------------------|

| Proficiency Distribution                                  |

|                                                            |

| \[             Proficiency Chart                 ]          |

|                                                            |

|------------------------------------------------------------|

| Priority Skill Gaps                                       |

|                                                            |

| Skill           Relevance       Current Coverage           |

|                                                            |

|------------------------------------------------------------|

| Recommendations                  Recent Sessions          |

+------------------------------------------------------------+

```



\### Components



\- Department header.

\- Session selector.

\- Eligible population metric.

\- Participating student metric.

\- Participation rate.

\- Skill coverage chart.

\- Proficiency distribution chart.

\- Evidence summary.

\- Priority skill gap list.

\- Recommendation preview.

\- Recent sessions.



\### Actions



| Action | Result |

|---|---|

| Create Session | Open session creation |

| View Analytics | Open detailed analytics |

| Review Gaps | Open skill gap page |

| View Recommendations | Open recommendation page |

| Export Report | Open export center |



\### Filters



\- Assessment session.

\- Skill domain.

\- Programme, where configured.

\- Assessment method.

\- Evidence status.



\### States



\- No sessions.

\- Session created but inactive.

\- Active collection.

\- Processing.

\- Completed analysis.

\- Insufficient data.

\- Analysis unavailable.



\### Privacy



Only authorized departmental data may be displayed.



\---



\## 6.2 Session Management Page



\*\*Page ID:\*\* HOD-002  

\*\*Route:\*\* `/hod/sessions`  

\*\*Access:\*\* HOD



\### Purpose



Manage assessment sessions within the HOD's authorized scope.



\### Components



\- Session list.

\- Session status.

\- Session type.

\- Department scope.

\- Creation date.

\- Collection deadline.

\- Session actions.



\### Actions



\- Create session.

\- Open session.

\- View session details.

\- Close session, if permitted.

\- View validation results.

\- Open analysis.



\### Session Filters



\- Status.

\- Session type.

\- Date range.



\### Empty State



Display guidance when the department has no assessment sessions.



\---



\## 6.3 Create Session Page



\*\*Page ID:\*\* HOD-003  

\*\*Route:\*\* `/hod/sessions/create`  

\*\*Access:\*\* HOD with session creation permission



\### Purpose



Create a departmental assessment session.



\### Form Sections



\*\*Section A: Basic Information\*\*

\- Session name.

\- Description.

\- Session type.



\*\*Section B: Scope\*\*

\- Department.

\- Programme or specialization, where applicable.



\*\*Section C: Collection Configuration\*\*

\- Form collection enabled.

\- Bulk upload enabled.

\- Combined collection enabled.



\*\*Section D: Schedule\*\*

\- Activation date.

\- Submission deadline.

\- Session access expiry configuration.



\*\*Section E: Assessment Configuration\*\*

\- Instructions.

\- Applicable proficiency framework.

\- Permitted assessment inputs.



\### Actions



\- Save draft, if supported.

\- Review configuration.

\- Create session.

\- Cancel.



\### Validation



\- Department scope must match the user's authorization.

\- Session dates must be valid.

\- At least one input channel must be enabled.

\- Required configuration must exist.



\---



\## 6.4 Session Details Page



\*\*Page ID:\*\* HOD-004  

\*\*Route:\*\* `/hod/sessions/:sessionId`  

\*\*Access:\*\* Authorized HOD



\### Purpose



Display session information and its current processing state.



\### Components



\- Session metadata.

\- Session status.

\- Collection methods.

\- Participation summary.

\- Upload history.

\- Submission summary.

\- Validation summary.

\- Analysis status.

\- Export availability.



\### Actions



\- Open assessment link, where applicable.

\- Upload dataset.

\- View validation report.

\- Start analysis, if permitted.

\- View analytics.

\- Close session, if permitted.



\---



\## 6.5 Bulk Upload Page



\*\*Page ID:\*\* HOD-005  

\*\*Route:\*\* `/hod/sessions/:sessionId/upload`  

\*\*Access:\*\* HOD with upload permission



\### Purpose



Upload and validate Excel or CSV datasets.



\### Layout



```text

+------------------------------------------------------+

| Bulk Dataset Upload                                  |

|------------------------------------------------------|

| Select Assessment Session                            |

|                                                      |

| Drag and Drop / Browse File                          |

|                                                      |

| Supported: XLSX, CSV                                 |

|                                                      |

| Uploaded File                                        |

|                                                      |

| Column Mapping                                       |

|                                                      |

| Platform Field       Uploaded Column                |

| Student Reference    \[Roll No]                      |

| Department           \[Department]                   |

| Skill                \[Skill Name]                   |

| Proficiency          \[Level]                        |

|                                                      |

| \[Validate Dataset]                                   |

+------------------------------------------------------+

```



\### Components



\- File upload area.

\- Supported format information.

\- File details.

\- Column mapping table.

\- Validation summary.

\- Record preview.

\- Import confirmation.



\### Actions



\- Select file.

\- Remove file.

\- Map columns.

\- Validate dataset.

\- Download validation report.

\- Confirm import.



\### States



\- No file selected.

\- Uploading.

\- File uploaded.

\- Validating.

\- Validation completed.

\- Blocking errors.

\- Ready for import.

\- Importing.

\- Import completed.

\- Failed.



\### Security



\- File upload must be protected.

\- Server-side validation is mandatory.

\- File contents must not be exposed through public URLs.



\---



\## 6.6 Validation Results Page



\*\*Page ID:\*\* HOD-006  

\*\*Route:\*\* `/hod/sessions/:sessionId/validation`  

\*\*Access:\*\* Authorized HOD



\### Purpose



Display validation outcomes for submitted or uploaded assessment data.



\### Components



\- Total records.

\- Accepted records.

\- Accepted with warnings.

\- Rejected records.

\- Duplicate records.

\- Unknown skills.

\- Invalid departments.

\- Error details table.

\- Warning details table.



\### Actions



\- Filter errors.

\- Inspect affected records using temporary references.

\- Download validation report.

\- Return to upload.

\- Confirm partial import where permitted.



\### Important Behavior



Do not expose full student-identifiable data unnecessarily.



\---



\## 6.7 Department Skill Analytics Page



\*\*Page ID:\*\* HOD-007  

\*\*Route:\*\* `/hod/analytics`  

\*\*Access:\*\* HOD



\### Purpose



Provide detailed analysis of departmental skill distribution and proficiency.



\### Components



\- Session selector.

\- Population summary.

\- Skill domain distribution.

\- Skill category distribution.

\- Individual skill coverage table.

\- Proficiency distribution.

\- Evidence distribution.

\- Assessment method filters.



\### Suggested Table



| Skill | Eligible Population | Students with Skill | Coverage |

|---|---:|---:|---:|

| Skill A | 100 | 70 | 70% |

| Skill B | 100 | 45 | 45% |



Illustrative values only.



\### Charts



\- Skill coverage bar chart.

\- Proficiency distribution stacked bar chart.

\- Skill domain distribution chart.

\- Evidence status chart.



\### Actions



\- Filter metrics.

\- Inspect skill details.

\- Open skill gap analysis.

\- Export current report.



\### Rules



\- Show denominators.

\- Label the assessment basis.

\- Suppress small groups.

\- Do not show historical trends unless comparable historical data exists.



\---



\## 6.8 Skill Details Page



\*\*Page ID:\*\* HOD-008  

\*\*Route:\*\* `/hod/analytics/skills/:skillId`  

\*\*Access:\*\* HOD



\### Purpose



Display the detailed analytical profile of a selected skill.



\### Components



\- Skill name and domain.

\- Department relevance.

\- Eligible population.

\- Students with skill.

\- Coverage percentage.

\- Proficiency distribution.

\- Evidence distribution.

\- Data quality indicators.

\- Related skill gaps.

\- Relevant recommendations.



\### Actions



\- Return to analytics.

\- Inspect gap details.

\- View related recommendations.

\- Export skill report.



Student-level records must not be displayed unless separately authorized.



\---



\## 6.9 Skill Gap Analysis Page



\*\*Page ID:\*\* HOD-009  

\*\*Route:\*\* `/hod/skill-gaps`  

\*\*Access:\*\* HOD



\### Purpose



Display departmental skill gaps calculated against approved targets.



\### Components



\- Session selector.

\- Skill gap summary.

\- Core skill gaps.

\- Recommended skill gaps.

\- Specialized skill gaps.

\- Coverage target comparison.

\- Evidence gaps.

\- Participation warnings.



\### Suggested Table



| Skill | Relevance | Current Coverage | Target | Gap |

|---|---|---:|---:|---:|

| Skill A | Core | 45% | 70% | 25 pp |

| Skill B | Recommended | 55% | 60% | 5 pp |



Illustrative values only. Target values must be institutionally configured.



\### Actions



\- Filter by relevance.

\- Inspect skill gap.

\- Open recommendation.

\- Create proposal.



\### Important Behavior



\- Do not calculate gaps without approved targets.

\- Distinguish percentage points from relative percentage change.

\- Do not classify evidence gaps as competency gaps.

\- Show insufficient-data warnings.



\---



\## 6.10 Recommendations Page



\*\*Page ID:\*\* HOD-010  

\*\*Route:\*\* `/hod/recommendations`  

\*\*Access:\*\* HOD



\### Purpose



Display rule-based development recommendations derived from skill gaps.



\### Components



\- Recommendation list.

\- Recommendation category.

\- Related skill.

\- Identified need.

\- Priority.

\- Supporting analytical evidence.

\- Suggested initiative.

\- Recommendation rule reference.



\### Actions



\- View recommendation details.

\- Mark for consideration, if supported.

\- Create development proposal.

\- Export recommendations.



\### Important Behavior



Recommendations are advisory. They must not automatically create or approve institutional initiatives.



\---



\## 6.11 Recommendation Details Page



\*\*Page ID:\*\* HOD-011  

\*\*Route:\*\* `/hod/recommendations/:recommendationId`  

\*\*Access:\*\* HOD



\### Components



\- Recommendation title.

\- Skill gap reference.

\- Department relevance.

\- Supporting metrics.

\- Recommendation rationale.

\- Suggested development format.

\- Expected outcome.

\- Applicable limitations.



\### Actions



\- Create proposal.

\- Return to recommendation list.



\---



\## 6.12 Development Proposal Page



\*\*Page ID:\*\* HOD-012  

\*\*Route:\*\* `/hod/proposals/create`  

\*\*Access:\*\* HOD with proposal permission



\### Purpose



Create a development initiative proposal for Dean review.



\### Form Sections



\*\*Section A: Initiative Information\*\*

\- Title.

\- Description.

\- Initiative type.



\*\*Section B: Analytical Justification\*\*

\- Related skill.

\- Related gap.

\- Supporting analysis.

\- Target department.



\*\*Section C: Proposed Execution\*\*

\- Intended student population.

\- Proposed duration.

\- Expected outcomes.



\*\*Section D: Resource Requirements\*\*

\- Required trainers.

\- Infrastructure.

\- Tools.

\- Estimated cost, where applicable.



\*\*Section E: Submission\*\*

\- Supporting information.

\- Final review.

\- Submit proposal.



\### Actions



\- Save draft.

\- Review.

\- Submit.

\- Cancel.



\### States



\- Draft.

\- Submitting.

\- Submitted.

\- Submission failed.



Proposal persistence is subject to the unresolved governance-storage decision.



\---



\## 6.13 Proposal History Page



\*\*Page ID:\*\* HOD-013  

\*\*Route:\*\* `/hod/proposals`  

\*\*Access:\*\* HOD



\### Purpose



View proposals created by the HOD and their current status.



\### Components



\- Proposal list.

\- Proposal reference.

\- Submission date.

\- Related initiative.

\- Current status.

\- Dean decision.

\- Review comments, where permitted.



\### Actions



\- Open proposal.

\- Review requested changes.

\- Update and resubmit, if permitted.

\- Withdraw, if permitted.



\---



\# 7. Dean Workspace



Dean pages focus on institutional analytics, department comparison, and proposal decisions.



\## 7.1 Institutional Dashboard



\*\*Page ID:\*\* DEA-001  

\*\*Route:\*\* `/dean/dashboard`  

\*\*Access:\*\* Dean



\### Purpose



Provide an institution-wide overview of skill intelligence.



\### Layout



```text

+------------------------------------------------------------+

| Institutional Skill Intelligence                           |

|------------------------------------------------------------|

| Eligible Students | Participating | Participation Rate    |

|------------------------------------------------------------|

| Institutional Skill Distribution                          |

|                                                            |

| \[                 Domain Chart                   ]          |

|                                                            |

|------------------------------------------------------------|

| Department Comparison                                     |

|                                                            |

| Department      Coverage       Participation              |

| Department A    Metric         Metric                     |

| Department B    Metric         Metric                     |

|                                                            |

|------------------------------------------------------------|

| Institutional Skill Gaps                                  |

|                                                            |

| Priority Recommendations                                  |

|                                                            |

| Pending Proposals                                          |

+------------------------------------------------------------+

```



\### Components



\- Institutional population metrics.

\- Participation rate.

\- Skill domain distribution.

\- Institutional proficiency distribution.

\- Department comparison summary.

\- Institutional skill gaps.

\- Evidence quality summary.

\- Recommendation summary.

\- Pending proposal count.

\- Active session summary.



\### Actions



\- Open department comparison.

\- View institutional analytics.

\- Review skill gaps.

\- Review proposals.

\- Create institutional session.

\- Export institutional report.



\### Privacy



All metrics must respect institutional access policies and small-group suppression.



\---



\## 7.2 Institutional Analytics Page



\*\*Page ID:\*\* DEA-002  

\*\*Route:\*\* `/dean/analytics`  

\*\*Access:\*\* Dean



\### Purpose



Display institution-wide skill intelligence.



\### Components



\- Institutional population summary.

\- Domain distribution.

\- Category distribution.

\- Skill coverage.

\- Proficiency distribution.

\- Verified proficiency.

\- Evidence availability.

\- Data quality indicators.



\### Filters



\- Assessment session.

\- Department.

\- Skill domain.

\- Skill category.

\- Programme, where configured.

\- Assessment method.

\- Evidence status.



\### Actions



\- Inspect skill details.

\- Open department comparison.

\- Open institutional gap analysis.

\- Export report.



\---



\## 7.3 Department Comparison Page



\*\*Page ID:\*\* DEA-003  

\*\*Route:\*\* `/dean/department-comparison`  

\*\*Access:\*\* Dean



\### Purpose



Compare departmental skill profiles.



\### Components



\- Session selector.

\- Department selector.

\- Comparison metric selector.

\- Department comparison table.

\- Comparative charts.

\- Population and data quality indicators.



\### Comparison Metrics



\- Participation rate.

\- Skill coverage.

\- Proficiency distribution.

\- Verified coverage.

\- Evidence availability.



\### Actions



\- Select departments.

\- Select metric.

\- Apply filters.

\- Inspect department.

\- Export comparison report.



\### Important Behavior



\- Use comparable metric definitions.

\- Display population sizes.

\- Display assessment basis.

\- Flag incompatible or insufficient data.

\- Avoid misleading rankings based only on raw counts.



\---



\## 7.4 Institutional Skill Gap Page



\*\*Page ID:\*\* DEA-004  

\*\*Route:\*\* `/dean/skill-gaps`  

\*\*Access:\*\* Dean



\### Purpose



Identify institutional and cross-department skill development needs.



\### Components



\- Institutional gap overview.

\- Skill domain gap summary.

\- Departmental gap comparison.

\- Core skill gaps.

\- Specialized skill gaps.

\- Evidence gaps.

\- Approved target comparison.



\### Actions



\- Inspect skill gap.

\- Compare affected departments.

\- Review related recommendations.

\- Export institutional gap report.



\---



\## 7.5 Proposal Management Page



\*\*Page ID:\*\* DEA-005  

\*\*Route:\*\* `/dean/proposals`  

\*\*Access:\*\* Dean



\### Purpose



Display development proposals submitted by HODs.



\### Components



\- Proposal queue.

\- Department.

\- Proposal title.

\- Submission date.

\- Related skill gap.

\- Proposal status.

\- Review status.



\### Filters



\- Department.

\- Proposal status.

\- Submission date.

\- Initiative type.



\### Actions



\- Open proposal.

\- Review details.

\- Approve.

\- Reject.

\- Request changes.

\- Defer.



\---



\## 7.6 Proposal Review Page



\*\*Page ID:\*\* DEA-006  

\*\*Route:\*\* `/dean/proposals/:proposalId`  

\*\*Access:\*\* Dean



\### Purpose



Provide the complete information required to make a proposal decision.



\### Layout



```text

+------------------------------------------------------------+

| Proposal Review                                            |

|------------------------------------------------------------|

| Initiative Information                                    |

|                                                            |

| Submitted By / Department                                 |

|                                                            |

|------------------------------------------------------------|

| Analytical Justification                                  |

|                                                            |

| Related Skill Gap                                         |

| Supporting Metrics                                        |

|                                                            |

|------------------------------------------------------------|

| Proposed Initiative                                       |

|                                                            |

| Expected Outcomes                                         |

| Resource Requirements                                     |

|                                                            |

|------------------------------------------------------------|

| Dean Decision                                              |

|                                                            |

| \[Approve] \[Request Changes] \[Reject] \[Defer]              |

|                                                            |

| Decision Comments                                         |

+------------------------------------------------------------+

```



\### Actions



| Action | Result |

|---|---|

| Approve | Record approval |

| Reject | Record rejection and justification |

| Request Changes | Return proposal to HOD |

| Defer | Postpone decision |



\### Validation



\- Decision must be authorized.

\- Required comments must be present according to decision policy.

\- Duplicate or conflicting decisions must be prevented.

\- Decision must be associated with the correct proposal revision.



\---



\# 8. Administrator Workspace



\## 8.1 Administration Dashboard



\*\*Page ID:\*\* ADM-001  

\*\*Route:\*\* `/admin/dashboard`  

\*\*Access:\*\* Administrator



\### Purpose



Provide an overview of platform configuration and operational status.



\### Components



\- User count.

\- Role configuration summary.

\- Department configuration summary.

\- Active session count.

\- Processing jobs.

\- Export jobs.

\- Cleanup status.

\- System health.



Operational metrics must not expose restricted assessment contents.



\---



\## 8.2 User Management Page



\*\*Page ID:\*\* ADM-002  

\*\*Route:\*\* `/admin/users`  

\*\*Access:\*\* Administrator with user-management permission



\### Purpose



Manage platform user accounts.



\### Components



\- User search.

\- User table.

\- Role assignments.

\- Department scope.

\- Account status.

\- Create user action.



\### Actions



\- Create user.

\- Edit user.

\- Assign role.

\- Update scope.

\- Disable account.

\- Enable account.



\### Restrictions



Role changes must follow permission policies and must not allow unauthorized privilege escalation.



\---



\## 8.3 Role and Permission Management Page



\*\*Page ID:\*\* ADM-003  

\*\*Route:\*\* `/admin/roles-permissions`  

\*\*Access:\*\* Administrator with configuration permission



\### Purpose



Manage role definitions and permissions.



\### Components



\- Role list.

\- Permission list.

\- Role-permission mapping.

\- Scope configuration.

\- Permission descriptions.



\### Actions



\- View role.

\- Configure permission.

\- Update role mapping.

\- Review permission changes.



The interface must make it clear that permissions are enforced by the backend.



\---



\## 8.4 Department Management Page



\*\*Page ID:\*\* ADM-004  

\*\*Route:\*\* `/admin/departments`  

\*\*Access:\*\* Administrator



\### Purpose



Maintain the institution's department and programme structure.



\### Components



\- Department list.

\- Department identifier.

\- Department name.

\- Parent organizational unit, where applicable.

\- Programme list.

\- Active status.



\### Actions



\- Add department.

\- Edit department.

\- Configure programme.

\- Activate or deactivate department.



Changes must preserve referential integrity and historical configuration references.



\---



\## 8.5 Skill Taxonomy Management Page



\*\*Page ID:\*\* ADM-005  

\*\*Route:\*\* `/admin/skill-taxonomy`  

\*\*Access:\*\* Administrator with taxonomy permission



\### Purpose



Manage skill domains, categories, skills, and aliases.



\### Components



\- Domain hierarchy.

\- Category list.

\- Skill list.

\- Search.

\- Alias management.

\- Department relevance mapping.

\- Taxonomy version.



\### Actions



\- Add domain.

\- Add category.

\- Add skill.

\- Edit skill.

\- Add alias.

\- Configure department relevance.

\- Deactivate skill.

\- Publish taxonomy version.



\### Important Behavior



\- Taxonomy changes must be versioned.

\- Ambiguous aliases must be prevented.

\- Existing analysis snapshots must retain their original taxonomy version.



\---



\## 8.6 Proficiency Framework Page



\*\*Page ID:\*\* ADM-006  

\*\*Route:\*\* `/admin/proficiency-framework`  

\*\*Access:\*\* Administrator with framework permission



\### Purpose



Configure proficiency definitions and classification criteria.



\### Components



\- Framework version.

\- Proficiency levels.

\- Score ranges.

\- Evidence criteria.

\- Assessment methods.

\- Classification rules.



\### Actions



\- Create framework version.

\- Edit draft framework.

\- Validate thresholds.

\- Publish version.



Changes must not silently alter previously generated analytical snapshots.



\---



\## 8.7 Validation Configuration Page



\*\*Page ID:\*\* ADM-007  

\*\*Route:\*\* `/admin/validation-rules`  

\*\*Access:\*\* Administrator with configuration permission



\### Purpose



Configure validation policies.



\### Components



\- Supported file formats.

\- Upload size limits.

\- Record limits.

\- Mandatory fields.

\- Duplicate policy.

\- Accepted proficiency inputs.

\- Evidence requirements.

\- Rule versions.



\### Actions



\- Update configurable rule.

\- Validate configuration.

\- Publish rule version.



Changes must be traceable and must not retroactively modify an existing session's validation behavior without an explicit migration or revalidation process.



\---



\## 8.8 Recommendation Rules Page



\*\*Page ID:\*\* ADM-008  

\*\*Route:\*\* `/admin/recommendation-rules`  

\*\*Access:\*\* Administrator with recommendation configuration permission



\### Purpose



Configure deterministic recommendation rules.



\### Components



\- Recommendation categories.

\- Skill gap mappings.

\- Priority rules.

\- Eligibility conditions.

\- Rule versions.

\- Active/inactive status.



\### Actions



\- Create rule.

\- Edit rule.

\- Test rule.

\- Activate rule.

\- Deactivate rule.



Recommendation rule changes must be versioned.



\---



\## 8.9 Platform Settings Page



\*\*Page ID:\*\* ADM-009  

\*\*Route:\*\* `/admin/settings`  

\*\*Access:\*\* Administrator with settings permission



\### Purpose



Manage platform-level settings.



\### Configuration Areas



\- Session defaults.

\- Retention settings.

\- Upload limits.

\- Export settings.

\- Privacy thresholds.

\- Notification configuration.

\- Operational settings.



Sensitive security settings must require appropriate authorization and change controls.



\---



\## 8.10 Operational Monitoring Page



\*\*Page ID:\*\* ADM-010  

\*\*Route:\*\* `/admin/operations`  

\*\*Access:\*\* Administrator with operational monitoring permission



\### Purpose



Monitor platform health and temporary processing operations.



\### Components



\- API health.

\- Backend status.

\- Session processing status.

\- Upload processing status.

\- Analysis jobs.

\- Export jobs.

\- Cleanup status.

\- Resource utilization.

\- Operational alerts.



\### Actions



\- Inspect job status.

\- Inspect permitted error metadata.

\- Retry eligible failed jobs.

\- Review cleanup failures.



The page must not expose raw student assessment data or uploaded file contents by default.



\---



\# 9. Shared Functional Pages



These pages are shared by multiple roles, subject to permission checks.



\## 9.1 Export Center



\*\*Page ID:\*\* SHR-001  

\*\*Route:\*\* `/exports`  

\*\*Access:\*\* Authorized HOD and Dean



\### Purpose



Provide report and analysis package generation.



\### Components



\- Session selector.

\- Export mode selector.

\- Format selector.

\- Content selection.

\- Privacy options.

\- Export status.

\- Download action.



\### Export Modes



\*\*Reports-only\*\*

\- PDF.

\- Excel.

\- CSV.



\*\*Complete analysis package\*\*

\- ZIP.

\- Applicable original upload.

\- Normalized data.

\- Analytics.

\- Skill gaps.

\- Recommendations.

\- Reports.

\- Manifest.



\### Actions



\- Configure export.

\- Generate.

\- View status.

\- Download.

\- Inspect expiry.



\### Restrictions



\- Identifiable data requires separate authorization.

\- Department scope must be enforced.

\- Expired source data must not be accessed without an approved export-retention policy.

\- Downloaded files are outside the platform's control.



\---



\## 9.2 Notifications Page



\*\*Page ID:\*\* SHR-002  

\*\*Route:\*\* `/notifications`  

\*\*Access:\*\* Authenticated users



\### Purpose



Display notifications relevant to the user's role.



\### Potential Notification Types



\- Assessment opened.

\- Assessment deadline approaching.

\- Submission received.

\- Submission validation completed.

\- Analysis completed.

\- Analysis failed.

\- Proposal submitted.

\- Proposal decision recorded.

\- Export ready.

\- Session expired.



\### Actions



\- Open notification.

\- Mark as read.

\- Navigate to associated resource.



Notification channels and persistence are open implementation decisions.



\---



\## 9.3 Account Settings Page



\*\*Page ID:\*\* SHR-003  

\*\*Route:\*\* `/account/settings`  

\*\*Access:\*\* Authenticated users



\### Purpose



Display account preferences and permitted security options.



\### Components



\- Account information.

\- Password management, if applicable.

\- Session information.

\- Notification preferences, if supported.



University-managed authentication may restrict some account changes.



\---



\## 9.4 Help and Documentation Page



\*\*Page ID:\*\* SHR-004  

\*\*Route:\*\* `/help`  

\*\*Access:\*\* Authenticated users



\### Purpose



Provide instructions relevant to the user's role.



\### Content



\- Platform overview.

\- Assessment instructions.

\- Upload guidance.

\- Dashboard interpretation.

\- Export instructions.

\- Error resolution.

\- Contact or support information.



Content must be role-aware.



\---



\# 10. Global UI States



All pages must implement consistent application states.



\## 10.1 Loading States



| Context | UI behavior |

|---|---|

| Initial application load | Branded initial loading screen |

| Dashboard data retrieval | Skeleton layout |

| Table retrieval | Table skeleton |

| File upload | Upload progress |

| Validation | Validation processing state |

| Skill analysis | Analysis processing screen |

| Recommendation generation | Recommendation processing state |

| PDF generation | Report generation state |

| ZIP generation | Package assembly state |

| Download preparation | Download preparation state |



For long-running operations, display the actual backend processing stage.



Do not invent progress percentages.



\## 10.2 Empty States



Examples:



\- No assessment sessions created.

\- No available assessments.

\- No student submissions.

\- No uploaded datasets.

\- No valid records.

\- No skill gaps configured.

\- No recommendations generated.

\- No proposals submitted.

\- No exports available.



Every empty state should explain why the page is empty and provide a relevant next action where permitted.



\## 10.3 Error States



Examples:



\- Network failure.

\- Unauthorized access.

\- Session expired.

\- Invalid request.

\- Upload failure.

\- Validation failure.

\- Analysis failure.

\- Export failure.

\- Configuration conflict.



Error messages must be actionable without exposing internal technical details.



\## 10.4 Confirmation States



Confirmation should be required for consequential actions such as:



\- Closing an active session.

\- Publishing a taxonomy version.

\- Publishing a proficiency framework.

\- Changing permission mappings.

\- Approving or rejecting a proposal.

\- Deactivating important configuration.

\- Initiating irreversible cleanup actions.



\---



\# 11. Page-to-API Mapping



The following mapping is provisional and must be reconciled with `API\_DOCUMENTATION.md`.



| Page | Main API areas |

|---|---|

| Login | Authentication |

| Student Dashboard | Users, Sessions, Assessment |

| Assessment Form | Assessment, Taxonomy, Validation |

| HOD Dashboard | Dashboard, Analytics |

| Session Management | Sessions |

| Create Session | Sessions, Authorization |

| Bulk Upload | Upload, Validation, Ingestion |

| Validation Results | Validation |

| Department Analytics | Analysis, Dashboard |

| Skill Details | Analysis, Taxonomy |

| Skill Gaps | Skill Gap Analysis |

| Recommendations | Recommendation Engine |

| Proposal Creation | Governance |

| Dean Dashboard | Institutional Dashboard |

| Department Comparison | Analytics |

| Proposal Review | Governance |

| User Management | Users, Roles |

| Taxonomy Management | Taxonomy |

| Proficiency Framework | Proficiency Configuration |

| Validation Configuration | Platform Configuration |

| Export Center | Exports |

| Operational Monitoring | Health, Jobs, Cleanup |



The frontend must use API response contracts rather than duplicating analytical calculations in browser code.



\---



\# 12. Route and Permission Matrix



| Route group | Student | HOD | Dean | Admin |

|---|---:|---:|---:|---:|

| `/login` | Public | Public | Public | Public |

| `/student/\*` | Yes | No | No | No by default |

| `/hod/\*` | No | Authorized scope | No | No by default |

| `/dean/\*` | No | No | Institutional scope | No by default |

| `/admin/\*` | No | No | No | Authorized configuration |

| `/exports` | No | Department scope | Institutional scope | No by default |

| `/notifications` | Own | Own | Own | Own |

| `/account/\*` | Own | Own | Own | Own |

| `/help` | Role-aware | Role-aware | Role-aware | Role-aware |



This is the default role matrix. Additional permissions may be introduced through the authorization model, but every permission must be explicitly granted.



\---



\# 13. Frontend Component Hierarchy



Proposed React component organization:



```text

src/

├── app/

│   ├── App.tsx

│   ├── router.tsx

│   └── providers/

│

├── layouts/

│   ├── PublicLayout.tsx

│   ├── StudentLayout.tsx

│   ├── HODLayout.tsx

│   ├── DeanLayout.tsx

│   └── AdminLayout.tsx

│

├── components/

│   ├── navigation/

│   ├── forms/

│   ├── tables/

│   ├── charts/

│   ├── metrics/

│   ├── dialogs/

│   ├── feedback/

│   └── shared/

│

├── features/

│   ├── auth/

│   ├── student/

│   ├── sessions/

│   ├── uploads/

│   ├── validation/

│   ├── analytics/

│   ├── skill-gaps/

│   ├── recommendations/

│   ├── proposals/

│   ├── exports/

│   ├── administration/

│   └── notifications/

│

├── services/

│   ├── api/

│   └── endpoints/

│

├── hooks/

├── types/

├── schemas/

├── utils/

└── styles/

```



This is a proposed frontend organization. It should be refined during implementation without changing the defined page responsibilities.



\---



\# 14. Accessibility Requirements



All pages must target WCAG 2.2 AA accessibility.



Requirements include:



\- Keyboard-accessible navigation.

\- Visible focus indicators.

\- Accessible form labels.

\- Screen-reader-friendly error messages.

\- Sufficient text contrast.

\- Accessible chart summaries.

\- Table headers and appropriate semantics.

\- Non-color-only status indicators.

\- Responsive layouts.

\- Accessible modal and dialog behavior.



Charts must have an equivalent textual or tabular representation for users who cannot interpret the visual chart.



\---



\# 15. Performance Requirements



The frontend must follow the provisional performance requirements in `NON\_FUNCTIONAL\_REQUIREMENTS.md`.



Key implementation requirements:



\- Lazy-load large page modules.

\- Avoid unnecessary API requests.

\- Use caching for appropriate configuration data.

\- Paginate large tables.

\- Avoid loading complete datasets into the browser unnecessarily.

\- Use server-side filtering for large datasets.

\- Avoid repeated chart calculations when the backend already provides analytical results.

\- Show meaningful loading states for asynchronous operations.



\---



\# 16. Security Requirements



1\. Every protected route must verify authentication.

2\. Backend authorization must be enforced for every protected operation.

3\. Frontend navigation must not be considered a security boundary.

4\. Sensitive student data must not be stored in browser local storage by default.

5\. Temporary session data must be cleared from the frontend when access expires.

6\. API errors must not expose internal stack traces.

7\. File uploads must follow backend security validation.

8\. Export links must be protected and expire according to policy.

9\. Student-identifiable information must be hidden unless explicitly authorized.

10\. Role switching must trigger permission re-evaluation.



\---



\# 17. Implementation Priority



The following is the proposed page development sequence.



\### Phase 1 — Application Foundation



\- Login Page.

\- Access Denied Page.

\- Shared Application Shell.

\- Role-Based Navigation.

\- Account Settings.



\### Phase 2 — Assessment Collection



\- Student Dashboard.

\- Assessment Details.

\- Assessment Form.

\- Submission Confirmation.

\- Session Management.

\- Create Session.

\- Session Details.

\- Bulk Upload.

\- Validation Results.



\### Phase 3 — Analytical Workspaces



\- HOD Dashboard.

\- Department Analytics.

\- Skill Details.

\- Skill Gap Analysis.

\- Recommendations.

\- Dean Dashboard.

\- Institutional Analytics.

\- Department Comparison.

\- Institutional Skill Gaps.



\### Phase 4 — Governance



\- Development Proposal.

\- HOD Proposal History.

\- Dean Proposal Management.

\- Proposal Review.



\### Phase 5 — Administration



\- Administration Dashboard.

\- User Management.

\- Role and Permission Management.

\- Department Management.

\- Skill Taxonomy.

\- Proficiency Framework.

\- Validation Configuration.

\- Recommendation Rules.

\- Platform Settings.

\- Operational Monitoring.



\### Phase 6 — Shared Capabilities



\- Export Center.

\- Notifications.

\- Help and Documentation.

\- Final accessibility and responsive refinement.



The sequence is a proposed implementation order, not a dependency that prevents parallel development of independent modules.



\---



\# 18. Acceptance Criteria



The page specification is acceptable when:



1\. Every role has a defined dashboard.

2\. Every major user journey has corresponding pages.

3\. Every page has a defined route and access scope.

4\. All primary user actions are documented.

5\. Loading, empty, success, and error states are covered.

6\. Dashboard metrics follow `ANALYTICS\_SPECIFICATION.md`.

7\. Forms follow `VALIDATION\_RULES.md`.

8\. Session pages follow `SESSION\_MANAGEMENT.md`.

9\. Proposal pages follow the governance model.

10\. Export pages follow `EXPORT\_ARCHITECTURE.md`.

11\. All protected operations rely on backend authorization.

12\. The design follows the light-first visual direction.

13\. Responsive and accessibility requirements are included.

14\. No page introduces functionality outside the approved project scope without a separate decision.



\---



\# 19. Open Decisions



The following items must be finalized before implementation:



1\. Final platform logo, institutional branding, and color values.

2\. Whether authentication uses university SSO or platform-managed accounts.

3\. Whether students can save incomplete assessments as drafts.

4\. Whether students can edit submitted assessments.

5\. Whether students can view their own proficiency information after submission.

6\. Final dashboard metric ordering and visibility.

7\. Whether HODs can create sessions without Dean authorization.

8\. Whether proposal management requires additional institutional roles.

9\. Whether notifications are in-platform, email-based, or both.

10\. Whether supporting evidence files can be uploaded.

11\. Whether proposal attachments are included in the initial release.

12\. Whether operational monitoring requires a separate restricted administrator role.

13\. Final responsive behavior for complex analytical tables.

14\. Whether the application supports multiple institutional themes in future releases.



\---



\## 20. Related Documents



| Document | Relationship |

|---|---|

| PROJECT\_OVERVIEW.md | Product vision |

| SCOPE\_AND\_OBJECTIVES.md | Functional boundaries |

| FUNCTIONAL\_REQUIREMENTS.md | System behavior |

| USER\_JOURNEYS.md | End-to-end user workflows |

| FRONTEND\_ARCHITECTURE.md | Frontend technical and visual architecture |

| BACKEND\_ARCHITECTURE.md | Backend architecture |

| ROLES\_AND\_RESPONSIBILITIES.md | Role definitions |

| ACCESS\_CONTROL.md | Authorization |

| SESSION\_MANAGEMENT.md | Assessment sessions |

| VALIDATION\_RULES.md | Form and upload validation |

| ANALYTICS\_SPECIFICATION.md | Analytical metrics |

| RECOMMENDATION\_ENGINE.md | Recommendations |

| EXPORT\_ARCHITECTURE.md | Export functionality |

| API\_DOCUMENTATION.md | API contracts |

| TESTING\_STRATEGY.md | Testing requirements |



\*\*Document status:\*\* Proposed Specification — Version 1.0



\*\*Core principle:\*\* Every page must have a clear purpose, a defined user, an explicit permission boundary, and a predictable response to every important interaction.

