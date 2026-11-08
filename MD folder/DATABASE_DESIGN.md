\# DATABASE\_DESIGN.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Database Design  

\*\*Backend:\*\* FastAPI  

\*\*ORM:\*\* SQLAlchemy (if relational persistence is selected)  

\*\*Migration Tool:\*\* Alembic (if relational persistence is selected)  

\*\*Temporary Storage:\*\* In-memory prototype / Redis with TTL  

\*\*Persistent Database:\*\* PostgreSQL (proposed for approved persistent entities)



\---



\## 1. Purpose



This document defines the database and storage architecture of SSIP.



It establishes:



\- Persistent data entities.

\- Temporary data entities.

\- Entity relationships.

\- Database boundaries.

\- Storage responsibilities.

\- Data lifecycle rules.

\- Proposed schemas.

\- Indexing strategy.

\- Data access patterns.

\- Retention and deletion requirements.

\- Database security requirements.



The primary objective is to ensure that the platform can support institutional skill intelligence without permanently storing student skill assessment records.



\## 2. Database Design Principles



The database architecture follows these principles:



1\. Student assessment records must not be permanently stored.

2\. Persistent platform configuration must be separated from temporary assessment data.

3\. Authentication and authorization records must be logically independent of assessment records.

4\. Skill taxonomy must support hierarchical and many-to-many relationships.

5\. Proficiency criteria must support versioning.

6\. Recommendation rules must support controlled configuration and versioning.

7\. Temporary data must have explicit expiry.

8\. Every temporary dataset must belong to an assessment session.

9\. Export files must follow their own retention policy.

10\. Database access must be controlled through backend services.

11\. Data deletion must cover all temporary storage locations.

12\. The architecture must support both in-memory development and shared temporary storage in production.



\## 3. Storage Architecture



SSIP uses three storage categories.



\### 3.1 Persistent configuration storage



Stores information required for the long-term operation of the platform.



Examples:



\- User accounts.

\- Roles.

\- Permissions.

\- Department references.

\- Skill taxonomy.

\- Proficiency framework configuration.

\- Recommendation rules.

\- Platform settings.



These records are not student skill assessment records.



\### 3.2 Temporary assessment storage



Stores information required to process an active assessment session.



Examples:



\- Student submissions.

\- Uploaded datasets.

\- Normalized records.

\- Validation results.

\- Analytical outputs.

\- Skill-gap results.

\- Recommendations.

\- Temporary session metadata.



These records must be deleted according to the approved retention policy.



\### 3.3 Temporary export storage



Stores generated reports and downloadable packages.



Examples:



\- PDF reports.

\- Excel reports.

\- CSV files.

\- ZIP analysis packages.

\- Export manifests.



Export files have their own expiry policy. Their retention relationship with the originating assessment session remains an open decision.



\## 4. High-Level Storage Architecture



```text

SSIP STORAGE ARCHITECTURE

│

├── Persistent Configuration Database

│   │

│   ├── Users

│   ├── Roles

│   ├── Permissions

│   ├── Departments

│   ├── Skill Domains

│   ├── Skill Categories

│   ├── Skills

│   ├── Department Skill Mapping

│   ├── Proficiency Frameworks

│   ├── Recommendation Rules

│   └── Platform Settings

│

├── Temporary Assessment Storage

│   │

│   ├── Assessment Sessions

│   ├── Student Submissions

│   ├── Uploaded Datasets

│   ├── Normalized Records

│   ├── Validation Results

│   ├── Analysis Results

│   ├── Skill Gaps

│   └── Recommendations

│

└── Temporary Export Storage

&#x20;   │

&#x20;   ├── PDF Reports

&#x20;   ├── Excel Reports

&#x20;   ├── CSV Reports

&#x20;   ├── ZIP Packages

&#x20;   └── Export Metadata

```



The diagram represents logical storage boundaries. Temporary data may be distributed across Redis, application memory, and a protected filesystem.



\## 5. Persistent Database Design



PostgreSQL is the proposed relational database for persistent entities.



The following tables form the proposed persistent schema.



\### 5.1 Users



Stores platform user identity and account information.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| user\_id | UUID | Primary key | Unique user identifier |

| username | VARCHAR(100) | Unique, nullable if SSO | Login identifier |

| email | VARCHAR(255) | Unique where available | User email |

| password\_hash | TEXT | Nullable for SSO | Password hash |

| full\_name | VARCHAR(200) | Not null | User display name |

| account\_status | VARCHAR(30) | Not null | Active, Disabled, Pending |

| auth\_provider | VARCHAR(50) | Not null | Local or institutional SSO |

| created\_at | TIMESTAMP | Not null | Account creation time |

| updated\_at | TIMESTAMP | Not null | Last account update |



Security requirements:



\- Never store plaintext passwords.

\- Password hashes must use an approved password-hashing algorithm.

\- Authentication secrets must not be included in API responses.

\- Account status must be checked during authentication.



\### 5.2 Roles



Defines platform roles.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| role\_id | UUID | Primary key | Unique role identifier |

| role\_name | VARCHAR(50) | Unique, not null | Role name |

| description | TEXT | Nullable | Role description |

| is\_system\_role | BOOLEAN | Default true | Indicates protected system role |

| created\_at | TIMESTAMP | Not null | Creation timestamp |



Initial roles:



\- Administrator

\- Dean

\- HOD

\- Student



\### 5.3 User Roles



Associates users with roles.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| user\_role\_id | UUID | Primary key | Unique assignment identifier |

| user\_id | UUID | Foreign key | Associated user |

| role\_id | UUID | Foreign key | Assigned role |

| department\_id | UUID | Nullable foreign key | Department scope, where applicable |

| assigned\_by | UUID | Nullable foreign key | Assigning administrator |

| assigned\_at | TIMESTAMP | Not null | Assignment timestamp |

| is\_active | BOOLEAN | Default true | Assignment status |



A user may have more than one role if institutional governance permits it.



Department scope must be enforced by the authorization layer.



\### 5.4 Permissions



Defines available platform permissions.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| permission\_id | UUID | Primary key | Permission identifier |

| permission\_code | VARCHAR(120) | Unique, not null | Permission key |

| description | TEXT | Nullable | Permission description |

| module\_name | VARCHAR(80) | Not null | Associated module |



Example permissions:



\- `session.create`

\- `session.view`

\- `assessment.submit`

\- `analysis.view\_department`

\- `analysis.view\_institution`

\- `recommendation.view`

\- `proposal.create`

\- `proposal.approve`

\- `export.generate`

\- `taxonomy.manage`



\### 5.5 Role Permissions



Maps permissions to roles.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| role\_permission\_id | UUID | Primary key | Assignment identifier |

| role\_id | UUID | Foreign key | Role reference |

| permission\_id | UUID | Foreign key | Permission reference |

| created\_at | TIMESTAMP | Not null | Assignment timestamp |



Unique constraint:



`(role\_id, permission\_id)`



The backend must apply additional department and resource-scope checks where required.



\### 5.6 Departments



Stores institutional department references.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| department\_id | UUID | Primary key | Department identifier |

| department\_code | VARCHAR(50) | Unique, not null | Department code |

| department\_name | VARCHAR(200) | Not null | Department name |

| school\_name | VARCHAR(200) | Nullable | Associated school |

| is\_active | BOOLEAN | Default true | Department status |

| created\_at | TIMESTAMP | Not null | Creation timestamp |

| updated\_at | TIMESTAMP | Not null | Last update |



Department records represent institutional structure, not assessment records.



The final department hierarchy must be validated with the university.



\## 6. Skill Taxonomy Tables



The taxonomy is persistent configuration used by both assessment collection and analytical processing.



\### 6.1 Skill Domains



| Field | Data type | Constraints | Description |

|---|---|---|---|

| domain\_id | UUID | Primary key | Domain identifier |

| domain\_code | VARCHAR(80) | Unique, not null | Domain code |

| domain\_name | VARCHAR(200) | Not null | Domain name |

| description | TEXT | Nullable | Domain description |

| taxonomy\_version\_id | UUID | Foreign key | Taxonomy version |

| is\_active | BOOLEAN | Default true | Domain status |



\### 6.2 Skill Categories



| Field | Data type | Constraints | Description |

|---|---|---|---|

| category\_id | UUID | Primary key | Category identifier |

| domain\_id | UUID | Foreign key | Parent domain |

| category\_code | VARCHAR(80) | Not null | Category code |

| category\_name | VARCHAR(200) | Not null | Category name |

| description | TEXT | Nullable | Category description |

| is\_active | BOOLEAN | Default true | Category status |



Unique constraint:



`(domain\_id, category\_code)`



\### 6.3 Skills



| Field | Data type | Constraints | Description |

|---|---|---|---|

| skill\_id | UUID | Primary key | Skill identifier |

| category\_id | UUID | Foreign key | Parent category |

| skill\_code | VARCHAR(100) | Unique, not null | Canonical skill code |

| skill\_name | VARCHAR(200) | Not null | Canonical skill name |

| description | TEXT | Nullable | Skill description |

| is\_active | BOOLEAN | Default true | Skill status |

| created\_at | TIMESTAMP | Not null | Creation timestamp |



A skill belongs to a primary category in the taxonomy. Additional relationships can be represented separately where needed.



\### 6.4 Skill Aliases



Supports different names for the same canonical skill.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| alias\_id | UUID | Primary key | Alias identifier |

| skill\_id | UUID | Foreign key | Canonical skill |

| alias\_name | VARCHAR(200) | Not null | Alternative name |

| normalized\_alias | VARCHAR(200) | Not null | Normalized lookup value |



Example:



| Canonical skill | Alias |

|---|---|

| JavaScript | JS |

| PostgreSQL | Postgres |

| Amazon Web Services | AWS |



Alias resolution must not automatically merge distinct technologies merely because their names look similar.



\### 6.5 Department Skill Mapping



Defines the relevance of skills to departments.



| Field | Data type | Constraints | Description |

|---|---|---|---|

| mapping\_id | UUID | Primary key | Mapping identifier |

| department\_id | UUID | Foreign key | Department |

| skill\_id | UUID | Foreign key | Skill |

| relevance\_type | VARCHAR(30) | Not null | Core, Recommended, Specialized, Optional |

| justification | TEXT | Nullable | Academic justification |

| taxonomy\_version\_id | UUID | Foreign key | Applicable taxonomy version |



Unique constraint:



`(department\_id, skill\_id, taxonomy\_version\_id)`



This relationship is many-to-many.



A skill may be relevant to multiple departments, and each department may have many relevant skills.



\## 7. Configuration and Versioning Tables



\### 7.1 Taxonomy Versions



| Field | Data type | Constraints | Description |

|---|---|---|---|

| taxonomy\_version\_id | UUID | Primary key | Version identifier |

| version\_number | VARCHAR(30) | Unique, not null | Version label |

| description | TEXT | Nullable | Version description |

| status | VARCHAR(30) | Not null | Draft, Active, Retired |

| created\_by | UUID | Foreign key | Creator |

| created\_at | TIMESTAMP | Not null | Creation timestamp |

| activated\_at | TIMESTAMP | Nullable | Activation timestamp |



Taxonomy versions provide traceability when skill names, categories, or mappings change.



\### 7.2 Proficiency Frameworks



| Field | Data type | Constraints | Description |

|---|---|---|---|

| framework\_id | UUID | Primary key | Framework identifier |

| version\_number | VARCHAR(30) | Not null | Framework version |

| framework\_name | VARCHAR(150) | Not null | Framework name |

| beginner\_min | DECIMAL(5,2) | Nullable | Beginner lower boundary |

| beginner\_max | DECIMAL(5,2) | Nullable | Beginner upper boundary |

| intermediate\_min | DECIMAL(5,2) | Nullable | Intermediate lower boundary |

| intermediate\_max | DECIMAL(5,2) | Nullable | Intermediate upper boundary |

| expert\_min | DECIMAL(5,2) | Nullable | Expert lower boundary |

| status | VARCHAR(30) | Not null | Draft, Active, Retired |

| created\_at | TIMESTAMP | Not null | Creation timestamp |



The numerical boundaries are provisional.



The final model may need additional configuration for evidence requirements, assessment dimensions, weighting, and classification rules.



\### 7.3 Recommendation Rule Sets



| Field | Data type | Constraints | Description |

|---|---|---|---|

| rule\_set\_id | UUID | Primary key | Rule-set identifier |

| version\_number | VARCHAR(30) | Not null | Rule version |

| rule\_set\_name | VARCHAR(150) | Not null | Rule-set name |

| status | VARCHAR(30) | Not null | Draft, Active, Retired |

| created\_by | UUID | Foreign key | Creator |

| created\_at | TIMESTAMP | Not null | Creation timestamp |



\### 7.4 Recommendation Rules



| Field | Data type | Constraints | Description |

|---|---|---|---|

| rule\_id | UUID | Primary key | Rule identifier |

| rule\_set\_id | UUID | Foreign key | Parent rule set |

| rule\_code | VARCHAR(100) | Not null | Rule identifier |

| rule\_name | VARCHAR(200) | Not null | Rule name |

| condition\_config | JSONB | Not null | Rule conditions |

| action\_config | JSONB | Not null | Recommendation output |

| priority | VARCHAR(30) | Not null | Priority classification |

| is\_active | BOOLEAN | Default true | Rule status |



The JSONB configuration must be schema-validated by the application. Arbitrary executable code must not be stored or evaluated as recommendation rules.



\### 7.5 Platform Settings



| Field | Data type | Constraints | Description |

|---|---|---|---|

| setting\_id | UUID | Primary key | Setting identifier |

| setting\_key | VARCHAR(150) | Unique, not null | Configuration key |

| setting\_value | JSONB | Not null | Configuration value |

| description | TEXT | Nullable | Setting description |

| updated\_by | UUID | Foreign key | Last editor |

| updated\_at | TIMESTAMP | Not null | Update timestamp |



Secrets, passwords, and cryptographic keys must not be stored as ordinary application settings.



\## 8. Temporary Assessment Data Model



Temporary assessment data must not be created as permanent relational tables in the persistent configuration database.



The following entities describe the logical temporary data model.



They may be represented through Redis keys, in-memory objects, or another approved temporary storage implementation.



\### 8.1 Assessment Session



Represents a temporary assessment workspace.



| Field | Data type | Description |

|---|---|---|

| session\_id | UUID | Unique session identifier |

| session\_name | STRING | Session name |

| session\_type | ENUM | Form, Upload, Combined |

| created\_by | UUID | User who created the session |

| department\_scope | ARRAY | Authorized department references |

| session\_status | ENUM | Current lifecycle status |

| collection\_start | DATETIME | Collection opening time |

| collection\_deadline | DATETIME | Collection deadline |

| session\_expires\_at | DATETIME | Session access expiry |

| retention\_expires\_at | DATETIME | Temporary data expiry |

| taxonomy\_version\_id | UUID | Taxonomy version used |

| framework\_id | UUID | Proficiency framework used |

| rule\_set\_id | UUID | Recommendation rules used |

| created\_at | DATETIME | Creation time |



The session metadata must not be treated as a permanent student assessment record.



The exact fields retained in persistent operational audit metadata, if any, require separate approval.



\### 8.2 Assessment Submission



Represents one student's assessment submission within a session.



| Field | Data type | Description |

|---|---|---|

| submission\_id | UUID | Unique submission identifier |

| session\_id | UUID | Parent session |

| student\_reference | STRING | Temporary student reference |

| department\_id | UUID | Department |

| submission\_source | ENUM | Form or Upload |

| submission\_status | ENUM | Received, Validated, Rejected |

| submitted\_at | DATETIME | Submission time |

| revision\_number | INTEGER | Submission revision |



The student reference must be handled as sensitive temporary data.



The platform must not create a permanent student-skill profile from this entity.



\### 8.3 Assessment Skill Record



Represents a skill declared or assessed in a submission.



| Field | Data type | Description |

|---|---|---|

| record\_id | UUID | Unique record identifier |

| submission\_id | UUID | Parent submission |

| skill\_id | UUID | Canonical skill |

| proficiency\_input | STRING | Submitted proficiency |

| evidence\_source | ENUM | Self-reported, Assessment, Project, Certification, Faculty |

| evidence\_status | ENUM | Evidence status |

| assessment\_score | DECIMAL | Optional score |

| classified\_level | ENUM | Beginner, Intermediate, Expert, Unclassified |



A submission may contain multiple skill records.



\### 8.4 Uploaded Dataset



Represents a temporary uploaded file.



| Field | Data type | Description |

|---|---|---|

| upload\_id | UUID | Upload identifier |

| session\_id | UUID | Associated session |

| uploaded\_by | UUID | Uploading user |

| original\_filename | STRING | Original filename metadata |

| storage\_key | STRING | Protected temporary storage reference |

| file\_format | STRING | CSV or XLSX |

| file\_size | INTEGER | File size |

| validation\_status | ENUM | Pending, Valid, Invalid |

| uploaded\_at | DATETIME | Upload timestamp |

| expires\_at | DATETIME | Expiry time |



The actual file must be stored outside publicly accessible directories.



\### 8.5 Validation Result



| Field | Data type | Description |

|---|---|---|

| validation\_id | UUID | Validation identifier |

| session\_id | UUID | Parent session |

| upload\_id | UUID | Related upload, if applicable |

| total\_rows | INTEGER | Number of rows processed |

| valid\_rows | INTEGER | Number of valid rows |

| invalid\_rows | INTEGER | Number of invalid rows |

| validation\_errors | ARRAY | Row-level validation errors |

| validation\_status | ENUM | Processing, Completed, Failed |

| created\_at | DATETIME | Creation timestamp |



Validation details may contain student information and must follow the same retention policy as the underlying dataset.



\### 8.6 Normalized Dataset



Contains the common internal representation produced by form and upload ingestion.



Conceptual structure:



```json

{

&#x20; "session\_id": "uuid",

&#x20; "submission\_id": "uuid",

&#x20; "student\_reference": "temporary-reference",

&#x20; "department\_id": "uuid",

&#x20; "skills": \[

&#x20;   {

&#x20;     "skill\_id": "uuid",

&#x20;     "proficiency\_input": "Intermediate",

&#x20;     "evidence\_source": "Self-Reported",

&#x20;     "evidence\_status": "Self-Reported"

&#x20;   }

&#x20; ]

}

```



The exact schema must be implemented using validated Pydantic models.



This dataset is temporary and must be deleted on expiry.



\## 9. Temporary Analytical Data Model



\### 9.1 Analysis Snapshot



Represents the result of processing one assessment dataset revision.



| Field | Data type | Description |

|---|---|---|

| analysis\_id | UUID | Analysis identifier |

| session\_id | UUID | Parent session |

| dataset\_revision | INTEGER | Source dataset revision |

| analysis\_revision | INTEGER | Analysis revision |

| taxonomy\_version\_id | UUID | Taxonomy version |

| framework\_id | UUID | Proficiency framework |

| rule\_set\_id | UUID | Recommendation rule version |

| processing\_status | ENUM | Queued, Processing, Completed, Failed |

| started\_at | DATETIME | Processing start |

| completed\_at | DATETIME | Processing completion |

| expires\_at | DATETIME | Expiry time |



\### 9.2 Skill Distribution Result



| Field | Data type | Description |

|---|---|---|

| result\_id | UUID | Result identifier |

| analysis\_id | UUID | Parent analysis |

| department\_id | UUID | Department |

| skill\_id | UUID | Skill |

| student\_count | INTEGER | Count of students with the skill |

| eligible\_population | INTEGER | Eligible population |

| coverage\_percentage | DECIMAL | Calculated coverage |



\### 9.3 Proficiency Distribution Result



| Field | Data type | Description |

|---|---|---|

| result\_id | UUID | Result identifier |

| analysis\_id | UUID | Parent analysis |

| department\_id | UUID | Department |

| skill\_id | UUID | Skill |

| beginner\_count | INTEGER | Beginner count |

| intermediate\_count | INTEGER | Intermediate count |

| expert\_count | INTEGER | Expert count |

| unclassified\_count | INTEGER | Unclassified count |



\### 9.4 Skill Gap Result



| Field | Data type | Description |

|---|---|---|

| gap\_id | UUID | Gap identifier |

| analysis\_id | UUID | Parent analysis |

| department\_id | UUID | Department |

| skill\_id | UUID | Related skill |

| gap\_type | ENUM | Coverage, Proficiency, Practical, Evidence, etc. |

| current\_value | DECIMAL | Actual measured value |

| target\_value | DECIMAL | Approved target, if available |

| gap\_value | DECIMAL | Calculated difference |

| priority | ENUM | Configured priority |

| explanation | STRING | Explanation of identified gap |



\### 9.5 Recommendation Result



| Field | Data type | Description |

|---|---|---|

| recommendation\_id | UUID | Recommendation identifier |

| analysis\_id | UUID | Parent analysis |

| gap\_id | UUID | Related skill gap |

| recommendation\_type | ENUM | Workshop, Bootcamp, Lab, etc. |

| title | STRING | Recommendation title |

| explanation | STRING | Reason for recommendation |

| priority | ENUM | Critical, High, Medium, Low |

| rule\_id | UUID | Source rule |



These analytical entities are temporary.



They must not be silently copied into persistent tables.



\## 10. Temporary Export Data Model



\### 10.1 Export Job



| Field | Data type | Description |

|---|---|---|

| export\_id | UUID | Export identifier |

| session\_id | UUID | Source session |

| analysis\_id | UUID | Source analysis |

| requested\_by | UUID | Requesting user |

| export\_mode | ENUM | Reports-only, Complete package |

| export\_format | ENUM | PDF, XLSX, CSV, ZIP |

| export\_status | ENUM | Requested, Processing, Ready, Failed, Expired |

| includes\_identifiable\_data | BOOLEAN | Whether identifiable information is included |

| storage\_key | STRING | Protected file reference |

| created\_at | DATETIME | Request timestamp |

| expires\_at | DATETIME | Export expiry |



\### 10.2 Export File



| Field | Data type | Description |

|---|---|---|

| file\_id | UUID | File identifier |

| export\_id | UUID | Parent export |

| filename | STRING | Generated filename |

| content\_type | STRING | MIME type |

| file\_size | INTEGER | File size |

| checksum\_sha256 | STRING | File integrity checksum |

| created\_at | DATETIME | Creation time |

| expires\_at | DATETIME | Expiry time |



The export job metadata and generated files must follow the approved export retention policy.



\## 11. Governance Data Model



Governance records require a separate persistence decision.



The platform must distinguish temporary analytical information from institutional decisions.



Potential entities:



\### 11.1 Initiative Proposal



| Field | Data type | Description |

|---|---|---|

| proposal\_id | UUID | Proposal identifier |

| session\_id | UUID | Source session reference |

| analysis\_id | UUID | Source analysis reference |

| department\_id | UUID | Proposing department |

| proposed\_by | UUID | HOD or authorized proposer |

| proposal\_title | VARCHAR(200) | Proposal title |

| proposal\_description | TEXT | Initiative description |

| proposal\_status | VARCHAR(40) | Workflow status |

| created\_at | TIMESTAMP | Proposal creation |

| updated\_at | TIMESTAMP | Last update |



\### 11.2 Proposal Decision



| Field | Data type | Description |

|---|---|---|

| decision\_id | UUID | Decision identifier |

| proposal\_id | UUID | Parent proposal |

| decided\_by | UUID | Dean or authorized decision-maker |

| decision\_type | VARCHAR(40) | Approved, Rejected, Changes Requested, Deferred |

| comments | TEXT | Decision comments |

| decided\_at | TIMESTAMP | Decision timestamp |



\### 11.3 Persistence rule



These tables must not be implemented in the persistent database until the university approves the governance retention model.



Two possible approaches:



\*\*Option A — Temporary governance\*\*



\- Proposals remain within the assessment session.

\- Decisions are temporary.

\- Records expire with the relevant retention policy.

\- No long-term institutional decision history.



\*\*Option B — Persistent governance\*\*



\- Proposal and decision records remain available after assessment-session expiry.

\- Student assessment records remain temporary.

\- Long-term governance records retain only approved decision information and necessary references.

\- They must not contain copied student-level assessment datasets or unrestricted analysis snapshots.



Option B requires a defined policy for what happens when the source assessment session expires. Persistent governance records must not create an indirect permanent archive of student skill data.



\## 12. Entity Relationship Overview



\### 12.1 Persistent entities



```text

USERS

&#x20; |

&#x20; +----< USER\_ROLES >---- ROLES

&#x20; |                         |

&#x20; |                         +----< ROLE\_PERMISSIONS >---- PERMISSIONS

&#x20; |

&#x20; +---- DEPARTMENTS



DEPARTMENTS

&#x20; |

&#x20; +----< DEPARTMENT\_SKILL\_MAPPING >---- SKILLS

&#x20;                                          |

&#x20;                                          +---- SKILL\_CATEGORIES

&#x20;                                                   |

&#x20;                                                   +---- SKILL\_DOMAINS



SKILLS

&#x20; |

&#x20; +----< SKILL\_ALIASES



TAXONOMY\_VERSIONS

&#x20; |

&#x20; +---- SKILL\_DOMAINS

&#x20; +---- DEPARTMENT\_SKILL\_MAPPING



PROFICIENCY\_FRAMEWORKS



RECOMMENDATION\_RULE\_SETS

&#x20; |

&#x20; +----< RECOMMENDATION\_RULES



PLATFORM\_SETTINGS

```



\### 12.2 Temporary entities



```text

ASSESSMENT\_SESSION

&#x20; |

&#x20; +----< ASSESSMENT\_SUBMISSIONS

&#x20; |          |

&#x20; |          +----< ASSESSMENT\_SKILL\_RECORDS

&#x20; |

&#x20; +----< UPLOADED\_DATASETS

&#x20; |

&#x20; +----< VALIDATION\_RESULTS

&#x20; |

&#x20; +----< ANALYSIS\_SNAPSHOTS

&#x20;            |

&#x20;            +----< SKILL\_DISTRIBUTION\_RESULTS

&#x20;            |

&#x20;            +----< PROFICIENCY\_DISTRIBUTION\_RESULTS

&#x20;            |

&#x20;            +----< SKILL\_GAP\_RESULTS

&#x20;            |

&#x20;            +----< RECOMMENDATION\_RESULTS

&#x20;            |

&#x20;            +----< EXPORT\_JOBS

&#x20;                       |

&#x20;                       +----< EXPORT\_FILES

```



The diagrams describe logical relationships, not a requirement to implement all temporary entities as relational tables.



\## 13. Storage Key Design



If Redis is selected, keys must use predictable namespaces.



Examples:



```text

ssip:session:{session\_id}

ssip:session:{session\_id}:submissions

ssip:session:{session\_id}:uploads

ssip:session:{session\_id}:validation

ssip:session:{session\_id}:normalized

ssip:session:{session\_id}:analysis:{analysis\_id}

ssip:session:{session\_id}:gaps:{analysis\_id}

ssip:session:{session\_id}:recommendations:{analysis\_id}

ssip:export:{export\_id}

ssip:job:{job\_id}

```



Requirements:



\- Every temporary key must have an explicit TTL.

\- Related keys must be discoverable for cleanup.

\- Expiry must not rely exclusively on key naming.

\- Session cleanup must remove associated temporary keys.

\- Redis persistence must be disabled for prohibited assessment data.

\- Keys must not contain student names, roll numbers, or other direct identifiers.



Redis data structures and key relationships must be designed so that partial expiry cannot leave accessible orphaned records.



\## 14. Indexing Strategy



Indexes should be applied to persistent relational tables based on expected query patterns.



Proposed indexes:



| Table | Index |

|---|---|

| Users | Unique username |

| Users | Unique email where available |

| User Roles | user\_id |

| User Roles | role\_id |

| Departments | department\_code |

| Skill Domains | domain\_code |

| Skill Categories | domain\_id |

| Skills | skill\_code |

| Skills | category\_id |

| Skill Aliases | normalized\_alias |

| Department Skill Mapping | department\_id, skill\_id |

| Recommendation Rules | rule\_set\_id |

| Taxonomy Versions | version\_number |



Use unique constraints for identifiers and relationships that must not be duplicated.



For temporary data, indexes and access patterns depend on the selected Redis structures or in-memory repository implementation.



Avoid adding indexes without a demonstrated query requirement.



\## 15. Data Integrity Constraints



The database and backend must enforce:



\- Unique user identifiers.

\- Unique role names.

\- Valid foreign-key relationships.

\- Unique skill codes.

\- Valid taxonomy hierarchy.

\- Unique department-skill mappings per version.

\- Valid proficiency framework boundaries.

\- Unique rule codes within a rule set.

\- Valid session references.

\- Valid analysis references.

\- Valid export references.



Temporary entities must also be checked for:

\- Session ownership.

\- Session expiry.

\- Revision consistency.

\- Valid taxonomy version.

\- Valid framework version.

\- Valid analysis snapshot.



Database constraints alone cannot enforce every temporary-storage rule. Backend service validation remains mandatory.



\## 16. Data Versioning and Reproducibility



Every analysis must identify the configuration versions used.



Required references:



\- Dataset revision.

\- Analysis revision.

\- Taxonomy version.

\- Proficiency framework version.

\- Recommendation rule-set version.



If the taxonomy or proficiency configuration changes during an active session, existing analysis results must not silently change meaning.



Reprocessing must explicitly identify which configuration version is being used.



\## 17. Data Lifecycle



\### 17.1 Assessment lifecycle



```text

Session Created

&#x20;     |

&#x20;     v

Assessment Data Received

&#x20;     |

&#x20;     v

Temporary Storage

&#x20;     |

&#x20;     v

Validation and Normalization

&#x20;     |

&#x20;     v

Analysis

&#x20;     |

&#x20;     v

Skill Gap Calculation

&#x20;     |

&#x20;     v

Recommendation Generation

&#x20;     |

&#x20;     v

Dashboard and Export

&#x20;     |

&#x20;     v

Retention Period Ends

&#x20;     |

&#x20;     v

Cleanup

&#x20;     |

&#x20;     v

Temporary Data Deleted

```



\### 17.2 Data deletion requirements



Cleanup must cover:



\- Session data.

\- Student submissions.

\- Skill records.

\- Original uploaded files.

\- Normalized records.

\- Validation results.

\- Analytical outputs.

\- Skill gaps.

\- Recommendations.

\- Temporary job state.

\- Export files according to export policy.



Deleting a session metadata key without deleting its associated data is insufficient.



\### 17.3 Deletion verification



The cleanup service should:



1\. Identify expired sessions.

2\. Identify all associated temporary resources.

3\. Delete associated data.

4\. Verify deletion where the storage system permits.

5\. Record a non-sensitive cleanup result.

6\. Retry failures safely.

7\. Raise an operational alert if retention requirements are not met.



Logs must not retain copies of deleted student assessment information.



\## 18. Database Security



Persistent database requirements:



\- Restrict network access.

\- Use dedicated database credentials.

\- Apply least-privilege database roles.

\- Encrypt network connections.

\- Protect database secrets.

\- Restrict administrative access.

\- Maintain permitted configuration backups.

\- Audit privileged configuration changes.



Temporary storage requirements:



\- Isolate Redis and filesystem storage.

\- Disable prohibited persistence.

\- Apply TTL.

\- Restrict access.

\- Exclude prohibited data from backups.

\- Protect temporary files.

\- Prevent public access.



Application requirements:



\- Do not expose database identifiers unnecessarily.

\- Validate all input.

\- Avoid raw SQL construction from untrusted input.

\- Use parameterized queries.

\- Apply resource-level authorization.

\- Never return password hashes or secret configuration.



\## 19. ORM and Migration Strategy



SQLAlchemy is proposed for persistent relational entities.



Alembic is proposed for schema migrations.



Requirements:



\- Models must reflect the approved persistent schema.

\- Migrations must be version-controlled.

\- Schema changes must be reviewed.

\- Migrations must be tested in staging.

\- Production migrations must have a recovery plan.

\- Persistent configuration migrations must not introduce permanent assessment storage.



Temporary Redis or in-memory data structures do not require relational database migrations, but their schema contracts must be versioned and tested.



\## 20. Database Testing Requirements



The database implementation must be tested for:



\- Foreign-key integrity.

\- Unique constraints.

\- Invalid relationships.

\- Role and permission assignments.

\- Taxonomy hierarchy.

\- Department-skill mapping.

\- Configuration versioning.

\- Concurrent access.

\- Temporary data expiry.

\- Cleanup completeness.

\- Export metadata expiry.

\- Backup exclusion.

\- Access isolation.



Tests must verify that no prohibited student assessment data is written to persistent tables.



\## 21. Proposed Implementation Phases



\### Phase 1 — Persistent schema



Implement:

\- Users.

\- Roles.

\- User roles.

\- Permissions.

\- Role permissions.

\- Departments.

\- Skill taxonomy.

\- Department-skill mapping.



\### Phase 2 — Configuration management



Implement:

\- Taxonomy versions.

\- Proficiency frameworks.

\- Recommendation rule sets.

\- Recommendation rules.

\- Platform settings.



\### Phase 3 — Temporary storage



Implement:

\- Session repository.

\- Assessment repository.

\- Upload repository.

\- Validation storage.

\- Normalized dataset storage.

\- Analysis storage.

\- Skill-gap storage.

\- Recommendation storage.



\### Phase 4 — Export storage



Implement:

\- Export job tracking.

\- Temporary file storage.

\- Manifest generation.

\- Expiry and cleanup.



\### Phase 5 — Governance persistence decision



Confirm whether proposals and Dean decisions must survive session expiry.



Implement the approved model without retaining prohibited student assessment data.



\## 22. Open Architectural Decisions



| Decision | Current proposal |

|---|---|

| Relational database | PostgreSQL for approved persistent entities |

| ORM | SQLAlchemy |

| Migrations | Alembic |

| Temporary prototype storage | In-memory repositories |

| Production shared temporary state | Redis with TTL |

| Redis persistence | Disabled for student assessment data |

| User identity | Persistent user records or institutional SSO |

| Department hierarchy | Requires university validation |

| Governance persistence | Not finalized |

| Audit history retention | Not finalized |

| Export retention | Independent policy; not finalized |

| Student identifier | Temporary reference; exact format to be approved |

| Taxonomy versioning | Persistent versioned configuration |

| Proficiency versioning | Persistent versioned configuration |

| Recommendation rule versioning | Persistent versioned configuration |



\## 23. Definition of Completion



The database design is considered implemented when:



1\. Persistent and temporary storage are separated.

2\. Persistent configuration entities are implemented.

3\. Relationships and constraints are enforced.

4\. Skill taxonomy supports domain, category, and skill hierarchy.

5\. Department-skill mapping supports many-to-many relationships.

6\. Proficiency and recommendation configurations are versioned.

7\. Assessment data is processed through temporary repositories.

8\. Redis TTL and cleanup work correctly if Redis is deployed.

9\. Uploaded and generated files are protected.

10\. Temporary analytical outputs are deleted according to policy.

11\. Export files follow their own retention policy.

12\. Governance persistence follows an approved institutional decision.

13\. Database access is restricted and tested.

14\. No permanent student skill assessment database is created.



\---



\*\*End of DATABASE\_DESIGN.md\*\*

