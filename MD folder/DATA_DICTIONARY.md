\# DATA\_DICTIONARY.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Data Specification  

\*\*Database:\*\* PostgreSQL for approved persistent entities  

\*\*Temporary Storage:\*\* In-memory / Redis with TTL  

\*\*Backend:\*\* FastAPI + Pydantic  

\*\*Data Processing:\*\* Pandas + NumPy



\---



\## 1. Purpose



This document defines the data dictionary for the Student Skill Intelligence Platform.



It establishes a common interpretation of data fields across the frontend, backend, storage repositories, analytical engines, and export services.



It defines:



\- Field names.

\- Field descriptions.

\- Data types.

\- Required and optional values.

\- Permitted values.

\- Validation constraints.

\- Relationships.

\- Data sources.

\- Sensitivity classifications.

\- Retention requirements.



The objective is to ensure that every module uses consistent data definitions.



\## 2. Data Dictionary Conventions



\### 2.1 Data type conventions



| Data type | Description | Example |

|---|---|---|

| UUID | Universally unique identifier | `550e8400-e29b-41d4-a716-446655440000` |

| STRING | Variable-length text | `Cybersecurity` |

| VARCHAR(n) | Text with maximum length | `VARCHAR(100)` |

| TEXT | Long-form text | Description |

| INTEGER | Whole number | `150` |

| DECIMAL(p,s) | Fixed-precision decimal | `75.50` |

| BOOLEAN | True or false | `true` |

| DATE | Calendar date | `2026-11-07` |

| DATETIME | Date and time with timezone | `2026-11-07T10:30:00+05:30` |

| ENUM | Value from a predefined set | `ACTIVE` |

| JSON | Structured JSON data | Object or array |

| JSONB | PostgreSQL binary JSON | Configuration object |

| ARRAY | Collection of values | `\["CSV", "XLSX"]` |



\### 2.2 Field properties



\- \*\*Required:\*\* A value must be provided.

\- \*\*Optional:\*\* A value may be omitted.

\- \*\*Nullable:\*\* The field may explicitly contain null.

\- \*\*Unique:\*\* Duplicate values are prohibited within the defined scope.

\- \*\*Default:\*\* Value assigned when no explicit value is provided.

\- \*\*Foreign key:\*\* Reference to another entity.

\- \*\*Temporary:\*\* Must be deleted according to the applicable retention policy.

\- \*\*Persistent:\*\* Retained according to the approved institutional retention policy.



\### 2.3 Naming conventions



\- Database fields use `snake\_case`.

\- Identifiers use descriptive names ending in `\_id`.

\- Timestamps use `\_at`.

\- Boolean fields use meaningful prefixes such as `is\_` or `has\_`.

\- Percentage fields use `\_percentage`.

\- Counts use `\_count`.

\- Configuration versions use `\_version\_id` or `version\_number`.



All timestamps must use timezone-aware values and be stored consistently, preferably in UTC.



\## 3. Data Classification



| Classification | Description | Examples |

|---|---|---|

| Public | Information approved for public visibility | Public platform description |

| Internal | Operational information | Module configuration |

| Confidential | Restricted institutional information | User and governance records |

| Restricted | Sensitive personal or assessment information | Student submissions and identifiable datasets |



Student assessment information is classified as Restricted.



Access must be controlled by backend authorization and data-scope policies.



\## 4. Persistent Entity Dictionary



Persistent entities contain institutional configuration and identity information. They must not contain permanent student skill assessment records.



\### 4.1 Users



\*\*Purpose:\*\* Stores platform account identity.



| Field | Type | Required | Nullable | Constraints / Description |

|---|---|---|---|---|

| user\_id | UUID | Yes | No | Primary key |

| username | VARCHAR(100) | Conditional | Yes | Unique when local username authentication is used |

| email | VARCHAR(255) | Conditional | Yes | Unique where available |

| password\_hash | TEXT | Conditional | Yes | Required only for local password authentication |

| full\_name | VARCHAR(200) | Yes | No | User display name |

| account\_status | ENUM | Yes | No | ACTIVE, DISABLED, PENDING |

| auth\_provider | VARCHAR(50) | Yes | No | LOCAL or approved identity provider |

| created\_at | DATETIME | Yes | No | Account creation timestamp |

| updated\_at | DATETIME | Yes | No | Last modification timestamp |



\*\*Data classification:\*\* Confidential.



\*\*Retention:\*\* Persistent according to institutional account-management policy.



\*\*Validation:\*\*

\- Username must be unique when provided.

\- Email must follow valid email syntax when provided.

\- Password hashes must never be returned through APIs.

\- Disabled accounts must not authenticate.



\### 4.2 Roles



\*\*Purpose:\*\* Defines platform-level roles.



| Field | Type | Required | Nullable | Constraints / Description |

|---|---|---|---|---|

| role\_id | UUID | Yes | No | Primary key |

| role\_name | VARCHAR(50) | Yes | No | Unique role name |

| description | TEXT | No | Yes | Role description |

| is\_system\_role | BOOLEAN | Yes | No | Default true for protected system roles |

| created\_at | DATETIME | Yes | No | Creation timestamp |



Initial permitted role names:



\- ADMINISTRATOR

\- DEAN

\- HOD

\- STUDENT



Role names must use a consistent canonical representation.



\### 4.3 User Roles



\*\*Purpose:\*\* Associates users with roles and optional department scope.



| Field | Type | Required | Nullable | Constraints / Description |

|---|---|---|---|---|

| user\_role\_id | UUID | Yes | No | Primary key |

| user\_id | UUID | Yes | No | Foreign key to Users |

| role\_id | UUID | Yes | No | Foreign key to Roles |

| department\_id | UUID | No | Yes | Department scope |

| assigned\_by | UUID | No | Yes | User who assigned the role |

| assigned\_at | DATETIME | Yes | No | Assignment timestamp |

| is\_active | BOOLEAN | Yes | No | Default true |



\*\*Validation:\*\*

\- Referenced user and role must exist.

\- Department scope must be valid for the assigned role.

\- Duplicate active assignments must be prevented according to the role-assignment policy.



\### 4.4 Permissions



\*\*Purpose:\*\* Defines granular platform permissions.



| Field | Type | Required | Nullable | Constraints / Description |

|---|---|---|---|---|

| permission\_id | UUID | Yes | No | Primary key |

| permission\_code | VARCHAR(120) | Yes | No | Unique permission identifier |

| description | TEXT | No | Yes | Permission explanation |

| module\_name | VARCHAR(80) | Yes | No | Associated module |



Example permission codes:



```text

session.create

session.view

assessment.submit

analysis.view\_department

analysis.view\_institution

recommendation.view

proposal.create

proposal.approve

export.generate

taxonomy.manage

```



\### 4.5 Role Permissions



\*\*Purpose:\*\* Maps permissions to roles.



| Field | Type | Required | Nullable | Constraints / Description |

|---|---|---|---|---|

| role\_permission\_id | UUID | Yes | No | Primary key |

| role\_id | UUID | Yes | No | Foreign key to Roles |

| permission\_id | UUID | Yes | No | Foreign key to Permissions |

| created\_at | DATETIME | Yes | No | Assignment timestamp |



\*\*Constraint:\*\* The combination of `role\_id` and `permission\_id` must be unique.



\### 4.6 Departments



\*\*Purpose:\*\* Stores institutional department references.



| Field | Type | Required | Nullable | Constraints / Description |

|---|---|---|---|---|

| department\_id | UUID | Yes | No | Primary key |

| department\_code | VARCHAR(50) | Yes | No | Unique institutional code |

| department\_name | VARCHAR(200) | Yes | No | Department name |

| school\_name | VARCHAR(200) | No | Yes | Associated school |

| is\_active | BOOLEAN | Yes | No | Default true |

| created\_at | DATETIME | Yes | No | Creation timestamp |

| updated\_at | DATETIME | Yes | No | Last modification timestamp |



The final department and school hierarchy must be validated with the university.



\## 5. Skill Taxonomy Dictionary



\### 5.1 Skill Domains



\*\*Purpose:\*\* Represents top-level skill domains.



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| domain\_id | UUID | Yes | No | Primary key |

| domain\_code | VARCHAR(80) | Yes | No | Unique domain identifier |

| domain\_name | VARCHAR(200) | Yes | No | Domain name |

| description | TEXT | No | Yes | Domain explanation |

| taxonomy\_version\_id | UUID | Yes | No | Associated taxonomy version |

| is\_active | BOOLEAN | Yes | No | Domain availability |



Example domains:



\- Programming and Software Development

\- Operating Systems and Infrastructure

\- Networking and Communication

\- Cybersecurity

\- Cloud Computing and Cloud Security

\- DevOps and Containerization

\- Artificial Intelligence and Machine Learning

\- AI Security

\- Data Science and Analytics

\- Electronics and Embedded Systems

\- Business and Management



This list is a proposed starting taxonomy, not a finalized university standard.



\### 5.2 Skill Categories



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| category\_id | UUID | Yes | No | Primary key |

| domain\_id | UUID | Yes | No | Parent domain |

| category\_code | VARCHAR(80) | Yes | No | Category identifier |

| category\_name | VARCHAR(200) | Yes | No | Category name |

| description | TEXT | No | Yes | Category description |

| is\_active | BOOLEAN | Yes | No | Category availability |



\*\*Constraint:\*\* `(domain\_id, category\_code)` must be unique.



\### 5.3 Skills



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| skill\_id | UUID | Yes | No | Primary key |

| category\_id | UUID | Yes | No | Primary category |

| skill\_code | VARCHAR(100) | Yes | No | Unique canonical identifier |

| skill\_name | VARCHAR(200) | Yes | No | Canonical skill name |

| description | TEXT | No | Yes | Skill description |

| is\_active | BOOLEAN | Yes | No | Skill availability |

| created\_at | DATETIME | Yes | No | Creation timestamp |



\### 5.4 Skill Aliases



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| alias\_id | UUID | Yes | No | Primary key |

| skill\_id | UUID | Yes | No | Canonical skill reference |

| alias\_name | VARCHAR(200) | Yes | No | Alternative name |

| normalized\_alias | VARCHAR(200) | Yes | No | Normalized lookup value |



Example:



| Canonical skill | Alias |

|---|---|

| JavaScript | JS |

| PostgreSQL | Postgres |

| Amazon Web Services | AWS |



Aliases must not cause unrelated technologies to be merged.



\### 5.5 Department Skill Mapping



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| mapping\_id | UUID | Yes | No | Primary key |

| department\_id | UUID | Yes | No | Department reference |

| skill\_id | UUID | Yes | No | Skill reference |

| relevance\_type | ENUM | Yes | No | Core, Recommended, Specialized, Optional |

| justification | TEXT | No | Yes | Academic justification |

| taxonomy\_version\_id | UUID | Yes | No | Applicable taxonomy version |



\*\*Constraint:\*\* `(department\_id, skill\_id, taxonomy\_version\_id)` must be unique.



\## 6. Configuration Dictionary



\### 6.1 Taxonomy Versions



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| taxonomy\_version\_id | UUID | Yes | No | Primary key |

| version\_number | VARCHAR(30) | Yes | No | Version label |

| description | TEXT | No | Yes | Version description |

| status | ENUM | Yes | No | DRAFT, ACTIVE, RETIRED |

| created\_by | UUID | Yes | No | Creator |

| created\_at | DATETIME | Yes | No | Creation timestamp |

| activated\_at | DATETIME | No | Yes | Activation timestamp |



\### 6.2 Proficiency Frameworks



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| framework\_id | UUID | Yes | No | Primary key |

| version\_number | VARCHAR(30) | Yes | No | Framework version |

| framework\_name | VARCHAR(150) | Yes | No | Framework name |

| beginner\_min | DECIMAL(5,2) | Conditional | Yes | Beginner lower boundary |

| beginner\_max | DECIMAL(5,2) | Conditional | Yes | Beginner upper boundary |

| intermediate\_min | DECIMAL(5,2) | Conditional | Yes | Intermediate lower boundary |

| intermediate\_max | DECIMAL(5,2) | Conditional | Yes | Intermediate upper boundary |

| expert\_min | DECIMAL(5,2) | Conditional | Yes | Expert lower boundary |

| status | ENUM | Yes | No | DRAFT, ACTIVE, RETIRED |

| created\_at | DATETIME | Yes | No | Creation timestamp |



Numerical boundaries remain provisional until institutionally approved.



Additional evidence requirements and scoring dimensions must be defined in the proficiency configuration specification.



\### 6.3 Recommendation Rule Sets



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| rule\_set\_id | UUID | Yes | No | Primary key |

| version\_number | VARCHAR(30) | Yes | No | Rule-set version |

| rule\_set\_name | VARCHAR(150) | Yes | No | Rule-set name |

| status | ENUM | Yes | No | DRAFT, ACTIVE, RETIRED |

| created\_by | UUID | Yes | No | Creator |

| created\_at | DATETIME | Yes | No | Creation timestamp |



\### 6.4 Recommendation Rules



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| rule\_id | UUID | Yes | No | Primary key |

| rule\_set\_id | UUID | Yes | No | Parent rule set |

| rule\_code | VARCHAR(100) | Yes | No | Rule identifier |

| rule\_name | VARCHAR(200) | Yes | No | Rule name |

| condition\_config | JSONB | Yes | No | Validated rule conditions |

| action\_config | JSONB | Yes | No | Recommendation output configuration |

| priority | ENUM | Yes | No | CRITICAL, HIGH, MEDIUM, LOW |

| is\_active | BOOLEAN | Yes | No | Rule status |



JSON configurations must follow application-defined schemas.



\### 6.5 Platform Settings



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| setting\_id | UUID | Yes | No | Primary key |

| setting\_key | VARCHAR(150) | Yes | No | Unique setting identifier |

| setting\_value | JSONB | Yes | No | Configuration value |

| description | TEXT | No | Yes | Setting explanation |

| updated\_by | UUID | No | Yes | Last editor |

| updated\_at | DATETIME | Yes | No | Last update timestamp |



Cryptographic keys, passwords, and authentication secrets must not be stored as ordinary platform settings.



\## 7. Temporary Assessment Dictionary



All fields in this section are temporary and must be deleted according to the session retention policy.



\### 7.1 Assessment Session



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| session\_id | UUID | Yes | No | Unique session identifier |

| session\_name | STRING | Yes | No | Session display name |

| session\_type | ENUM | Yes | No | FORM, UPLOAD, COMBINED |

| created\_by | UUID | Yes | No | Session creator |

| department\_scope | ARRAY\[UUID] | Yes | No | Authorized department references |

| session\_status | ENUM | Yes | No | Current lifecycle state |

| collection\_start | DATETIME | Yes | No | Collection opening time |

| collection\_deadline | DATETIME | Yes | No | Collection deadline |

| session\_expires\_at | DATETIME | Yes | No | Session access expiry |

| retention\_expires\_at | DATETIME | Yes | No | Temporary data expiry |

| taxonomy\_version\_id | UUID | Yes | No | Taxonomy used |

| framework\_id | UUID | Yes | No | Proficiency framework used |

| rule\_set\_id | UUID | Yes | No | Recommendation rules used |

| created\_at | DATETIME | Yes | No | Creation timestamp |



Permitted session statuses:



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



The exact transition rules are defined in `SESSION\_MANAGEMENT.md`.



\### 7.2 Assessment Submission



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| submission\_id | UUID | Yes | No | Submission identifier |

| session\_id | UUID | Yes | No | Parent session |

| student\_reference | STRING | Yes | No | Temporary student identifier |

| department\_id | UUID | Yes | No | Department reference |

| submission\_source | ENUM | Yes | No | FORM, UPLOAD |

| submission\_status | ENUM | Yes | No | RECEIVED, VALIDATED, REJECTED |

| submitted\_at | DATETIME | Yes | No | Submission time |

| revision\_number | INTEGER | Yes | No | Submission revision |



The student reference is Restricted data.



Its exact format and whether it uses the institutional roll number or a generated reference remain undecided.



\### 7.3 Assessment Skill Record



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| record\_id | UUID | Yes | No | Record identifier |

| submission\_id | UUID | Yes | No | Parent submission |

| skill\_id | UUID | Yes | No | Canonical skill |

| proficiency\_input | ENUM | Conditional | Yes | Submitted proficiency |

| evidence\_source | ENUM | Yes | No | Source of proficiency information |

| evidence\_status | ENUM | Yes | No | Evidence review state |

| assessment\_score | DECIMAL(5,2) | No | Yes | Optional numerical score |

| classified\_level | ENUM | Yes | No | Final classification |



Permitted proficiency inputs:



\- BEGINNER

\- INTERMEDIATE

\- EXPERT



Permitted evidence sources:



\- SELF\_REPORTED

\- ASSESSMENT

\- PROJECT

\- CERTIFICATION

\- FACULTY\_VERIFIED



Permitted evidence statuses:



\- SELF\_REPORTED

\- EVIDENCE\_SUBMITTED

\- UNDER\_REVIEW

\- VERIFIED

\- REJECTED

\- NOT\_AVAILABLE



Permitted classified levels:



\- BEGINNER

\- INTERMEDIATE

\- EXPERT

\- UNCLASSIFIED



\*\*Important distinction:\*\* `proficiency\_input` represents what was declared or received. `classified\_level` represents the result of the approved classification process. They must not be treated as interchangeable.



\### 7.4 Uploaded Dataset



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| upload\_id | UUID | Yes | No | Upload identifier |

| session\_id | UUID | Yes | No | Associated session |

| uploaded\_by | UUID | Yes | No | Uploading user |

| original\_filename | STRING | Yes | No | Original filename metadata |

| storage\_key | STRING | Yes | No | Protected file reference |

| file\_format | ENUM | Yes | No | CSV, XLSX |

| file\_size | INTEGER | Yes | No | File size in bytes |

| validation\_status | ENUM | Yes | No | Validation state |

| uploaded\_at | DATETIME | Yes | No | Upload timestamp |

| expires\_at | DATETIME | Yes | No | Expiry timestamp |



Permitted validation statuses:



\- PENDING

\- PROCESSING

\- VALID

\- INVALID

\- FAILED



\### 7.5 Validation Result



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| validation\_id | UUID | Yes | No | Validation identifier |

| session\_id | UUID | Yes | No | Associated session |

| upload\_id | UUID | Conditional | Yes | Related upload |

| total\_rows | INTEGER | Yes | No | Total processed rows |

| valid\_rows | INTEGER | Yes | No | Valid rows |

| invalid\_rows | INTEGER | Yes | No | Invalid rows |

| validation\_errors | ARRAY\[JSON] | No | Yes | Row-level errors |

| validation\_status | ENUM | Yes | No | Processing state |

| created\_at | DATETIME | Yes | No | Creation timestamp |



A validation error object may contain:



```json

{

&#x20; "row\_number": 12,

&#x20; "column": "proficiency",

&#x20; "error\_code": "INVALID\_PROFICIENCY",

&#x20; "message": "The submitted proficiency value is not supported."

}

```



Error details must not unnecessarily reproduce student personal information.



\### 7.6 Normalized Dataset



The normalized dataset is the common internal representation for both form and upload channels.



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| session\_id | UUID | Yes | No | Parent session |

| submission\_id | UUID | Yes | No | Submission reference |

| student\_reference | STRING | Yes | No | Temporary student reference |

| department\_id | UUID | Yes | No | Department |

| skills | ARRAY\[JSON] | Yes | No | Normalized skill records |

| source\_revision | INTEGER | Yes | No | Source dataset revision |



Each skill object contains:



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| skill\_id | UUID | Yes | No | Canonical skill |

| proficiency\_input | ENUM | Conditional | Yes | Declared proficiency |

| evidence\_source | ENUM | Yes | No | Evidence source |

| evidence\_status | ENUM | Yes | No | Evidence status |



\### 7.7 Analysis Snapshot



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| analysis\_id | UUID | Yes | No | Analysis identifier |

| session\_id | UUID | Yes | No | Parent session |

| dataset\_revision | INTEGER | Yes | No | Input revision |

| analysis\_revision | INTEGER | Yes | No | Analysis revision |

| taxonomy\_version\_id | UUID | Yes | No | Taxonomy version |

| framework\_id | UUID | Yes | No | Proficiency version |

| rule\_set\_id | UUID | Yes | No | Recommendation rule version |

| processing\_status | ENUM | Yes | No | Processing state |

| started\_at | DATETIME | No | Yes | Processing start |

| completed\_at | DATETIME | No | Yes | Completion time |

| expires\_at | DATETIME | Yes | No | Expiry time |



Permitted processing statuses:



\- REQUESTED

\- QUEUED

\- PROCESSING

\- COMPLETED

\- FAILED



\### 7.8 Skill Distribution Result



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| result\_id | UUID | Yes | No | Result identifier |

| analysis\_id | UUID | Yes | No | Parent analysis |

| department\_id | UUID | Yes | No | Department |

| skill\_id | UUID | Yes | No | Skill |

| student\_count | INTEGER | Yes | No | Students with the skill |

| eligible\_population | INTEGER | Yes | No | Eligible population |

| coverage\_percentage | DECIMAL(6,2) | Conditional | Yes | Calculated coverage |



Coverage percentage must be null when the eligible population is zero or the metric is otherwise undefined.



\### 7.9 Proficiency Distribution Result



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| result\_id | UUID | Yes | No | Result identifier |

| analysis\_id | UUID | Yes | No | Parent analysis |

| department\_id | UUID | Yes | No | Department |

| skill\_id | UUID | Yes | No | Skill |

| beginner\_count | INTEGER | Yes | No | Beginner records |

| intermediate\_count | INTEGER | Yes | No | Intermediate records |

| expert\_count | INTEGER | Yes | No | Expert records |

| unclassified\_count | INTEGER | Yes | No | Unclassified records |



Counts must be non-negative integers.



\### 7.10 Skill Gap Result



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| gap\_id | UUID | Yes | No | Gap identifier |

| analysis\_id | UUID | Yes | No | Parent analysis |

| department\_id | UUID | Yes | No | Department |

| skill\_id | UUID | Yes | No | Related skill |

| gap\_type | ENUM | Yes | No | Gap classification |

| current\_value | DECIMAL(8,2) | No | Yes | Current measurement |

| target\_value | DECIMAL(8,2) | No | Yes | Approved target |

| gap\_value | DECIMAL(8,2) | No | Yes | Calculated difference |

| priority | ENUM | Conditional | Yes | Configured priority |

| explanation | TEXT | Yes | No | Reason for identification |



Gap types:



\- FOUNDATION\_GAP

\- PRACTICAL\_SKILL\_GAP

\- ADVANCED\_SKILL\_GAP

\- COVERAGE\_GAP

\- EVIDENCE\_GAP

\- CROSS\_DOMAIN\_GAP



Priority values:



\- CRITICAL

\- HIGH

\- MEDIUM

\- LOW



Priority calculation rules remain subject to the approved gap-prioritization methodology.



\### 7.11 Recommendation Result



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| recommendation\_id | UUID | Yes | No | Recommendation identifier |

| analysis\_id | UUID | Yes | No | Parent analysis |

| gap\_id | UUID | Yes | No | Source gap |

| recommendation\_type | ENUM | Yes | No | Development activity category |

| title | VARCHAR(200) | Yes | No | Recommendation title |

| explanation | TEXT | Yes | No | Reason for recommendation |

| priority | ENUM | Yes | No | Priority classification |

| rule\_id | UUID | Yes | No | Source recommendation rule |



Recommendation types:



\- WORKSHOP

\- BOOTCAMP

\- TECHNICAL\_TRAINING

\- PRACTICAL\_LAB

\- CERTIFICATION\_PREPARATION

\- PROJECT\_BASED\_LEARNING

\- ADVANCED\_TRAINING

\- FOUNDATION\_TRAINING

\- INTERDISCIPLINARY\_PROGRAM



\## 8. Export Dictionary



\### 8.1 Export Job



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| export\_id | UUID | Yes | No | Export identifier |

| session\_id | UUID | Yes | No | Source session |

| analysis\_id | UUID | Yes | No | Source analysis |

| requested\_by | UUID | Yes | No | Requesting user |

| export\_mode | ENUM | Yes | No | REPORTS\_ONLY, COMPLETE\_PACKAGE |

| export\_format | ENUM | Yes | No | PDF, XLSX, CSV, ZIP |

| export\_status | ENUM | Yes | No | Current state |

| includes\_identifiable\_data | BOOLEAN | Yes | No | Identifiable-data flag |

| storage\_key | STRING | No | Yes | Protected storage reference |

| created\_at | DATETIME | Yes | No | Creation timestamp |

| expires\_at | DATETIME | Yes | No | Export expiry |



Permitted export statuses:



\- REQUESTED

\- VALIDATING

\- QUEUED

\- PROCESSING

\- VALIDATING\_FILE

\- READY

\- FAILED

\- EXPIRED

\- CLEANING

\- DELETED



\### 8.2 Export File



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| file\_id | UUID | Yes | No | File identifier |

| export\_id | UUID | Yes | No | Parent export |

| filename | STRING | Yes | No | Generated filename |

| content\_type | STRING | Yes | No | MIME type |

| file\_size | INTEGER | Yes | No | File size in bytes |

| checksum\_sha256 | VARCHAR(64) | No | Yes | SHA-256 checksum |

| created\_at | DATETIME | Yes | No | Creation timestamp |

| expires\_at | DATETIME | Yes | No | Expiry timestamp |



The export storage reference and generated file must follow the approved export retention policy.



\## 9. Governance Dictionary



Governance persistence has not been finalized.



The following fields define the proposed logical structures if the university approves persistent governance records.



\### 9.1 Initiative Proposal



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| proposal\_id | UUID | Yes | No | Proposal identifier |

| session\_id | UUID | Conditional | Yes | Source session reference |

| analysis\_id | UUID | Conditional | Yes | Source analysis reference |

| department\_id | UUID | Yes | No | Proposing department |

| proposed\_by | UUID | Yes | No | Proposer |

| proposal\_title | VARCHAR(200) | Yes | No | Proposal title |

| proposal\_description | TEXT | Yes | No | Proposal details |

| proposal\_status | ENUM | Yes | No | Workflow status |

| created\_at | DATETIME | Yes | No | Creation timestamp |

| updated\_at | DATETIME | Yes | No | Last update |



\### 9.2 Proposal Decision



| Field | Type | Required | Nullable | Description |

|---|---|---|---|---|

| decision\_id | UUID | Yes | No | Decision identifier |

| proposal\_id | UUID | Yes | No | Parent proposal |

| decided\_by | UUID | Yes | No | Decision-maker |

| decision\_type | ENUM | Yes | No | APPROVED, REJECTED, CHANGES\_REQUESTED, DEFERRED |

| comments | TEXT | No | Yes | Decision comments |

| decided\_at | DATETIME | Yes | No | Decision timestamp |



Persistent governance records must not contain copied student-level assessment datasets.



\## 10. Common Processing and API Fields



These fields may appear in API responses and processing metadata.



| Field | Type | Required | Description |

|---|---|---|---|

| success | BOOLEAN | Yes | Indicates request outcome |

| message | STRING | No | Human-readable response |

| error\_code | STRING | Conditional | Machine-readable error identifier |

| request\_id | UUID | Yes | Request tracing identifier |

| job\_id | UUID | Conditional | Background job identifier |

| status | ENUM | Conditional | Operation status |

| created\_at | DATETIME | Conditional | Resource creation time |

| updated\_at | DATETIME | Conditional | Resource update time |



The API response structure is defined in `API\_DOCUMENTATION.md`.



\## 11. Data Validation Rules



The following rules apply across the data model.



\### 11.1 Identifiers

\- UUID fields must contain valid UUID values.

\- Foreign-key references must point to existing permitted entities.

\- Temporary identifiers must not be reused across unrelated sessions where doing so creates a risk of data leakage.



\### 11.2 Text fields

\- Required text must not be empty or whitespace-only.

\- Maximum lengths must be enforced.

\- User-supplied text must be safely rendered.

\- Original uploaded filenames must not be used directly as filesystem paths.



\### 11.3 Numeric fields

\- Counts must be non-negative integers.

\- Scores must follow the approved scoring range.

\- Percentages must be within 0–100 when representing a bounded percentage.

\- Undefined denominators must produce null or an explicitly defined unavailable state, not fabricated zero values.



\### 11.4 Date and time fields

\- Timestamps must be timezone-aware.

\- Collection deadlines must follow the configured session lifecycle.

\- Expiry timestamps must be validated.

\- Expired resources must not be accessible through application APIs.



\### 11.5 Enum fields

\- Only approved enum values are accepted.

\- Unknown values must be rejected or handled through a documented compatibility policy.

\- Enum changes must be coordinated across frontend, backend, storage, and exports.



\### 11.6 JSON fields

\- JSON structures must follow explicit schemas.

\- Arbitrary executable content must not be accepted.

\- Nested values must be validated.

\- Sensitive information must not be embedded unnecessarily.



\## 12. Data Sensitivity and Retention Matrix



| Entity | Classification | Storage | Retention |

|---|---|---|---|

| Users | Confidential | Persistent database | Institutional policy |

| Roles | Internal | Persistent database | Persistent |

| Permissions | Internal | Persistent database | Persistent |

| Departments | Internal | Persistent database | Institutional policy |

| Skill taxonomy | Internal | Persistent database | Versioned |

| Proficiency framework | Internal | Persistent database | Versioned |

| Recommendation rules | Internal | Persistent database | Versioned |

| Assessment sessions | Restricted | Temporary storage | Session policy |

| Student submissions | Restricted | Temporary storage | Session policy |

| Skill records | Restricted | Temporary storage | Session policy |

| Uploaded datasets | Restricted | Temporary filesystem | Session policy |

| Validation results | Restricted | Temporary storage | Session policy |

| Normalized records | Restricted | Temporary storage | Session policy |

| Analysis results | Restricted | Temporary storage | Session policy |

| Skill gaps | Restricted | Temporary storage | Session policy |

| Recommendations | Restricted | Temporary storage | Session policy |

| Export files | Restricted or Confidential, depending on content | Temporary filesystem | Export policy |

| Governance records | Confidential | Undecided | Institutional decision |



\## 13. Naming and Serialization Standards



\### 13.1 Backend

\- Python models use `snake\_case`.

\- Pydantic schemas use consistent field names.

\- Enum values use canonical uppercase identifiers.

\- API field names must match documented contracts.



\### 13.2 Frontend

\- TypeScript interfaces must use the documented API field names.

\- API responses must be validated where necessary.

\- UI labels may be human-readable but must not alter underlying identifiers.



\### 13.3 Export files

\- CSV headers must use documented field names or an explicitly approved human-readable mapping.

\- Excel sheets must have documented column names.

\- JSON exports must use stable field names.

\- Manifest metadata must identify the applicable configuration versions.



\## 14. Data Dictionary Maintenance



Any change to a field must be reviewed when it affects:



\- Database structure.

\- API contracts.

\- Frontend forms.

\- Normalization.

\- Analytical formulas.

\- Recommendation rules.

\- Exports.

\- Retention.

\- Access control.



Changes must update the relevant documentation and automated tests.



A field must not be removed, renamed, or reinterpreted without reviewing its dependent modules.



\## 15. Open Decisions



| Decision | Current status |

|---|---|

| Student identifier format | Not finalized |

| Roll number storage in temporary submissions | Not finalized |

| Persistent user authentication model | Not finalized |

| Department hierarchy | Requires institutional validation |

| Proficiency numerical boundaries | Provisional |

| Evidence scoring structure | Requires assessment-methodology approval |

| Governance persistence | Not finalized |

| Audit metadata retention | Not finalized |

| Export retention | Not finalized |

| Exact session retention periods | Not finalized |

| Exact upload and record-size limits | To be benchmarked |



\## 16. Definition of Completion



The data dictionary is considered implemented when:



1\. Every implemented field has a documented meaning.

2\. Data types and constraints are consistent across modules.

3\. Persistent and temporary entities are distinguishable.

4\. API schemas align with backend data models.

5\. Frontend forms use documented field definitions.

6\. Taxonomy references are consistent.

7\. Proficiency and evidence values follow approved enums.

8\. Analytical outputs use documented fields.

9\. Export schemas are consistent.

10\. Data sensitivity and retention rules are enforced.

11\. Changes to fields are traceable and tested.



\---



\*\*End of DATA\_DICTIONARY.md\*\*

