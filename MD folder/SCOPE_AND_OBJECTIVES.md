\# SCOPE AND OBJECTIVES

\## Student Skill Intelligence Platform (SSIP)



\*\*Document:\*\* SCOPE\_AND\_OBJECTIVES.md  

\*\*Version:\*\* 1.0  

\*\*Status:\*\* Initial Development Specification



\---



\# 1. Project Scope



\## 1.1 Scope Definition



The Student Skill Intelligence Platform (SSIP) is a web-based university skill analysis and decision-support application designed to identify student competencies, analyse departmental skill distributions and recommend suitable institutional skill development initiatives.



The platform will support two primary data collection methods:



1\. Student skill assessment forms.

2\. Bulk student dataset uploads through Excel and CSV files.



Collected information will be processed through a unified analysis pipeline to generate departmental competency insights, identify skill gaps and recommend appropriate development programs.



The application will provide interactive dashboards for authorized university officials and support two offline export options:



\- Reports-only export.

\- Complete analysis package export.



The system will operate using temporary, session-based data processing without maintaining a permanent database of student skill assessment records.



\---



\# 2. Functional Scope



\## 2.1 Student Skill Assessment



The application shall provide structured forms through which students can submit their skill information.



The assessment may collect:



\- Technical skills.

\- Programming languages.

\- Domain-specific competencies.

\- Tools and technologies.

\- Professional skills.

\- Projects and practical experience.

\- Internships.

\- Certifications.

\- Self-reported proficiency levels.



The assessment mechanism must support students possessing multiple skills with different proficiency levels.



Student submissions must be associated with the appropriate academic department and assessment session.



\## 2.2 Bulk Data Upload



The application shall support authorized officials in uploading existing student skill datasets.



Supported formats:



\- Excel (.xlsx)

\- CSV (.csv)



The upload module shall provide:



\- File inspection.

\- Column identification and mapping.

\- Data validation.

\- Missing-value detection.

\- Duplicate detection.

\- Department identification.

\- Skill normalization.

\- Proficiency validation.

\- Import preview.

\- Row-level error reporting.



Invalid records must not be silently discarded.



\## 2.3 Data Validation and Normalization



Information collected through student forms and bulk uploads must be converted into a common internal data structure.



The system shall:



\- Standardize department names.

\- Normalize skill names.

\- Identify duplicate records.

\- Validate proficiency values.

\- Identify incomplete submissions.

\- Preserve source information.

\- Maintain data consistency across analysis sessions.



\## 2.4 Skill Classification and Proficiency Analysis



The platform shall organize student skills using a standardized skill taxonomy.



The initial proficiency framework shall contain:



| Level | Description |

|---|---|

| Beginner | Foundational understanding and introductory practical ability |

| Intermediate | Ability to perform common tasks independently |

| Expert | Advanced practical command and ability to handle complex tasks |



Each student-skill combination may have a different proficiency level.



The application must distinguish self-reported proficiency from independently validated competency.



\## 2.5 Departmental Skill Intelligence



The application shall generate department-level analytical insights.



The analysis shall include:



\- Total students analysed.

\- Number of identified skills.

\- Skill distribution.

\- Proficiency distribution.

\- Departmental competency patterns.

\- Commonly underdeveloped skills.

\- Areas requiring additional training.

\- Skill distribution comparisons across authorized departments.



\## 2.6 Skill Gap Analysis



The system shall identify areas where departmental student competencies require improvement.



The analysis may consider:



\- Current skill distribution.

\- Proficiency distribution.

\- Practical experience.

\- Departmental academic objectives.

\- Industry-relevant competency requirements.

\- Existing curriculum coverage, where available.



Identified gaps must be supported by measurable analytical observations.



\## 2.7 Recommendation Engine



The application shall generate recommendations based on identified departmental skill gaps.



Supported recommendation categories include:



\- Technical workshops.

\- Specialized bootcamps.

\- Certification programs.

\- Industry-oriented training.

\- Seminars.

\- Practical laboratory sessions.

\- Interdisciplinary learning programs.



Each recommendation should include:



\- Identified skill gap.

\- Target department.

\- Number and proportion of affected students.

\- Recommended development activity.

\- Target proficiency level.

\- Reason for recommendation.

\- Expected learning outcome.

\- Suggested priority.



The initial recommendation engine shall use explainable, configurable rules.



\## 2.8 Department and Institutional Dashboards



The application shall provide interactive dashboards according to user permissions.



\*\*HOD Dashboard\*\*



\- Departmental skill distribution.

\- Proficiency analysis.

\- Identified skill gaps.

\- Development recommendations.

\- Departmental analytical reports.



\*\*Dean Dashboard\*\*



\- Consolidated departmental analytics.

\- Authorized department comparisons.

\- Common institutional skill gaps.

\- Recommended development initiatives.

\- Review and prioritization of proposals.

\- Export management.



\*\*Student Interface\*\*



\- Assessment form access.

\- Submission confirmation.

\- Assessment submission status.



\## 2.9 Export and Offline Preservation



The application shall support two export modes.



\### A. Reports-Only Export



The user can download analytical reports containing:



\- Executive summary.

\- Departmental analytics.

\- Skill distribution.

\- Proficiency statistics.

\- Identified competency gaps.

\- Development recommendations.

\- Analysis methodology.



Supported formats:



\- PDF.

\- Excel.

\- CSV.



\### B. Complete Analysis Package



The user can download a complete package containing:



\- Original uploaded dataset, where applicable.

\- Normalized student-skill records.

\- Departmental analytical results.

\- Proficiency analysis.

\- Skill gap analysis.

\- Recommendation data.

\- Generated reports.

\- Analysis metadata.



The package shall be generated as a ZIP archive.



Identifiable student information must be excluded from reports-only exports by default, with appropriate access controls for complete packages.



\---



\# 3. Session and Data Management Scope



SSIP shall follow a stateless, session-based processing architecture.



\## 3.1 Temporary Data Processing



\- Student submissions shall be collected within authorized assessment sessions.

\- Uploaded datasets shall be processed in temporary application memory.

\- Analysis results shall remain available during the active session.

\- Separate sessions shall maintain isolated data contexts.



\## 3.2 Session Management



The application shall support:



\- Session creation.

\- Session identification.

\- Session access control.

\- Session status management.

\- Session expiration.

\- Temporary data cleanup.



\## 3.3 Data Retention



The platform shall not maintain permanent student-skill records.



Temporary datasets and generated server-side files must be removed according to the defined session expiration and cleanup policies.



Downloaded files shall remain under the control of the authorized recipient.



\## 3.4 Recovery Limitations



The initial system shall not guarantee recovery of in-memory analysis sessions after an unexpected server restart.



Any future recovery mechanism must preserve the approved temporary-data retention policy and must not silently introduce permanent student-data storage.



\---



\# 4. User Scope and Responsibilities



| User | Scope of access |

|---|---|

| Student | Submit skill assessment information |

| Faculty / Mentor | Review and validate student submissions where authorized |

| HOD | Analyse assigned department and propose development initiatives |

| Dean | Review authorized departmental analytics and approve institutional initiatives |

| Admin | Configure application settings, taxonomy and access permissions |



Access to data and functionality must be governed by role-based authorization.



\---



\# 5. Out of Scope



The following capabilities are excluded from the initial release.



\## 5.1 Permanent Student Data Management



\- Permanent student skill profile storage.

\- Permanent student-skill relationship database.

\- Long-term centralized student assessment history.

\- Automatic historical comparison using permanently retained assessment records.



\## 5.2 Individual Career Recommendation



\- Personalized career path planning.

\- Individual job recommendations.

\- Automated placement matching.

\- Personalized course recommendation systems.



The primary objective is departmental intelligence rather than individual career guidance.



\## 5.3 Learning and Event Management



\- Online course delivery.

\- Learning Management System functionality.

\- Event registration.

\- Attendance management.

\- Certificate issuance.

\- Workshop scheduling and execution management.



The platform may recommend development activities but will not initially manage their complete execution lifecycle.



\## 5.4 Autonomous Institutional Decisions



\- Automatic budget allocation.

\- Automatic approval of development programs.

\- Autonomous student competency certification.

\- Automatic changes to university curriculum.

\- Unreviewed AI-generated institutional decisions.



Final institutional decisions remain with authorized university officials.



\## 5.5 Advanced AI Capabilities



\- Autonomous AI decision-making.

\- Unverified AI-based proficiency classification.

\- Predictive student performance scoring.

\- Automated industry demand forecasting.



These may be considered in future releases after establishing reliable analytical foundations.



\---



\# 6. Project Objectives



\## 6.1 Primary Objectives



1\. Establish a unified student skill collection mechanism.

2\. Support both structured student submissions and bulk dataset uploads.

3\. Generate accurate departmental skill distribution analysis.

4\. Identify common and underdeveloped competencies.

5\. Generate explainable departmental development recommendations.

6\. Provide interactive analytical dashboards to academic leadership.

7\. Support offline preservation through multiple export options.

8\. Protect student information through temporary processing and controlled data retention.



\## 6.2 Technical Objectives



1\. Develop a responsive browser-accessible web application.

2\. Implement a React and TypeScript frontend.

3\. Implement a FastAPI backend.

4\. Build a modular data processing architecture.

5\. Implement temporary session management.

6\. Develop a configurable skill taxonomy.

7\. Build a rule-based recommendation engine.

8\. Implement secure Excel and CSV processing.

9\. Support PDF, Excel, CSV and ZIP exports.

10\. Deploy the application using Docker and a production web server.



\## 6.3 Institutional Objectives



1\. Improve departmental competency visibility.

2\. Support evidence-based training decisions.

3\. Identify common skill deficiencies across departments.

4\. Improve the relevance of university development initiatives.

5\. Enable structured participation of HODs and Deans.

6\. Improve alignment between academic development and industry requirements.



\---



\# 7. Success Criteria



The initial release shall be evaluated against the following criteria.



| Area | Success condition |

|---|---|

| Student assessment | Students can submit structured skill information |

| Bulk ingestion | Excel and CSV files are processed successfully |

| Validation | Invalid and duplicate records are identified |

| Normalization | Both input sources produce a common data structure |

| Classification | Skills receive valid proficiency classifications |

| Department analysis | Department-level analytics are generated |

| Gap analysis | Common competency deficiencies are identified |

| Recommendations | Relevant development suggestions are generated |

| Dashboard | Authorized users can access their analytical views |

| Export | Both export modes generate valid downloadable files |

| Session management | Temporary data is isolated and expires correctly |

| Privacy | Student assessment data is not permanently retained on the server |

| Deployment | Application is accessible through its production website |



\---



\# 8. Scope Constraints and Dependencies



The successful implementation of SSIP depends on:



\- Availability of accurate student assessment information.

\- Consistent department identification.

\- A standardized skill taxonomy.

\- Defined proficiency classification criteria.

\- Appropriate evidence and validation mechanisms.

\- Clearly established institutional access permissions.

\- Reliable internet connectivity for the live website.

\- Adequate server resources for concurrent analysis sessions.



The quality of the generated recommendations will depend on the quality of the input data and the relevance of the configured analysis criteria.



\---



\# 9. Scope Change Management



Any functionality outside the defined scope must undergo review before implementation.



Proposed changes should document:



\- Description of the requested functionality.

\- Reason for introducing the change.

\- Affected modules.

\- Technical implications.

\- Security and privacy implications.

\- Resource requirements.

\- Approval status.



Approved changes must be reflected in the relevant technical documentation and CHANGELOG.md.



\---



\# 10. Final Scope Declaration



The Student Skill Intelligence Platform is primarily a departmental skill intelligence and institutional development recommendation system.



Its responsibility is to transform temporary student skill information into structured departmental insights and actionable development recommendations.



The platform will collect, validate, analyse, visualize and export information while avoiding permanent storage of student skill assessment records.



Its success will be measured by the accuracy of its analysis, relevance of its recommendations, usability of its dashboards and effectiveness in supporting university-level student development planning.



\---



\*\*End of SCOPE\_AND\_OBJECTIVES.md\*\*

