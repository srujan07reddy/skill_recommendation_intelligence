\# DEPARTMENT\_SKILL\_MAPPING.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Mapping Specification  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines how university schools, departments, programmes, and specializations are mapped to the skill taxonomy used by the Student Skill Intelligence Platform.



The mapping enables the platform to:



\- Identify skills relevant to each academic programme.

\- Evaluate departmental skill coverage.

\- Identify programme-specific and interdisciplinary skill gaps.

\- Compare departments using relevant skills rather than a universal skill checklist.

\- Generate context-aware development recommendations.

\- Support HOD and Dean decision-making.



The mapping acts as the connection between the university's academic organizational structure and the platform's skill intelligence engine.



\## 2. Core Mapping Principles



1\. Academic organizational structure and skill taxonomy must remain separate entities.

2\. A school may contain multiple departments and programmes.

3\. A programme may map to multiple skill domains.

4\. A skill domain may be relevant to multiple programmes.

5\. Individual skills must be mapped at programme or specialization level wherever possible.

6\. Department-level mappings should be derived from the programmes and specializations under that department.

7\. Skill relevance must be based on curriculum, learning outcomes, practical exposure, and academic validation.

8\. A skill must not be classified as Core merely because it appears in a student's self-reported assessment.

9\. Unknown programmes and specializations must not be automatically assigned to unrelated departments.

10\. Changes to academic structure and skill mappings must be versioned.



\## 3. Mapping Hierarchy



The platform follows this logical hierarchy:



```text

University

&#x20;   |

&#x20;   +-- School

&#x20;         |

&#x20;         +-- Department

&#x20;               |

&#x20;               +-- Programme

&#x20;                     |

&#x20;                     +-- Specialization

&#x20;                           |

&#x20;                           +-- Relevant Skill Domains

&#x20;                                 |

&#x20;                                 +-- Skill Categories

&#x20;                                       |

&#x20;                                       +-- Individual Skills

```



Not every programme necessarily requires a separate department entity. The university's approved organizational structure must determine whether a programme belongs directly to a school or to a department.



\### 3.1 Organizational Entities



| Entity | Responsibility |

|---|---|

| University | Institutional owner |

| School | Academic school |

| Department | Academic organizational unit |

| Programme | Degree or course of study |

| Specialization | Approved academic specialization |

| Skill Domain | Broad technical or professional area |

| Skill Category | Subdivision within a domain |

| Skill | Individual competency or capability |



\### 3.2 Mapping Relationships



The system must support:



\- One school to multiple departments.

\- One department to multiple programmes.

\- One programme to multiple specializations.

\- One programme to multiple skill domains.

\- One skill domain to multiple programmes.

\- One skill to multiple programmes.

\- Different relevance levels for the same skill across programmes.



A single fixed skill list per school is insufficient for accurate analysis.



\## 4. University Academic Structure



The following five schools form the initial organizational mapping scope.



| School ID | School |

|---|---|

| SCH-SET | School of Engineering \& Technology |

| SCH-SSAHS | School of Sciences \& Allied Health Sciences |

| SCH-SAHM | School of Arts, Humanities \& Management |

| SCH-AVI | School of Aviation |

| SCH-SPESS | School of Physical Education \& Sports Sciences |



\*\*Important:\*\* The names above are the school-level starting structure. Exact official naming, identifiers, departmental boundaries, and current programme ownership must be reconciled with the university's authoritative academic records.



\## 5. Programme Catalogue Mapping



The following programme list is a starting catalogue derived from the available university website compilation. It is not a substitute for the current approved programme master.



\### 5.1 School of Engineering \& Technology



| Programme ID | Programme | Qualification |

|---|---|---|

| PRG-SET-CSE | Computer Science and Engineering | B.Tech |

| PRG-SET-AIML | Computer Science – Artificial Intelligence \& Machine Learning | B.Tech |

| PRG-SET-AIDS | CSE – Artificial Intelligence \& Data Science | B.Tech |

| PRG-SET-CYS | Computer Science – Cyber Security | B.Tech |

| PRG-SET-ECE | Electronics and Communication Engineering | B.Tech |

| PRG-SET-BT | Biotechnology | B.Tech |



Additional postgraduate and doctoral programmes listed in the available catalogue include:



\- M.Tech Computer Science and Engineering.

\- M.Tech Biotechnology.

\- M.Tech VLSI.

\- Ph.D Computer Science and Engineering.

\- Ph.D Electronics and Communication Engineering.

\- Ph.D Biotechnology.



Their current school and department ownership must be confirmed before production mapping.



\### 5.2 School of Sciences \& Allied Health Sciences



| Programme ID | Programme | Qualification |

|---|---|---|

| PRG-SSAHS-BCA | Bachelor of Computer Applications | BCA |

| PRG-SSAHS-BCS | Computer Science | B.Sc |

| PRG-SSAHS-AI | Artificial Intelligence | B.Sc |

| PRG-SSAHS-MLT | Medical Laboratory Technology | B.Sc |

| PRG-SSAHS-FS | Forensic Science | B.Sc |



Additional postgraduate and doctoral programmes listed include:



\- MCA.

\- M.Sc Computer Science.

\- M.Sc Forensic Science.

\- Ph.D Science.



Exact academic ownership and programme availability must be confirmed.



\### 5.3 School of Arts, Humanities \& Management



| Programme ID | Programme | Qualification |

|---|---|---|

| PRG-SAHM-BCOM | Commerce | B.Com |

| PRG-SAHM-BBA | Business Administration | BBA |

| PRG-SAHM-MBA | Business Administration | MBA |

| PRG-SAHM-MBA-AAM | Airline and Airport Management | MBA |

| PRG-SAHM-MBA-SL | Shipping and Logistics | MBA |



The available programme catalogue also lists General MBA as a programme option. Its exact academic structure and relationship with specializations must be confirmed.



\### 5.4 School of Aviation



| Programme ID | Programme | Qualification |

|---|---|---|

| PRG-AVI-BSC | Aviation | B.Sc |

| PRG-AVI-BBA-AAM | Airline and Airport Management | BBA |

| PRG-AVI-BBA-SL | Shipping and Logistics | BBA |



Programme ownership must be confirmed where aviation-related management programmes overlap with the School of Arts, Humanities \& Management catalogue.



\### 5.5 School of Physical Education \& Sports Sciences



| Programme ID | Programme | Qualification |

|---|---|---|

| PRG-SPESS-BSPE | Physical Education | B.Sc |



The programme list must be expanded using the approved academic programme master.



\## 6. Skill Domain Reference



The mapping uses the skill taxonomy established in `SKILL\_TAXONOMY.md`.



| Domain ID | Skill Domain |

|---|---|

| DOM-01 | Programming and Software Development |

| DOM-02 | Operating Systems and Infrastructure |

| DOM-03 | Networking and Communication |

| DOM-04 | Cybersecurity |

| DOM-05 | Cloud Computing and Cloud Security |

| DOM-06 | DevOps and Containerization |

| DOM-07 | Artificial Intelligence and Machine Learning |

| DOM-08 | AI Security |

| DOM-09 | Data Science and Analytics |

| DOM-10 | Electronics and Embedded Systems |

| DOM-11 | Business and Management |



These domains are the initial taxonomy reference. They are not a complete representation of every academic or professional competency across the university.



Additional domain coverage may be required for:



\- Healthcare and laboratory sciences.

\- Forensic science.

\- Aviation operations and safety.

\- Commerce and accounting.

\- Sports science and physical education.

\- Logistics and supply chain management.

\- Research methodology and academic communication.



These areas must be evaluated before the taxonomy is treated as institution-wide complete.



\## 7. Department and Programme Skill Mapping



\### 7.1 Mapping Relevance Levels



Every programme-to-skill relationship must use one of the following relevance levels.



| Relevance | Meaning |

|---|---|

| CORE | Essential competency directly connected to programme outcomes |

| RECOMMENDED | Important supporting competency |

| SPECIALIZED | Relevant to a particular specialization or advanced pathway |

| OPTIONAL | Useful supplementary competency |



These classifications must be based on curriculum and academic review.



\### 7.2 School of Engineering \& Technology



The following are proposed starting mappings.



| Programme | Candidate skill domains | Initial mapping rationale |

|---|---|---|

| Computer Science and Engineering | Programming, Operating Systems, Networking, Data Science, Cloud, DevOps | Software and computing foundations |

| AI \& Machine Learning | Programming, AI/ML, Data Science, Operating Systems, Cloud | Model development and computational foundations |

| AI \& Data Science | Programming, Data Science, AI/ML, Cloud | Data processing, analytics, and intelligent systems |

| Cyber Security | Programming, Operating Systems, Networking, Cybersecurity, Cloud Security, DevOps, AI Security | Security engineering and infrastructure protection |

| Electronics and Communication Engineering | Electronics and Embedded Systems, Networking, Programming | Electronic systems and communication technologies |

| Biotechnology | Programming, Data Science, Biotechnology-related scientific competencies | Computational and scientific applications |



The non-computing scientific competencies for Biotechnology require additional taxonomy coverage and must not be reduced to programming-related skills.



\### 7.3 School of Sciences \& Allied Health Sciences



| Programme | Candidate skill domains | Initial mapping rationale |

|---|---|---|

| BCA | Programming, Operating Systems, Networking, Data Science, Cloud | Application and computing foundations |

| B.Sc Computer Science | Programming, Operating Systems, Networking, Data Science | Computing and software foundations |

| B.Sc Artificial Intelligence | Programming, AI/ML, Data Science, Cloud | Artificial intelligence and data foundations |

| B.Sc Medical Laboratory Technology | Healthcare Laboratory, Medical Instrumentation, Laboratory Safety, Data Management | Clinical laboratory and diagnostic competencies |

| B.Sc Forensic Science | Forensic Investigation, Digital Forensics, Scientific Analysis, Evidence Handling | Scientific investigation and forensic practice |



The healthcare and forensic domains require expansion in the taxonomy before reliable programme-level skill mapping can be completed.



\### 7.4 School of Arts, Humanities \& Management



| Programme | Candidate skill domains | Initial mapping rationale |

|---|---|---|

| B.Com | Commerce, Accounting, Finance, Business Analytics | Financial and commercial competencies |

| BBA | Business and Management, Communication, Business Analytics | Management and organizational foundations |

| MBA | Business and Management, Strategy, Finance, Leadership, Analytics | Advanced management competencies |

| MBA Airline and Airport Management | Business Management, Aviation Operations, Airport Management | Aviation business and operational management |

| MBA Shipping and Logistics | Business Management, Logistics, Supply Chain, Operations Analytics | Logistics and supply chain management |



The candidate domains require appropriate taxonomy entries. Existing Business and Management taxonomy entries alone may not adequately represent commerce, finance, or logistics.



\### 7.5 School of Aviation



| Programme | Candidate skill domains | Initial mapping rationale |

|---|---|---|

| B.Sc Aviation | Aviation Operations, Aviation Safety, Aviation Systems, Communication | Aviation-specific knowledge and operational competencies |

| BBA Airline and Airport Management | Aviation Operations, Airport Management, Business Management | Airline and airport administration |

| BBA Shipping and Logistics | Logistics, Supply Chain, Operations Management, Business Analytics | Transportation and logistics operations |



Aviation and logistics-specific competencies must be represented explicitly in the taxonomy rather than forced into unrelated technical categories.



\### 7.6 School of Physical Education \& Sports Sciences



| Programme | Candidate skill domains | Initial mapping rationale |

|---|---|---|

| B.Sc Physical Education | Sports Science, Physical Fitness, Coaching, Sports Management, Human Performance | Physical education and sports-related competencies |



Additional taxonomy domains may include:



\- Exercise physiology.

\- Sports biomechanics.

\- Fitness assessment.

\- Coaching methodology.

\- Sports injury prevention.

\- Sports psychology.

\- Sports analytics.

\- Sports administration.



These are candidate competency areas, not approved curriculum mappings.



\## 8. Cross-Disciplinary Skill Mapping



Some skills are relevant across multiple academic programmes.



Examples include:



| Skill area | Potentially relevant programmes |

|---|---|

| Communication | All academic schools |

| Problem Solving | Engineering, Sciences, Management, Aviation, Sports Science |

| Data Literacy | Computing, Sciences, Management, Aviation, Sports Science |

| Research Methodology | Research-oriented programmes across schools |

| Project Management | Engineering, Management, Aviation, Logistics |

| Digital Literacy | All academic schools |

| Presentation Skills | All academic schools |

| Analytical Thinking | All academic schools |



These relationships should be evaluated individually.



A skill being useful across the university does not automatically make it a Core skill for every programme.



\## 9. Skill Mapping Data Model



The platform must support programme-specific and specialization-specific mappings.



\### 9.1 Recommended Entities



| Entity | Purpose |

|---|---|

| School | University academic school |

| Department | Academic department |

| Programme | Degree programme |

| Specialization | Programme specialization |

| Skill Domain | Broad skill category |

| Skill Category | Subcategory |

| Skill | Individual competency |

| Programme Skill Mapping | Programme-to-skill relationship |

| Department Skill Mapping | Department-level derived or approved relationship |

| Mapping Version | Versioned mapping configuration |

| Mapping Review | Academic validation and approval metadata |



\### 9.2 Programme Skill Mapping Fields



| Field | Description |

|---|---|

| mapping\_id | Unique mapping identifier |

| programme\_id | Associated programme |

| specialization\_id | Optional specialization |

| skill\_id | Canonical skill identifier |

| relevance\_level | CORE, RECOMMENDED, SPECIALIZED, OPTIONAL |

| academic\_basis | Curriculum or learning-outcome reference |

| mapping\_status | DRAFT, UNDER\_REVIEW, APPROVED, REJECTED, INACTIVE |

| mapping\_version | Mapping version |

| effective\_from | Effective date |

| effective\_to | Optional end date |

| reviewed\_by | Authorized academic reviewer |

| reviewed\_at | Review timestamp |



\### 9.3 Department Skill Mapping Fields



| Field | Description |

|---|---|

| department\_id | Academic department |

| skill\_id | Canonical skill |

| relevance\_level | Approved department relevance |

| source\_programmes | Programmes contributing to the mapping |

| mapping\_status | Current mapping status |

| mapping\_version | Mapping version |



A department-level mapping should be derived from programme-level mappings or explicitly approved by the relevant academic authority.



It must not be produced by blindly merging every programme's skills into one undifferentiated list.



\## 10. Mapping Resolution Logic



When a student submits an assessment, the platform must identify the student's academic context before interpreting skill relevance.



\### 10.1 Resolution Sequence



```text

Student Reference

&#x20;      |

&#x20;      v

Resolve Student Academic Record

&#x20;      |

&#x20;      v

Identify School

&#x20;      |

&#x20;      v

Identify Department

&#x20;      |

&#x20;      v

Identify Programme

&#x20;      |

&#x20;      v

Identify Specialization

&#x20;      |

&#x20;      v

Load Active Mapping Version

&#x20;      |

&#x20;      v

Retrieve Relevant Skills

&#x20;      |

&#x20;      v

Evaluate Submitted Skills

&#x20;      |

&#x20;      v

Generate Context-Aware Analytics

```



\### 10.2 Academic Identity Resolution



The preferred source for academic assignment is the authoritative university student record.



Where roll-number or institutional-code mapping is available, the platform should use it to resolve:



\- School.

\- Department.

\- Programme.

\- Specialization.

\- Batch.

\- Academic status.



Students must not be asked to manually classify themselves into arbitrary departments when the authoritative academic record can resolve their assignment.



If a student reference cannot be resolved, the record must be flagged for review rather than assigned to a guessed department.



\### 10.3 Mapping Resolution Rules



1\. Resolve the student's academic identity first.

2\. Load the active programme mapping.

3\. Apply specialization-specific overrides where available.

4\. Inherit programme-level mappings where no specialization override exists.

5\. Apply department-level mappings only according to the approved inheritance policy.

6\. Preserve the mapping version used.

7\. Flag unresolved programme or skill relationships.



\## 11. Programme and Department Aggregation



Department analytics must account for the programmes within that department.



\### 11.1 Programme-Level Analysis



For a particular programme:



\- Use its approved skill mapping.

\- Identify relevant skills.

\- Calculate coverage against the programme's eligible student population.

\- Calculate proficiency distribution.

\- Evaluate evidence availability.

\- Identify approved target deviations.



\### 11.2 Department-Level Analysis



A department may contain multiple programmes.



The system must:



\- Preserve programme-specific relevance.

\- Calculate metrics using the appropriate eligible populations.

\- Avoid treating every programme as eligible for every department skill.

\- Show programme breakdowns where useful.

\- Distinguish department-wide skills from programme-specific skills.



\### 11.3 Institutional Analysis



Institutional metrics must aggregate the underlying eligible student populations.



They must not simply average department percentages.



Where programmes use different assessment criteria, the platform must identify the difference before comparing their results.



\## 12. Mapping Approval Workflow



Academic mapping must be validated before it becomes an active analytical configuration.



\### 12.1 Proposed Workflow



```text

Administrator / Authorized Mapping Editor

&#x20;                |

&#x20;                v

&#x20;         Create Mapping Draft

&#x20;                |

&#x20;                v

&#x20;         Associate Programmes

&#x20;                |

&#x20;                v

&#x20;         Map Skill Domains

&#x20;                |

&#x20;                v

&#x20;         Map Individual Skills

&#x20;                |

&#x20;                v

&#x20;         Set Relevance Levels

&#x20;                |

&#x20;                v

&#x20;         Attach Academic Basis

&#x20;                |

&#x20;                v

&#x20;         Submit for Review

&#x20;                |

&#x20;                v

&#x20;         Academic Review

&#x20;                |

&#x20;                +------ Changes Requested

&#x20;                |

&#x20;                +------ Rejected

&#x20;                |

&#x20;                +------ Approved

&#x20;                          |

&#x20;                          v

&#x20;                   Publish Version

&#x20;                          |

&#x20;                          v

&#x20;                   Active Mapping

```



The exact approving authority must be defined by institutional governance.



The Administrator may maintain the mapping configuration but must not automatically be treated as the academic authority approving curriculum relevance.



\## 13. Mapping Versioning



Every approved mapping configuration must have a version.



Example:



| Version | Status | Description |

|---|---|---|

| 1.0 | APPROVED | Initial programme mapping |

| 1.1 | DRAFT | Additional skill relationships |

| 2.0 | APPROVED | Updated curriculum mapping |



Versioning must preserve:



\- Previous skill relationships.

\- Previous relevance levels.

\- Academic review information.

\- Effective dates.

\- Programme and specialization references.



Existing analysis snapshots must retain the mapping version used when they were generated.



A new mapping version must not silently change the interpretation of an existing analysis.



\## 14. Mapping Quality and Validation



Before publishing a mapping version, validate:



\- Every programme references a valid school and department relationship.

\- Every skill references an active taxonomy entry.

\- No duplicate programme-skill relationships exist within the same mapping scope.

\- Relevance levels use approved values.

\- Specialization mappings reference valid specializations.

\- Academic basis is provided for Core skills.

\- Conflicting mappings are identified.

\- Unmapped programmes are reported.

\- Unmapped skill domains are reported.

\- Deprecated skills are not used in new active mappings without an explicit migration decision.



\### 14.1 Mapping Quality Indicators



The platform may display:



\- MAPPED: Approved skill relationships exist.

\- PARTIALLY\_MAPPED: Some relevant skills remain unresolved.

\- UNDER\_REVIEW: Mapping is awaiting academic validation.

\- UNMAPPED: No approved skill relationships exist.

\- OUTDATED: Mapping requires review against a newer curriculum.



These indicators describe mapping completeness, not student competency.



\## 15. Analytics Integration



The mapping directly influences the Skill Analysis Engine and Skill Gap Analysis component.



\### 15.1 Skill Coverage



Coverage must use the eligible student population established by the programme and its approved mapping.



\### 15.2 Proficiency Analysis



Proficiency distributions must be evaluated within the relevant programme and department context.



\### 15.3 Skill Gap Analysis



A skill gap should be calculated only when:



\- The skill is relevant to the programme or department.

\- The eligible population is defined.

\- The current metric is available.

\- An approved target exists.



\### 15.4 Recommendation Engine



Recommendations should consider:



\- Skill relevance.

\- Programme level.

\- Department requirements.

\- Current skill coverage.

\- Proficiency distribution.

\- Evidence availability.

\- Approved development targets.



The same skill may produce different recommendations for different programmes.



\## 16. API Requirements



The mapping module should expose APIs for:



| API | Purpose |

|---|---|

| GET `/api/v1/organization/schools` | Retrieve schools |

| GET `/api/v1/organization/departments` | Retrieve departments |

| GET `/api/v1/organization/programmes` | Retrieve programmes |

| GET `/api/v1/organization/programmes/{id}` | Retrieve programme details |

| GET `/api/v1/mappings/programmes/{id}/skills` | Retrieve programme skill mapping |

| GET `/api/v1/mappings/departments/{id}/skills` | Retrieve department skill mapping |

| GET `/api/v1/mappings/skills/{id}/programmes` | Retrieve programmes associated with a skill |

| POST `/api/v1/mappings` | Create mapping draft |

| PUT `/api/v1/mappings/{id}` | Update mapping draft |

| POST `/api/v1/mappings/{id}/submit` | Submit mapping for review |

| POST `/api/v1/mappings/{id}/approve` | Approve mapping |

| POST `/api/v1/mappings/{id}/publish` | Publish approved mapping |



These are proposed API contracts and must be reconciled with `API\_DOCUMENTATION.md`.



\## 17. Initial Implementation Strategy



\### Phase 1: Academic Structure



\- Load approved school records.

\- Load approved department records.

\- Load programme records.

\- Load specialization records.

\- Establish student-to-programme relationships.



\### Phase 2: Skill Taxonomy Alignment



\- Review existing skill domains.

\- Identify missing academic domains.

\- Expand skill categories.

\- Define canonical skills and aliases.



\### Phase 3: Programme Mapping



\- Map candidate skill domains.

\- Map individual skills.

\- Assign relevance levels.

\- Attach curriculum references.

\- Submit mappings for academic review.



\### Phase 4: Department Aggregation



\- Derive department-level skill mappings.

\- Validate programme-specific differences.

\- Approve department-level analytical rules.



\### Phase 5: Analytics Integration



\- Apply active mapping versions.

\- Calculate programme-level metrics.

\- Aggregate department-level metrics.

\- Generate institutional skill intelligence.



\## 18. Acceptance Criteria



The mapping module is acceptable when:



1\. All approved academic schools are represented.

2\. Every active programme has an authoritative school and department relationship.

3\. Specializations are represented where applicable.

4\. Programme-to-skill mappings support many-to-many relationships.

5\. Department mappings preserve programme relevance.

6\. Skills use canonical taxonomy identifiers.

7\. Relevance levels are explicitly defined.

8\. Unmapped programmes and skills are reported.

9\. Mapping approval is separate from technical administration.

10\. Mapping versions are preserved.

11\. Student academic context is resolved from authoritative records where available.

12\. Analytics use the correct programme and department eligibility populations.

13\. Historical analysis snapshots retain their original mapping versions.



\## 19. Open Decisions



The following items require institutional confirmation:



1\. Exact current school and department hierarchy.

2\. Official department identifiers and programme codes.

3\. Current approved programme catalogue.

4\. Programme-to-department ownership where multiple schools appear to offer related programmes.

5\. Official specialization structure.

6\. Roll-number-to-school, department, programme, and batch resolution rules.

7\. Whether student academic assignments are retrieved through ERP integration or a temporary authorized dataset.

8\. Approved curriculum and syllabus references for each programme.

9\. Academic authority responsible for approving skill mappings.

10\. Whether HODs can propose mapping changes.

11\. Whether Dean or academic council approval is required for publication.

12\. Required review frequency for mappings.

13\. Additional skill domains required for non-computing programmes.

14\. Programme-specific proficiency targets.

15\. Whether interdisciplinary skills require institution-wide targets.



\---



\## 20. Related Documents



| Document | Relationship |

|---|---|

| ORGANIZATIONAL\_STRUCTURE.md | University academic hierarchy |

| DATABASE\_DESIGN.md | Academic and mapping entities |

| DATA\_DICTIONARY.md | Mapping field definitions |

| SKILL\_TAXONOMY.md | Canonical skill structure |

| PROFICIENCY\_FRAMEWORK.md | Proficiency definitions |

| SKILL\_ANALYSIS\_ENGINE.md | Skill analytics |

| ANALYTICS\_SPECIFICATION.md | Analytical formulas |

| RECOMMENDATION\_ENGINE.md | Development recommendations |

| ACCESS\_CONTROL.md | Mapping permissions |

| VALIDATION\_RULES.md | Mapping and input validation |

| API\_DOCUMENTATION.md | Mapping API contracts |

| DATA\_PRIVACY\_AND\_RETENTION.md | Student data handling |



\*\*Document status:\*\* Proposed Mapping Specification — Version 1.0



\*\*Core principle:\*\* Academic relevance must determine skill mapping. The platform must not force every department into a generic technical skill framework or assume that every student in a school follows the same curriculum.

