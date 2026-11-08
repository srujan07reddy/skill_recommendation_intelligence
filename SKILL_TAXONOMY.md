\# SKILL\_TAXONOMY.md



\# Student Skill Intelligence Platform (SSIP)



\*\*Document:\*\* Skill Taxonomy and Classification  

\*\*Version:\*\* 1.0  

\*\*Status:\*\* Proposed  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Introduction



The Skill Taxonomy is the centralized classification structure used by the Student Skill Intelligence Platform to identify, organize, and standardize student skills.



Students may describe the same skill using different names, abbreviations, or terminology. Without a standardized classification system, the platform may incorrectly treat equivalent skills as separate competencies.



The taxonomy solves this problem by defining:



\- Skill domains.

\- Skill categories.

\- Individual skills.

\- Skill identifiers.

\- Standardized names.

\- Alternative names and aliases.

\- Skill relationships.

\- Department relevance.

\- Skill status and version information.



The taxonomy is used by assessment forms, bulk uploads, data normalization, skill intelligence, gap analysis, and recommendation services.



\---



\## 2. Objectives



The taxonomy must:



1\. Establish a common vocabulary for skills.

2\. Eliminate inconsistent skill naming.

3\. Organize skills into meaningful categories.

4\. Support multiple academic departments.

5\. Allow skills to belong to relevant domains.

6\. Support skill relationships and prerequisites.

7\. Enable consistent analytics across assessment sessions.

8\. Support future expansion of skill categories.

9\. Allow administrators to maintain skill definitions.

10\. Provide a stable reference for recommendation rules.



\---



\## 3. Taxonomy Hierarchy



The taxonomy follows a hierarchical classification structure.



```text

Skill Taxonomy

│

├── Domain

│   │

│   ├── Category

│   │   │

│   │   ├── Skill

│   │   ├── Skill

│   │   └── Skill

│   │

│   └── Category

│       ├── Skill

│       └── Skill

│

└── Domain

&#x20;   │

&#x20;   └── Category

&#x20;       ├── Skill

&#x20;       └── Skill

```



\### 3.1 Domain



A broad area of knowledge or professional competency.



Examples:



\- Computer Science.

\- Cybersecurity.

\- Cloud Computing.

\- Artificial Intelligence.

\- Data Science.

\- Electronics.

\- Business and Management.



\### 3.2 Category



A specialized grouping within a domain.



Examples:



\- Programming.

\- Operating Systems.

\- Network Security.

\- Cloud Infrastructure.

\- Machine Learning.

\- Database Management.



\### 3.3 Skill



An individual competency that can be assessed or reported.



Examples:



\- Python.

\- Linux Administration.

\- Network Scanning.

\- AWS.

\- Machine Learning.

\- SQL.



A skill must have a unique identifier and a standardized name.



\---



\## 4. Proposed Initial Skill Taxonomy



The following taxonomy is a proposed starting structure for institutional skill assessment. It is not an exhaustive list of every possible academic or professional skill.



\### 4.1 Programming and Software Development



<text>Domain ID: DOM-001</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-001 | Programming Languages | Python, Java, C, C++, JavaScript, TypeScript, Go, Rust |

| CAT-002 | Web Development | HTML, CSS, React, Angular, Vue.js, Node.js, FastAPI, Django |

| CAT-003 | Backend Development | REST API Development, Authentication, API Integration, Microservices |

| CAT-004 | Software Engineering | Object-Oriented Programming, Data Structures, Algorithms, Design Patterns |

| CAT-005 | Version Control | Git, GitHub, GitLab |

| CAT-006 | Software Testing | Unit Testing, Integration Testing, Automation Testing, API Testing |



\### 4.2 Operating Systems and Infrastructure



<text>Domain ID: DOM-002</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-007 | Operating Systems | Linux, Windows, macOS |

| CAT-008 | System Administration | Linux Administration, Windows Server Administration, User Management |

| CAT-009 | Virtualization | VirtualBox, VMware, KVM |

| CAT-010 | Infrastructure Management | Server Management, Storage Management, System Monitoring |

| CAT-011 | Shell and Automation | Bash, PowerShell, Shell Scripting |



\### 4.3 Networking and Communication



<text>Domain ID: DOM-003</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-012 | Networking Fundamentals | TCP/IP, OSI Model, Subnetting, Routing, Switching |

| CAT-013 | Network Services | DNS, DHCP, HTTP, HTTPS, SSH |

| CAT-014 | Network Infrastructure | VLANs, Firewalls, VPN, Load Balancing |

| CAT-015 | Network Monitoring | Wireshark, Packet Analysis, Network Troubleshooting |

| CAT-016 | Network Automation | Network Scripting, Network Configuration Automation |



\### 4.4 Cybersecurity



<text>Domain ID: DOM-004</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-017 | Security Fundamentals | Security Principles, CIA Triad, Risk Assessment |

| CAT-018 | Network Security | Firewall Configuration, IDS, IPS, Network Segmentation |

| CAT-019 | Web Application Security | OWASP Top 10, SQL Injection Testing, XSS Testing, CSRF Testing |

| CAT-020 | Penetration Testing | Nmap, Burp Suite, Metasploit, Vulnerability Assessment |

| CAT-021 | Digital Forensics | Disk Forensics, Memory Forensics, Log Analysis |

| CAT-022 | Security Operations | SIEM, Incident Response, Threat Detection, Security Monitoring |

| CAT-023 | Identity and Access Management | IAM, RBAC, MFA, Privileged Access Management |

| CAT-024 | Cryptography | Encryption, Hashing, Digital Signatures, Key Management |

| CAT-025 | Application Security | Secure Coding, SAST, DAST, Software Supply Chain Security |



\### 4.5 Cloud Computing and Cloud Security



<text>Domain ID: DOM-005</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-026 | Cloud Fundamentals | Cloud Architecture, IaaS, PaaS, SaaS |

| CAT-027 | Cloud Platforms | AWS, Microsoft Azure, Google Cloud |

| CAT-028 | Cloud Infrastructure | Virtual Machines, Object Storage, Virtual Networks |

| CAT-029 | Cloud Security | Cloud IAM, Cloud Network Security, Cloud Security Monitoring |

| CAT-030 | Cloud Operations | Cloud Monitoring, Cloud Cost Management, Infrastructure Management |

| CAT-031 | Infrastructure as Code | Terraform, Ansible, CloudFormation |



\### 4.6 DevOps and Containerization



<text>Domain ID: DOM-006</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-032 | Containerization | Docker, Container Management, Container Networking |

| CAT-033 | Orchestration | Kubernetes, Helm |

| CAT-034 | CI/CD | GitHub Actions, Jenkins, GitLab CI/CD |

| CAT-035 | DevSecOps | Pipeline Security, Container Security, Dependency Scanning |

| CAT-036 | Infrastructure Automation | Configuration Management, Deployment Automation |

| CAT-037 | Observability | Logging, Metrics, Distributed Tracing, Prometheus, Grafana |



\### 4.7 Artificial Intelligence and Machine Learning



<text>Domain ID: DOM-007</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-038 | AI Fundamentals | Artificial Intelligence Fundamentals, Intelligent Systems |

| CAT-039 | Machine Learning | Supervised Learning, Unsupervised Learning, Model Evaluation |

| CAT-040 | Deep Learning | Neural Networks, CNN, RNN, Transformers |

| CAT-041 | Natural Language Processing | Tokenization, Text Classification, Language Modeling |

| CAT-042 | Generative AI | Prompt Engineering, Generative Models, Retrieval-Augmented Generation |

| CAT-043 | LLM Engineering | LLM APIs, Fine-Tuning, Embeddings, Vector Databases, Agent Development |

| CAT-044 | AI Infrastructure | Model Deployment, Model Serving, GPU Computing |



\### 4.8 AI Security



<text>Domain ID: DOM-008</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-045 | AI Security Fundamentals | AI Risk Assessment, AI Threat Modeling |

| CAT-046 | LLM Security | Prompt Injection Defense, Data Leakage Prevention, Output Validation |

| CAT-047 | Model Security | Model Integrity, Model Theft Prevention, Adversarial Robustness |

| CAT-048 | AI Application Security | RAG Security, Agent Security, Tool Permission Management |

| CAT-049 | AI Governance | AI Risk Management, AI Privacy, Responsible AI |



\### 4.9 Data Science and Analytics



<text>Domain ID: DOM-009</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-050 | Data Analysis | Data Cleaning, Exploratory Data Analysis, Statistical Analysis |

| CAT-051 | Data Visualization | Matplotlib, Power BI, Tableau |

| CAT-052 | Data Engineering | ETL, Data Pipelines, Apache Spark |

| CAT-053 | Database Management | SQL, PostgreSQL, MySQL, MongoDB |

| CAT-054 | Big Data | Hadoop, HDFS, MapReduce, Apache Kafka |



\### 4.10 Electronics and Embedded Systems



<text>Domain ID: DOM-010</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-055 | Digital Electronics | Digital Logic Design, Microprocessors |

| CAT-056 | Embedded Programming | Embedded C, Microcontroller Programming |

| CAT-057 | IoT | IoT Architecture, MQTT, Sensor Integration |

| CAT-058 | Hardware Design | PCB Design, FPGA Fundamentals |



\### 4.11 Business and Management



<text>Domain ID: DOM-011</text>



| Category ID | Category | Skills |

|---|---|---|

| CAT-059 | Business Analytics | Business Intelligence, Data Interpretation |

| CAT-060 | Project Management | Agile, Scrum, Project Planning |

| CAT-061 | Entrepreneurship | Business Modeling, Product Strategy |

| CAT-062 | Communication | Technical Writing, Presentation Skills, Professional Communication |

| CAT-063 | Leadership and Collaboration | Team Management, Collaboration, Decision-Making |



\---



\## 5. Skill Identification Structure



Each skill must have a standardized identity.



\### 5.1 Skill Record



Illustrative structure:



```json

{

&#x20; "skill\_id": "SKL-0001",

&#x20; "skill\_name": "Python",

&#x20; "canonical\_name": "Python",

&#x20; "domain\_id": "DOM-001",

&#x20; "category\_id": "CAT-001",

&#x20; "description": "Programming language used for general-purpose software development and automation.",

&#x20; "aliases": \[

&#x20;   "Python Programming",

&#x20;   "Python Language"

&#x20; ],

&#x20; "status": "active",

&#x20; "version": 1

}

```



\### 5.2 Required Fields



| Field | Description |

|---|---|

| skill\_id | Unique skill identifier |

| skill\_name | Display name |

| canonical\_name | Standardized skill name |

| domain\_id | Associated domain |

| category\_id | Primary category |

| description | Skill definition |

| aliases | Alternative names |

| status | Active, deprecated, or inactive |

| version | Taxonomy version |



\### 5.3 Optional Fields



| Field | Description |

|---|---|

| related\_skills | Related competencies |

| prerequisite\_skills | Foundational competencies |

| department\_relevance | Relevant academic departments |

| assessment\_method | Suggested evaluation method |

| tags | Search and filtering labels |

| external\_reference | External framework or standard reference |



\---



\## 6. Skill Naming and Standardization Rules



\### 6.1 Canonical Naming



Every skill must have one canonical name.



Examples:



| Input | Canonical Name |

|---|---|

| Python Programming | Python |

| PYTHON | Python |

| Python Language | Python |

| Linux OS | Linux |

| AWS Cloud | AWS |

| Amazon Web Services | AWS |



\### 6.2 Alias Management



Aliases are alternative terms that refer to the same skill.



The normalization engine must:



1\. Receive the submitted skill name.

2\. Normalize whitespace and formatting.

3\. Check canonical names.

4\. Check approved aliases.

5\. Map the input to the corresponding skill identifier.

6\. Flag unknown values for review.



Aliases must not be used to merge skills that are technically different.



For example:



\- Java and JavaScript are separate skills.

\- AWS and Azure are separate skills.

\- Machine Learning and Deep Learning are related but distinct skills.



\### 6.3 Unknown Skills



When a submitted skill is not present in the taxonomy:



\- Mark it as an unknown skill.

\- Preserve the original submitted term within the temporary session.

\- Prevent automatic assignment to an unrelated category.

\- Allow authorized review.

\- Add it to the taxonomy only after validation and approval.



This prevents incorrect normalization from corrupting analytics.



\---



\## 7. Skill Relationships



Skills may have relationships beyond the domain/category hierarchy.



\### 7.1 Relationship Types



| Relationship | Meaning | Example |

|---|---|---|

| Prerequisite | One skill provides a foundation for another | Networking Fundamentals → Network Security |

| Related | Skills are closely associated | Python → Data Analysis |

| Specialization | One skill represents a specialized area of another | Cloud Computing → Cloud Security |

| Alternative | Skills provide alternative ways to perform a competency | PostgreSQL → MySQL |

| Part Of | A skill belongs to a broader competency | SQL → Database Management |



The relationship direction must be explicitly defined for each relationship type.



\### 7.2 Example Relationship Graph



```mermaid

flowchart TD

&#x20;   A\[Programming Fundamentals]

&#x20;   B\[Python]

&#x20;   C\[Data Structures]

&#x20;   D\[Machine Learning]

&#x20;   E\[Deep Learning]

&#x20;   F\[LLM Engineering]



&#x20;   A --> B

&#x20;   A --> C

&#x20;   B --> D

&#x20;   C --> D

&#x20;   D --> E

&#x20;   E --> F

```



This is an illustrative relationship graph, not a mandatory learning sequence.



A relationship does not automatically mean that a student must master one skill before reporting another.



\---



\## 8. Department-Skill Mapping



Not every skill has equal relevance to every department.



The taxonomy should support department-level relevance mappings.



Illustrative mapping:



| Department | Relevant Skill Domains |

|---|---|

| Computer Science and Engineering | Programming, Software Development, AI, Data Science |

| Cybersecurity | Security, Networking, Linux, Cloud Security, AI Security |

| Information Technology | Programming, Networking, Cloud, DevOps, Data Science |

| Electronics and Communication | Electronics, Embedded Systems, IoT, Programming |

| Mechanical Engineering | CAD, Manufacturing, Simulation, Programming |

| Electrical Engineering | Power Systems, Embedded Systems, Automation |

| Business and Management | Business Analytics, Project Management, Communication |



These are examples only. Actual mappings must be approved by the relevant academic departments.



\### 8.1 Relevance Classification



Department relevance may be classified as:



\- Core: Essential competency for the department.

\- Recommended: Useful supporting competency.

\- Specialized: Relevant to specific electives or specialization tracks.

\- Optional: Additional competency with potential value.



A skill may be relevant to multiple departments.



The taxonomy must therefore support many-to-many department-skill relationships.



\---



\## 9. Proficiency Classification



The taxonomy identifies skills, while the proficiency model classifies the level of competency.



Initial proficiency levels:



| Level | Name | General Meaning |

|---|---|---|

| 1 | Beginner | Basic familiarity with the skill |

| 2 | Intermediate | Ability to perform common tasks independently |

| 3 | Expert | Advanced practical understanding and application |



\### 9.1 Evidence Classification



Proficiency information must include its source.



| Evidence Type | Description |

|---|---|

| Self-Reported | Student declares their proficiency |

| Assessment-Based | Result derived from a structured assessment |

| Project-Based | Supported by project evidence |

| Certification-Based | Supported by a relevant certification |

| Faculty-Verified | Reviewed by an authorized faculty member |



Evidence types should not be treated as interchangeable.



\### 9.2 Important Distinction



A student selecting Expert in a form does not establish independently verified expertise.



The system must preserve the distinction between:



\- Claimed proficiency.

\- Assessed proficiency.

\- Evidence-supported proficiency.



Detailed proficiency calculation rules belong in `PROFICIENCY\_FRAMEWORK.md`.



\---



\## 10. Taxonomy Versioning



The taxonomy must support controlled changes.



\### 10.1 Why Versioning Is Required



Taxonomy changes can affect:



\- Historical analytical results.

\- Skill mappings.

\- Department comparisons.

\- Recommendation rules.

\- Exported analysis packages.



If a skill is renamed or moved, the platform must be able to identify which taxonomy version was used in a session.



\### 10.2 Versioning Rules



\- Every taxonomy release must have a version.

\- New skills must receive unique identifiers.

\- Existing identifiers must not be reused.

\- Deprecated skills must retain their historical identity.

\- Aliases must be version-controlled.

\- Relationship changes must be traceable.

\- Active assessment sessions should use a consistent taxonomy version.



\### 10.3 Skill Status



| Status | Meaning |

|---|---|

| Active | Available for new assessments |

| Deprecated | No longer recommended for new assessments but retained for historical interpretation |

| Inactive | Not available for new assessments |

| Pending Review | Awaiting taxonomy approval |



A deprecated skill should not be silently deleted when historical analysis may depend on it.



\---



\## 11. Taxonomy Administration



The Administrator is responsible for maintaining the approved taxonomy, subject to institutional governance.



\### 11.1 Administrative Operations



\- Create domains.

\- Create categories.

\- Add skills.

\- Edit skill descriptions.

\- Add aliases.

\- Configure relationships.

\- Map skills to departments.

\- Deprecate skills.

\- Review unknown skill submissions.

\- Publish taxonomy versions.



\### 11.2 Approval Considerations



Changes affecting academic competency definitions should be reviewed by appropriate institutional stakeholders.



For example:



\- Department representatives validate domain relevance.

\- Subject experts validate technical skill definitions.

\- Administrators manage approved taxonomy publication.



The exact approval workflow should be defined in the platform governance policy.



\---



\## 12. Taxonomy Storage Model



The taxonomy is configuration data and may be persistently stored.



It is separate from temporary student assessment datasets.



Proposed logical entities:



| Entity | Purpose |

|---|---|

| SkillDomain | Stores broad skill domains |

| SkillCategory | Stores categories within domains |

| Skill | Stores canonical skill definitions |

| SkillAlias | Stores alternative names |

| SkillRelationship | Stores relationships between skills |

| DepartmentSkillMapping | Maps skills to departments |

| TaxonomyVersion | Tracks taxonomy releases |



\### 12.1 Logical Relationship



```mermaid

erDiagram

&#x20;   SKILL\_DOMAIN ||--o{ SKILL\_CATEGORY : contains

&#x20;   SKILL\_CATEGORY ||--o{ SKILL : contains

&#x20;   SKILL ||--o{ SKILL\_ALIAS : has

&#x20;   SKILL ||--o{ SKILL\_RELATIONSHIP : relates

&#x20;   SKILL ||--o{ DEPARTMENT\_SKILL\_MAPPING : mapped\_to

&#x20;   SKILL\_DOMAIN ||--o{ TAXONOMY\_VERSION : governed\_by

```



The relationship model is logical. The final relational schema, constraints, and indexes must be defined in `DATABASE\_DESIGN.md`.



\---



\## 13. Taxonomy API Responsibilities



Proposed API endpoints:



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/api/skills/domains` | Retrieve domains |

| GET | `/api/skills/categories` | Retrieve categories |

| GET | `/api/skills` | Retrieve skills |

| GET | `/api/skills/{skill\_id}` | Retrieve skill details |

| GET | `/api/skills/search` | Search canonical names and aliases |

| GET | `/api/skills/{skill\_id}/relationships` | Retrieve skill relationships |

| GET | `/api/skills/departments/{department\_id}` | Retrieve department-relevant skills |

| POST | `/api/admin/skills` | Create a skill |

| PATCH | `/api/admin/skills/{skill\_id}` | Update a skill |

| POST | `/api/admin/skills/{skill\_id}/aliases` | Add an alias |

| POST | `/api/admin/taxonomy/publish` | Publish a taxonomy version |



Administrative endpoints must enforce backend authorization.



The complete API contracts belong in `API\_DOCUMENTATION.md`.



\---



\## 14. Integration With Other SSIP Modules



| Module | Taxonomy Usage |

|---|---|

| Student Assessment | Displays approved skills |

| Bulk Upload | Maps uploaded skill names |

| Validation | Checks whether submitted skills are recognized |

| Normalization | Converts aliases into canonical skill identifiers |

| Session Management | Associates sessions with a taxonomy version |

| Proficiency Analysis | Groups proficiency results by skill |

| Department Analytics | Aggregates skills by category and domain |

| Skill Gap Analysis | Compares relevant skills against targets |

| Recommendation Engine | Uses skill relationships and categories |

| HOD Dashboard | Displays departmental skill information |

| Dean Dashboard | Displays institutional skill information |

| Export Module | Includes taxonomy version and skill identifiers in metadata |



\---



\## 15. Quality and Governance Rules



The taxonomy must satisfy the following requirements:



1\. Every active skill must have a unique identifier.

2\. Every skill must have one canonical name.

3\. Every skill must belong to an approved primary category.

4\. Aliases must not create duplicate skill identities.

5\. Related skills must remain distinct where their competencies differ.

6\. Department relevance must be configurable.

7\. Skill relationships must have defined semantics.

8\. Unknown skills must be flagged for review.

9\. Taxonomy changes must be versioned.

10\. Historical skill identifiers must not be reused.

11\. Taxonomy updates must not silently rewrite existing analysis snapshots.

12\. Only authorized administrators may publish taxonomy changes.



\---



\## 16. Future Expansion



Potential future taxonomy extensions include:



\- Industry competency frameworks.

\- Certification mapping.

\- Job-role competency mapping.

\- Academic curriculum mapping.

\- Skill demand mapping.

\- Emerging technology tracking.

\- Cross-domain competency mapping.

\- Institution-specific skill frameworks.



These extensions should be introduced only when the institution has a defined use case and reliable source data.



\---



\## 17. Open Decisions



| ID | Decision | Impact |

|---|---|---|

| TAX-OD-001 | Which departments and academic programs must be supported initially? | Defines taxonomy coverage |

| TAX-OD-002 | Who approves new skill definitions? | Defines governance |

| TAX-OD-003 | Should students select from a fixed list or request new skills? | Affects assessment UX |

| TAX-OD-004 | Should one skill belong to multiple primary categories? | Affects taxonomy structure |

| TAX-OD-005 | Which proficiency framework will be adopted? | Affects proficiency analysis |

| TAX-OD-006 | Which industry or certification frameworks should be mapped? | Affects external alignment |

| TAX-OD-007 | How often will taxonomy versions be published? | Affects change management |

| TAX-OD-008 | Should department relevance be approved by HODs or a central committee? | Affects institutional governance |



\---



\## 18. Final Summary



The Skill Taxonomy establishes the standardized vocabulary used throughout SSIP.



It organizes skills into domains and categories, maintains canonical names and aliases, defines relationships, and supports department-level relevance.



It enables the platform to convert inconsistent student-submitted information into consistent institutional skill intelligence.



\*\*Core taxonomy principle:\*\*



> Define skills consistently. Classify them meaningfully. Preserve their relationships. Version every controlled change.

