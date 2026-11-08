\# PROJECT OVERVIEW

\## Student Skill Intelligence Platform (SSIP)



\*\*Document:\*\* PROJECT\_OVERVIEW.md  

\*\*Version:\*\* 1.0  

\*\*Status:\*\* Initial Development Specification  

\*\*Architecture:\*\* Stateless, Session-Based Web Application  

\*\*Backend:\*\* FastAPI  

\*\*Frontend:\*\* React + TypeScript  

\*\*Deployment Direction:\*\* Vercel + BigRock VPS



\---



\## 1. Project Introduction



The Student Skill Intelligence Platform (SSIP) is a web-based university intelligence system designed to collect, process, analyse and interpret student skill information across academic departments.



The platform identifies departmental competency distributions, evaluates proficiency levels, discovers common skill gaps and generates recommendations for institutional skill development initiatives.



Instead of maintaining a permanent database of student skill records, SSIP follows a stateless, session-based processing architecture. Student information is temporarily processed in application memory, and the resulting analysis is presented through an interactive dashboard.



Authorized university officials can download either analytical reports or a complete analysis package for offline preservation.



The platform aims to support evidence-based decisions by Heads of Departments (HODs) and Deans regarding workshops, technical training, certification programs, bootcamps and other student development initiatives.



\## 2. Vision



To establish a university-level skill intelligence platform that transforms student competency information into actionable departmental insights and supports strategic planning of student development programs.



\## 3. Mission



\- Centralize the collection and analysis of student skill information without establishing a permanent student-skill database.

\- Identify competency patterns across academic departments.

\- Evaluate student proficiency distributions.

\- Detect common and emerging skill deficiencies.

\- Recommend relevant departmental development initiatives.

\- Support HODs and Deans through interactive analytical dashboards.

\- Enable offline preservation of analysis results through controlled exports.

\- Maintain student data privacy through temporary processing and defined session expiration.



\## 4. Problem Statement



Universities often lack a centralized mechanism to understand the collective skill capabilities of students across their academic departments.



Student competencies are acquired through academic coursework, independent learning, projects, internships, certifications, workshops and practical experiences. However, this information is frequently scattered across different sources or remains undocumented.



Consequently, university administrators and academic leadership face difficulties in:



\- Understanding departmental skill distributions.

\- Identifying proficiency deficiencies.

\- Recognizing common competency gaps.

\- Determining suitable technical development programs.

\- Aligning student capabilities with evolving industry requirements.

\- Prioritizing institutional training investments.



SSIP addresses these challenges by providing a structured data collection, analysis and recommendation workflow.



\## 5. Primary Objectives



1\. Provide structured student skill assessment forms.

2\. Support bulk student skill data uploads through Excel and CSV.

3\. Normalize and validate information from multiple input sources.

4\. Analyse skill distributions across departments.

5\. Classify student proficiency using a defined competency framework.

6\. Identify common departmental skill gaps.

7\. Generate explainable recommendations for development programs.

8\. Provide interactive dashboards for HODs and Deans.

9\. Support reports-only and complete analysis package downloads.

10\. Automatically clear temporary student assessment data after the defined session lifecycle.



\## 6. Core Product Concept



SSIP operates through three independent architectural layers.



\### 6.1 Data Collection Layer



Collects student skill information through two supported channels:



\*\*A. Student Skill Assessment\*\*



Students submit structured information covering:



\- Technical skills.

\- Domain-specific knowledge.

\- Tools and technologies.

\- Professional competencies.

\- Projects and practical experience.

\- Internships.

\- Certifications.



\*\*B. Bulk Dataset Upload\*\*



Authorized university officials can upload existing student skill datasets through:



\- Excel (.xlsx)

\- CSV (.csv)



Both channels must produce a common internal data structure.



\### 6.2 Intelligence Layer



The intelligence engine processes the collected information and performs:



\- Data validation.

\- Skill normalization.

\- Department-wise aggregation.

\- Proficiency distribution analysis.

\- Competency gap identification.

\- Skill relationship analysis.

\- Development opportunity identification.

\- Program recommendation generation.



Recommendations must be explainable and supported by the underlying analysis.



\### 6.3 Decision and Export Layer



The application presents analytical results through a live dashboard.



HODs can review departmental insights and identify development requirements.



Deans can evaluate recommendations, prioritize institutional initiatives and download analytical outputs.



The platform provides two export options:



\*\*Reports-only package\*\*

\- Executive summary.

\- Departmental reports.

\- Skill distribution.

\- Proficiency analysis.

\- Competency gaps.

\- Development recommendations.



\*\*Complete analysis package\*\*

\- Original uploaded dataset, where applicable.

\- Normalized records.

\- Analytical results.

\- Department-wise summaries.

\- Recommendation details.

\- Generated reports.

\- Analysis metadata and methodology.



\## 7. User Roles



| Role | Primary responsibility |

|---|---|

| Student | Submit skill assessment information |

| Faculty / Mentor | Review and validate student skill submissions |

| HOD | Analyse departmental competency information and propose development initiatives |

| Dean | Review university-level insights and approve development initiatives |

| Admin | Configure application access, taxonomy and system settings |



Access must follow the university's organizational hierarchy.



HODs must be restricted to their authorized departmental scope. Deans must have access to the departments under their authorized institutional scope.



\## 8. Core Functional Modules



| Module | Responsibility |

|---|---|

| Authentication | Secure application access |

| Assessment Management | Student skill collection sessions |

| File Ingestion | Excel and CSV uploads |

| Data Validation | Validate and clean incoming records |

| Data Normalization | Standardize skill and department information |

| Session Management | Manage temporary analysis sessions |

| Skill Taxonomy | Maintain standardized skill classifications |

| Proficiency Analysis | Evaluate competency distributions |

| Department Intelligence | Generate departmental analytical insights |

| Skill Gap Analysis | Identify underdeveloped competencies |

| Recommendation Engine | Recommend development initiatives |

| Dashboard | Present interactive analytics |

| Export Engine | Generate downloadable reports and packages |

| Session Cleanup | Remove expired temporary data |



\## 9. Architectural Philosophy



SSIP follows a stateless, session-based architecture.



The application must not maintain a permanent database of student skill assessment records.



The primary architectural principles are:



\### 9.1 Temporary Data Processing



Student information is loaded into temporary application memory for validation, processing and analysis.



\### 9.2 Session Isolation



Every collection or analysis session must have an isolated data context.



One department's analysis must not be accessible to unauthorized users or other departmental sessions.



\### 9.3 No Permanent Student-Skill Repository



The platform does not require persistent student profiles or student-skill relationship tables.



\### 9.4 User-Controlled Offline Preservation



Authorized users can download analysis results in supported formats.



The application does not automatically convert exported reports into permanent server-side records.



\### 9.5 Automatic Cleanup



Temporary datasets and generated files must be removed according to the configured session expiration and cleanup policies.



\### 9.6 Explainable Intelligence



Recommendations must include supporting observations, identified gaps and reasoning.



The initial recommendation engine should use configurable, rule-based logic rather than opaque AI-generated decisions.



\## 10. Technology Stack



| Layer | Technology |

|---|---|

| Frontend | React + TypeScript |

| Build Tool | Vite |

| Styling | Tailwind CSS |

| UI Components | shadcn/ui |

| Charts | Recharts |

| Backend | Python + FastAPI |

| Data Processing | Pandas + NumPy |

| Excel Processing | OpenPyXL |

| PDF Generation | ReportLab |

| Package Generation | Python ZIP utilities |

| Session Processing | In-memory session manager |

| Optional Ephemeral Storage | Redis with TTL |

| Deployment | Docker + Docker Compose |

| Reverse Proxy | Nginx |

| Frontend Hosting | Vercel |

| Backend Hosting | BigRock VPS |

| Version Control | Git + GitHub |



PostgreSQL is not required for student assessment records. Persistent authentication or application configuration storage, if needed, must remain separate from the temporary assessment datasets.



\## 11. Deployment Philosophy



SSIP is intended to operate as a live, browser-accessible web application.



The proposed deployment architecture is:



\- Vercel hosts the React frontend.

\- BigRock VPS hosts the FastAPI backend.

\- Nginx manages reverse proxy and HTTPS.

\- Docker provides application isolation and deployment consistency.

\- Temporary session processing occurs on the backend.

\- Redis may be introduced if cross-worker or multi-instance session management requires it.



The system must support secure access by students, faculty, HODs and Deans through the university's authorized web interface.



\## 12. Privacy and Security Principles



The application must follow privacy-by-design principles.



Requirements include:



\- Secure authentication.

\- Role-based access control.

\- Department-level access restrictions.

\- Secure file upload validation.

\- Session isolation.

\- Protected temporary processing.

\- Restricted application logging.

\- Secure report generation and downloads.

\- Automatic temporary data cleanup.

\- Defined session expiration policies.



Raw student assessment information must not be written into persistent application logs or retained unnecessarily.



Downloaded analysis packages are under the control of the authorized recipient and must be handled according to university data governance policies.



\## 13. Project Scope



\### Included in Initial Scope



\- Student skill assessment forms.

\- Dean/HOD-authorized assessment collection sessions.

\- Excel and CSV ingestion.

\- Data validation and normalization.

\- Skill categorization.

\- Proficiency classification.

\- Department-wise analytical dashboards.

\- Skill gap analysis.

\- Development program recommendations.

\- HOD and Dean review interfaces.

\- Reports-only downloads.

\- Complete analysis package downloads.

\- Temporary session management.

\- Automatic session cleanup.

\- Live website deployment.



\### Excluded from Initial Scope



\- Permanent storage of student skill profiles.

\- Permanent student-skill databases.

\- Individual student career recommendation systems.

\- Automatic enrollment into development programs.

\- Event registration and attendance management.

\- Learning Management System functionality.

\- Automated institutional budget allocation.

\- Unsupervised AI decisions regarding student competency.



These exclusions may be reconsidered through future development decisions.



\## 14. Expected Outcomes



SSIP is expected to provide:



1\. Better visibility into departmental student competencies.

2\. Structured identification of skill deficiencies.

3\. Data-supported development program recommendations.

4\. Improved decision-making by academic leadership.

5\. Reduced dependence on informal departmental observations.

6\. Flexible analysis and offline reporting.

7\. Better alignment between academic development initiatives and industry requirements.



\## 15. Future Expansion Possibilities



Potential future capabilities include:



\- Industry skill demand integration.

\- Curriculum-to-skill gap mapping.

\- Interdepartmental competency comparisons.

\- Historical analysis through user-managed offline datasets.

\- AI-assisted interpretation of departmental trends.

\- Program effectiveness assessment.

\- Integration with existing university ERP modules.



These capabilities must not compromise the stateless architecture without an explicit architectural decision.



\## 16. Development Principles



All development activities must follow these principles:



1\. Build the application incrementally.

2\. Maintain separation between frontend, backend and business logic.

3\. Keep data collection independent of analysis logic.

4\. Maintain a unified internal data structure for all input sources.

5\. Keep recommendation logic explainable and testable.

6\. Never use hardcoded statistics as actual dashboard data.

7\. Enforce authorization on the backend.

8\. Implement session isolation and expiration.

9\. Test data cleanup and export functionality.

10\. Update technical documentation whenever architectural decisions change.



\## 17. Definition of Project Success



The initial release will be considered successful when:



\- Students can submit skill assessments through the live website.

\- Authorized officials can upload Excel and CSV datasets.

\- The application validates and normalizes collected data.

\- Department-wise skill analytics are generated correctly.

\- Proficiency distributions and competency gaps are identifiable.

\- Development recommendations are generated with supporting explanations.

\- HODs and Deans can access their authorized dashboards.

\- Both export options work correctly.

\- Temporary student assessment information is cleared according to the session policy.

\- The application is securely accessible through its production domain.



\---



\*\*End of PROJECT\_OVERVIEW.md\*\*

