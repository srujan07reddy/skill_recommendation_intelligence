\# ANALYTICS\_SPECIFICATION.md



\*\*Project:\*\* Student Skill Intelligence Platform (SSIP)  

\*\*Document Version:\*\* 1.0  

\*\*Status:\*\* Proposed Specification  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Purpose



This document defines the analytical metrics, formulas, aggregation rules, interpretation criteria, and output structures used by the Student Skill Intelligence Platform.



The Analytics Layer converts validated and normalized assessment data into meaningful institutional intelligence.



It enables authorized users to understand:



\- Which skills are present across departments.

\- How frequently students report or demonstrate particular skills.

\- How proficiency levels are distributed.

\- Which skills have strong or weak departmental coverage.

\- Where evidence of proficiency is insufficient.

\- How departments compare across relevant skill domains.

\- Which areas may require structured skill-development initiatives.



The platform must produce explainable and reproducible results. Every analytical metric must have a defined numerator, denominator, eligibility condition, and interpretation.



\## 2. Analytical Architecture



The analytics process is divided into distinct responsibilities.



| Component | Responsibility |

|---|---|

| Data Validation | Ensures incoming data meets validation requirements |

| Data Normalization | Converts accepted data into a common structure |

| Skill Analysis Engine | Calculates skill distributions and proficiency metrics |

| Skill Gap Analysis | Compares current metrics against approved targets |

| Recommendation Engine | Generates development recommendations from identified needs |

| Dashboard Layer | Presents metrics to authorized users |

| Export Layer | Produces downloadable analytical reports |



The Skill Analysis Engine calculates observed metrics. The Skill Gap Analysis component evaluates those metrics against configured targets.



The Recommendation Engine consumes the resulting gaps and supporting evidence. It must not independently reinterpret raw records.



\## 3. Analytical Principles



1\. Use validated records only.

2\. Exclude rejected records from calculations.

3\. Keep missing values separate from zero values.

4\. Distinguish student-level counts from assessment-record counts.

5\. Distinguish self-reported proficiency from verified proficiency.

6\. Use department relevance when interpreting coverage.

7\. Do not assume every skill is equally relevant to every department.

8\. Do not classify low participation as a skill deficiency.

9\. Do not treat missing evidence as proof of incompetence.

10\. Preserve the configuration and dataset versions used in each analysis.

11\. Do not expose identifiable student information in aggregate dashboards by default.

12\. Make every calculated metric traceable to its source data and formula.



\## 4. Analytical Input



\### 4.1 Required Input



The Analytics Layer receives normalized assessment records containing fields such as:



| Field | Purpose |

|---|---|

| Temporary Student Reference | Identifies a student within the temporary session |

| Department ID | Identifies the student's department |

| Skill ID | Identifies the canonical skill |

| Proficiency Input | Original or normalized submitted proficiency |

| Classified Level | Calculated or approved proficiency classification, when available |

| Evidence Source | Indicates how proficiency information was obtained |

| Evidence Status | Indicates the state of supporting evidence |

| Source Type | Form or bulk upload |

| Validation Status | Determines whether the record is eligible for analysis |

| Assessment Date | Supports assessment-period filtering, when available |



\### 4.2 Configuration Input



The analysis must also receive:



\- Active skill taxonomy version.

\- Active proficiency framework version.

\- Department-to-skill relevance mappings.

\- Approved target coverage values, where configured.

\- Privacy suppression thresholds.

\- Analysis filters and scope.

\- Dataset revision identifier.



\### 4.3 Eligibility



A record is eligible for a particular metric only when it satisfies that metric's requirements.



For example:



\- A valid skill record may contribute to skill presence.

\- A record with a valid proficiency classification may contribute to proficiency distribution.

\- A verified record may contribute to verified proficiency metrics.

\- A record with unresolved skill mapping must not contribute to canonical skill analytics.



Eligibility must be calculated separately for each metric. A record that is valid for one metric is not automatically valid for every metric.



\## 5. Core Analytical Entities



| Entity | Description |

|---|---|

| Assessment Record | A validated student-skill assessment entry |

| Student Population | Eligible distinct students within an analysis scope |

| Department Population | Eligible students belonging to a department |

| Skill | Canonical taxonomy skill |

| Skill Domain | Higher-level skill classification |

| Skill Category | Subdivision within a skill domain |

| Proficiency Classification | Beginner, Intermediate, or Expert |

| Evidence Classification | Source and verification status of proficiency information |

| Department Relevance | Core, Recommended, Specialized, or Optional |

| Analysis Snapshot | Versioned result of a completed analysis |



A student may have multiple assessment records. Student counts must use distinct student references rather than raw record counts unless the metric explicitly measures assessment records.



\## 6. Population and Denominator Definitions



Correct denominator selection is essential. A metric with an incorrect denominator can produce misleading conclusions even when its arithmetic is correct.



\### 6.1 Total Eligible Population



Let:



\- \\(N\_D\\) = number of distinct eligible students in department \\(D\\).

\- \\(N\_I\\) = number of distinct eligible students across the institution.



The institutional population is calculated from distinct student references:



\\\[

N\_I = \\left|\\bigcup\_D Students(D)\\right|

\\]



A student must not be counted multiple times merely because multiple skill records exist.



\### 6.2 Skill-Eligible Population



For skill \\(S\\) and department \\(D\\), the denominator should contain students eligible to be assessed against that skill.



\\\[

N\_{eligible}(S,D)

\\]



This population may differ from the department's entire student population.



The eligibility rules must consider:



\- Department relevance.

\- Programme or specialization, where configured.

\- Assessment scope.

\- Session participation rules.

\- Any explicitly configured exclusions.



If the platform does not have sufficient information to establish skill-specific eligibility, it must label the denominator clearly rather than silently treating the entire department as eligible.



\### 6.3 Participation Population



\\\[

N\_{participated}(D)

\\]



The number of distinct students in department \\(D\\) who submitted at least one valid assessment record in the session.



Participation is not equivalent to skill coverage.



\### 6.4 Classified Population



\\\[

N\_{classified}(S,D)

\\]



The number of distinct eligible students with an accepted proficiency classification for skill \\(S\\) in department \\(D\\).



This denominator must exclude records without a usable classification.



\## 7. Skill Distribution Analytics



Skill distribution measures how frequently a skill appears in the assessment population.



\### 7.1 Student Skill Count



\\\[

C(S,D) =

\\left|\\{u : u \\text{ has a valid record for } S \\text{ in } D\\}\\right|

\\]



Each student is counted once per skill and department for this metric.



Multiple submissions or evidence records for the same student and skill must not inflate the count.



\### 7.2 Skill Coverage Percentage



\\\[

Coverage(S,D) =

\\frac{C(S,D)}{N\_{eligible}(S,D)} \\times 100

\\]



This metric represents the percentage of eligible students with a valid record indicating the presence of the skill.



The exact interpretation depends on the assessment method:



\- For self-reported assessments, it represents reported skill presence.

\- For practical assessments, it represents skill presence according to the assessment's defined criteria.

\- For verified assessments, it represents skill presence supported by the applicable verification process.



The dashboard must display the assessment basis.



If the eligible population is zero, coverage must be null or marked unavailable. It must not be displayed as zero percent.



\### 7.3 Institutional Skill Distribution



\\\[

C(S,I) =

\\left|\\{u : u \\text{ has a valid record for } S \\text{ in the institution}\\}\\right|

\\]



\\\[

Coverage(S,I) =

\\frac{C(S,I)}{N\_{eligible}(S,I)} \\times 100

\\]



Institutional coverage must use distinct students and a clearly defined institutional eligibility population.



It must not be calculated by simply averaging department percentages.



\### 7.4 Skill Frequency Ranking



Skills may be ranked by:



\- Number of students.

\- Coverage percentage.

\- Verified skill count.

\- Proficiency distribution.

\- Department relevance.



Each ranking must identify its metric and denominator.



A ranking by raw student count must not be presented as a ranking of proficiency or competency.



\## 8. Proficiency Distribution Analytics



Proficiency analytics measure the distribution of classified levels for a particular skill.



\### 8.1 Proficiency Count



For skill \\(S\\), department \\(D\\), and level \\(L\\):



\\\[

P(S,D,L) =

\\text{Distinct students classified at level } L

\\]



Where:



\\\[

L \\in \\{Beginner, Intermediate, Expert\\}

\\]



A student must not be counted more than once in the same level for the same analysis scope.



Conflicting classifications must be resolved using the configured assessment and evidence rules before aggregation.



\### 8.2 Proficiency Percentage



\\\[

ProficiencyPercentage(S,D,L) =

\\frac{P(S,D,L)}{N\_{classified}(S,D)} \\times 100

\\]



The denominator includes only students with usable classifications for that skill.



The dashboard must also display the classified population count so users can assess the reliability of the percentage.



\### 8.3 Proficiency Distribution



Example:



| Level | Student count | Percentage |

|---|---:|---:|

| Beginner | 30 | 30% |

| Intermediate | 50 | 50% |

| Expert | 20 | 20% |

| Total classified | 100 | 100% |



This example is illustrative and does not represent actual university data.



\### 8.4 Proficiency Input vs Classified Level



The system must maintain a distinction between:



\- `proficiency\_input`: the proficiency value originally supplied or normalized from the assessment.

\- `classified\_level`: the result produced by the active proficiency framework.



A self-reported Beginner, Intermediate, or Expert value must not automatically be presented as independently verified competency.



\### 8.5 Evidence-Based Proficiency



The platform should calculate separate distributions for:



1\. Self-reported proficiency.

2\. Assessment-based proficiency.

3\. Project-supported proficiency.

4\. Certification-supported proficiency.

5\. Faculty-verified proficiency.



These categories must not be combined into a single verified competency metric without an approved methodology.



\## 9. Evidence Analytics



Evidence analytics measure the availability and verification state of supporting information.



\### 9.1 Evidence Status Distribution



For a skill and department, calculate distinct student counts by evidence status:



\- SELF\_REPORTED

\- EVIDENCE\_SUBMITTED

\- UNDER\_REVIEW

\- VERIFIED

\- REJECTED

\- NOT\_AVAILABLE



The percentage for a status is:



\\\[

EvidencePercentage(status) =

\\frac{Students(status)}{N\_{evidence\\\_eligible}} \\times 100

\\]



The denominator must be defined consistently for the selected evidence metric.



\### 9.2 Verified Proficiency Coverage



\\\[

VerifiedCoverage(S,D) =

\\frac{N\_{verified}(S,D)}{N\_{eligible}(S,D)} \\times 100

\\]



This metric must only include records that satisfy the approved verification criteria.



If verification criteria have not been configured, the metric must be unavailable rather than inferred.



\### 9.3 Evidence Gap



An evidence gap indicates that sufficient supporting information is unavailable for a meaningful proficiency assessment.



It may result from:



\- Missing practical assessment.

\- Unsubmitted project evidence.

\- Pending faculty verification.

\- Incomplete certification details.

\- Unavailable evidence.



An evidence gap must not be interpreted as a lack of skill.



\## 10. Department-Level Analytics



Department analytics aggregate validated student-level metrics within a department.



\### 10.1 Department Skill Profile



Each department should have an analytical profile containing:



\- Eligible student population.

\- Participating student population.

\- Participation percentage.

\- Skill distribution.

\- Proficiency distribution.

\- Evidence distribution.

\- Skill coverage.

\- Relevant skill gaps.

\- Recommended development areas.



\### 10.2 Department Participation Rate



\\\[

ParticipationRate(D) =

\\frac{N\_{participated}(D)}{N\_D} \\times 100

\\]



A low participation rate must be highlighted because it limits the representativeness of the department's analysis.



\### 10.3 Department Skill Coverage



Calculate coverage independently for every relevant skill using its eligible population.



Department dashboards should support filtering by:



\- Skill domain.

\- Skill category.

\- Individual skill.

\- Programme or specialization, where configured.

\- Proficiency level.

\- Evidence status.

\- Assessment method.



\### 10.4 Department Skill Profile Comparison



Departments may be compared using:



\- Shared skills.

\- Department-specific skills.

\- Coverage percentage.

\- Proficiency distribution.

\- Verified coverage.

\- Evidence availability.

\- Participation rate.



Comparisons must account for different population sizes and department relevance mappings.



A department with a larger population must not automatically appear stronger merely because it has more assessment records.



\## 11. Institutional Analytics



Institutional analytics aggregate department-level information.



\### 11.1 Institutional Skill Profile



The institutional dashboard should provide:



\- Total eligible student population.

\- Total participating students.

\- Overall participation rate.

\- Skill distribution across departments.

\- Skill domain distribution.

\- Proficiency distribution.

\- Verified proficiency distribution.

\- Evidence availability.

\- Departmental skill gaps.

\- Institutional development priorities.



\### 11.2 Institutional Participation Rate



\\\[

InstitutionalParticipationRate =

\\frac{N\_{participated}(I)}{N\_I} \\times 100

\\]



Distinct students must be counted across the institution.



\### 11.3 Institutional Coverage



Institutional coverage must use the institutional eligible population for the skill.



\\\[

InstitutionalCoverage(S) =

\\frac{C(S,I)}{N\_{eligible}(S,I)} \\times 100

\\]



The calculation must not use an unweighted average of department coverage percentages.



Where skill eligibility differs across departments, the institutional denominator must reflect those differences.



\### 11.4 Institutional Department Comparison



The Dean dashboard should provide comparisons across authorized departments.



Comparison dimensions:



| Dimension | Purpose |

|---|---|

| Participation | Indicates assessment coverage |

| Skill coverage | Indicates reported or assessed skill presence |

| Proficiency | Shows classified level distribution |

| Verification | Indicates evidence-backed competency |

| Evidence gap | Identifies assessment and verification needs |

| Skill relevance | Establishes departmental context |

| Development need | Supports institutional planning |



Department rankings must be clearly labeled and must not be generated from a single composite score unless an approved scoring methodology exists.



\## 12. Skill Relevance Analytics



Department skill relevance is defined in `SKILL\_TAXONOMY.md`.



The platform supports these relevance categories:



\- CORE

\- RECOMMENDED

\- SPECIALIZED

\- OPTIONAL



\### 12.1 Relevance-Aware Analysis



A skill must be evaluated in the context of its department relevance.



For example:



\- Low coverage in a Core skill may require investigation.

\- Low coverage in an Optional skill may not indicate a development priority.

\- A Specialized skill may apply only to selected programmes.

\- A Recommended skill may support broader interdisciplinary development.



\### 12.2 Relevance Weighting



A weighted relevance score may be introduced in a later version.



However, relevance weights must not be invented or assumed in the initial release.



Until approved, relevance categories should be used as explicit analytical labels and filters.



\## 13. Skill Gap Analysis



Skill Gap Analysis is a separate component that consumes the observed metrics produced by the Skill Analysis Engine.



\### 13.1 Gap Analysis Inputs



\- Current skill coverage.

\- Current proficiency distribution.

\- Verified proficiency coverage.

\- Evidence availability.

\- Department skill relevance.

\- Eligible population.

\- Approved target values.

\- Participation information.



\### 13.2 Coverage Gap



For skill \\(S\\) in department \\(D\\):



\\\[

CoverageGap(S,D) =

TargetCoverage(S,D) - CurrentCoverage(S,D)

\\]



Interpretation:



\- Positive result: current coverage is below the target.

\- Zero: current coverage meets the target.

\- Negative result: current coverage exceeds the target.



A gap must not be calculated when the target is undefined or the current coverage is unavailable.



\### 13.3 Proficiency Gap



Where an approved target proficiency distribution exists:



\\\[

ProficiencyGap(S,D,L) =

TargetProficiency(S,D,L) - CurrentProficiency(S,D,L)

\\]



The target and current values must use the same denominator definition and assessment basis.



A self-reported proficiency distribution must not be compared against a verified proficiency target without an approved conversion or comparison methodology.



\### 13.4 Evidence Gap



Evidence gaps should identify where proficiency claims lack adequate supporting information.



Examples:



\- High self-reported Expert presence but low verified coverage.

\- Large number of assessments awaiting review.

\- Insufficient practical assessment participation.

\- Missing project evidence.



These conditions may justify assessment or verification initiatives rather than immediate skill-development interventions.



\### 13.5 Gap Interpretation Rules



The platform must not:



\- Treat low coverage as an automatic competency deficiency.

\- Treat missing evidence as proof of Beginner proficiency.

\- Compare departments without considering population size and relevance.

\- Calculate a gap against an unapproved target.

\- Combine self-reported and verified metrics without clear labeling.

\- Generate a recommendation from an unreliable or incomplete analytical result without warning.



\## 14. Analytical Classification



The platform may classify coverage into descriptive categories.



The current proposed thresholds are:



| Coverage | Classification |

|---|---|

| 75% and above | HIGH |

| 40% to below 75% | MODERATE |

| Below 40% | LOW |



These thresholds are provisional and configurable.



They describe observed coverage, not competency quality.



For example, LOW coverage means that relatively few eligible students have a valid record indicating the skill. It does not independently establish that the department lacks the skill.



Classification must be unavailable when the denominator is zero or the data is insufficient.



\## 15. Data Quality and Confidence Indicators



Analytics must expose data quality limitations.



\### 15.1 Participation Quality



The dashboard should display participation rate alongside department metrics.



A metric derived from a small or incomplete participating population should be visibly qualified.



\### 15.2 Evidence Quality



The dashboard should distinguish:



\- Self-reported data.

\- Assessment-supported data.

\- Verified data.

\- Pending evidence.

\- Missing evidence.



\### 15.3 Confidence Scoring



A numerical confidence score is not part of the initial release.



The platform may show descriptive quality indicators such as:



\- HIGH PARTICIPATION

\- LIMITED PARTICIPATION

\- STRONG EVIDENCE COVERAGE

\- LIMITED EVIDENCE

\- INSUFFICIENT DATA



The criteria for these labels must be configured and documented before implementation.



\## 16. Privacy and Small-Group Suppression



Departmental and institutional analytics must follow `DATA\_PRIVACY\_AND\_RETENTION.md`.



\### 16.1 Aggregated Display



The default dashboard should display aggregate metrics rather than student-identifiable records.



\### 16.2 Small-Group Suppression



Where a group contains fewer than the configured minimum number of students:



\- Suppress the relevant metric.

\- Display an appropriate privacy notice.

\- Avoid exposing the suppressed value through chart tooltips or alternate API fields.

\- Apply the same rule to downloadable reports.



\### 16.3 Filtering and Re-identification



The platform must consider whether combinations of filters could reveal a student's identity.



For example, a very small specialization combined with a rare skill and a proficiency filter may expose an individual even when names are hidden.



Privacy enforcement must therefore apply to the final filtered result, not only to the original department population.



The minimum group threshold is an open configuration decision.



\## 17. Analytical Filters



Authorized users may filter analytics by:



| Filter | Purpose |

|---|---|

| Assessment Session | Select the dataset |

| Department | View departmental metrics |

| Programme | Narrow the academic population |

| Skill Domain | Analyze a skill area |

| Skill Category | Narrow a domain |

| Individual Skill | Inspect one skill |

| Proficiency Level | Examine proficiency distribution |

| Evidence Source | Separate assessment methods |

| Evidence Status | Inspect verification status |

| Source Type | Compare form and upload submissions |

| Assessment Date | Filter by assessment period when available |



All filters must respect backend authorization and privacy controls.



A filter must not create a new denominator silently. The displayed metric should identify the population used in its calculation.



\## 18. Dashboard Metric Definitions



The following metrics are proposed for the initial dashboard.



| Metric | Calculation | Primary audience |

|---|---|---|

| Total Eligible Students | Distinct eligible student count | HOD, Dean |

| Participating Students | Distinct students with valid submissions | HOD, Dean |

| Participation Rate | Participants / eligible students | HOD, Dean |

| Skills Identified | Distinct canonical skills present | HOD, Dean |

| Skill Coverage | Students with skill / skill-eligible students | HOD, Dean |

| Beginner Distribution | Beginner count / classified population | HOD, Dean |

| Intermediate Distribution | Intermediate count / classified population | HOD, Dean |

| Expert Distribution | Expert count / classified population | HOD, Dean |

| Verified Coverage | Verified students / eligible students | HOD, Dean |

| Evidence Availability | Students with applicable evidence / evidence-eligible students | HOD, Dean |

| Coverage Gap | Target minus current coverage | HOD, Dean |

| Department Comparison | Comparable metrics across departments | Dean |



The dashboard must show the population count and assessment basis alongside percentage-based metrics.



\## 19. Analytical Output Structure



The Skill Analysis Engine should return structured outputs.



Illustrative response:



```json

{

&#x20; "analysis\_id": "ANL-001",

&#x20; "session\_id": "SES-001",

&#x20; "dataset\_revision": 3,

&#x20; "taxonomy\_version": "1.0",

&#x20; "proficiency\_framework\_version": "1.0",

&#x20; "analysis\_status": "COMPLETED",

&#x20; "population": {

&#x20;   "eligible\_students": 500,

&#x20;   "participating\_students": 420,

&#x20;   "participation\_rate": 84.0

&#x20; },

&#x20; "skill\_metrics": \[

&#x20;   {

&#x20;     "skill\_id": "SKILL-001",

&#x20;     "department\_id": "DEPT-001",

&#x20;     "eligible\_population": 100,

&#x20;     "students\_with\_skill": 65,

&#x20;     "coverage\_percentage": 65.0,

&#x20;     "classified\_population": 60,

&#x20;     "proficiency\_distribution": {

&#x20;       "beginner": 15,

&#x20;       "intermediate": 35,

&#x20;       "expert": 10

&#x20;     }

&#x20;   }

&#x20; ],

&#x20; "data\_quality": {

&#x20;   "rejected\_records": 5,

&#x20;   "warning\_records": 12,

&#x20;   "unresolved\_skills": 2

&#x20; }

}

```



This is an illustrative logical structure, not a finalized API response contract.



\### 19.1 Output Requirements



Every analytical output should identify:



\- Analysis ID.

\- Session ID.

\- Dataset revision.

\- Analysis timestamp.

\- Taxonomy version.

\- Proficiency framework version.

\- Analysis configuration version.

\- Population definition.

\- Metric definitions.

\- Data quality limitations.

\- Privacy suppression status.



The output must preserve the distinction between unavailable, suppressed, zero, and calculated values.



\## 20. Recalculation and Reproducibility



The initial release should use full recalculation when a dataset revision changes.



Every analysis snapshot must be associated with:



\- Dataset revision.

\- Taxonomy version.

\- Proficiency framework version.

\- Department relevance mapping version.

\- Analysis configuration version.

\- Gap target version, where applicable.

\- Recommendation rule-set version, where applicable.



Changing the taxonomy, proficiency framework, or analytical configuration must not silently rewrite the meaning of an existing snapshot.



A new analysis should be generated when the relevant inputs change.



Because assessment data is temporary, analysis snapshots must follow the session's temporary data-retention lifecycle.



\## 21. Performance Requirements



Initial provisional processing targets:



| Dataset size | Proposed analysis target |

|---|---:|

| 1,000 records | 5 seconds |

| 5,000 records | 15 seconds |

| 10,000 records | 30 seconds |



These are initial engineering targets, not guaranteed performance figures.



Performance testing must use representative datasets and the actual deployment configuration.



The initial implementation should use Pandas and NumPy for batch processing.



Incremental analytics may be considered later if measured performance or usage justifies the additional complexity.



\## 22. Failure Handling



The Analytics Layer must handle:



| Condition | Expected behavior |

|---|---|

| No valid records | Return NO\_VALID\_DATA |

| Zero eligible population | Return unavailable metric |

| Missing proficiency classifications | Exclude from proficiency denominator |

| Unresolved skill mappings | Exclude from canonical skill analytics |

| Missing target coverage | Do not calculate coverage gap |

| Insufficient group size | Suppress metric |

| Invalid analysis configuration | Return CONFIGURATION\_ERROR |

| Dataset revision changes during processing | Reject stale result or restart against a consistent snapshot |

| Processing failure | Return FAILED with a safe error reference |



Partial analytical results must be clearly labeled. The platform must not present incomplete processing as a completed analysis.



\## 23. Testing Requirements



\### 23.1 Formula Tests



Test:

\- Distinct student counting.

\- Skill coverage.

\- Institutional coverage.

\- Participation rate.

\- Proficiency distribution.

\- Verified coverage.

\- Evidence distribution.

\- Coverage gap.

\- Proficiency gap.



\### 23.2 Data Quality Tests



Test:

\- Duplicate records.

\- Multiple skills per student.

\- Missing proficiency.

\- Unresolved taxonomy entries.

\- Conflicting proficiency inputs.

\- Unverified Expert claims.

\- Incomplete department participation.

\- Zero eligible population.



\### 23.3 Aggregation Tests



Test:

\- Department aggregation.

\- Institutional aggregation.

\- Unequal department population sizes.

\- Students with multiple assessment records.

\- Students appearing in multiple data sources.

\- Programme-level filtering.

\- Skill relevance filtering.



\### 23.4 Privacy Tests



Test:

\- Small-group suppression.

\- Filter combinations that could reveal individuals.

\- Suppression in chart tooltips.

\- Suppression in API responses.

\- Suppression in exported reports.



\### 23.5 Reproducibility Tests



Test:

\- Reanalysis with the same dataset and configuration.

\- Dataset revision changes.

\- Taxonomy version changes.

\- Proficiency framework changes.

\- Analysis configuration changes.

\- Stale analysis rejection.



\## 24. Acceptance Criteria



The Analytics Layer is ready for initial release when:



1\. Skill distribution is calculated using distinct students.

2\. Percentage metrics use explicitly defined denominators.

3\. Department and institutional metrics are correctly aggregated.

4\. Proficiency distributions exclude unclassified records.

5\. Self-reported and verified proficiency remain distinguishable.

6\. Evidence gaps are not interpreted as competency gaps.

7\. Department relevance is included in gap interpretation.

8\. Coverage gaps are calculated only against approved targets.

9\. Low coverage is not automatically treated as a development priority.

10\. Privacy suppression is applied after filtering.

11\. Analysis snapshots retain the versions of their source configurations.

12\. Failed or incomplete analysis is never presented as completed.

13\. All critical formulas have automated tests.

14\. Analytical outputs are reproducible from the same input revision and configuration.



\## 25. Open Decisions



The following decisions require institutional or product approval:



1\. Final definition of eligible student population for each skill.

2\. Department-specific target coverage values.

3\. Whether targets vary by programme, specialization, or academic year.

4\. Whether proficiency targets will be defined for each skill.

5\. Minimum group size for privacy suppression.

6\. Participation quality thresholds.

7\. Evidence quality classification criteria.

8\. Department relevance weighting, if any.

9\. Rules for resolving conflicting proficiency classifications.

10\. Whether historical assessment periods will be supported.

11\. Whether a composite department skill score is required.

12\. Whether the institution requires additional statistical confidence measures.

13\. Final dashboard metric selection and presentation priority.



\---



\## 26. Related Documents



| Document | Relationship |

|---|---|

| PROJECT\_OVERVIEW.md | Overall product vision |

| DATA\_DICTIONARY.md | Analytical input and output fields |

| VALIDATION\_RULES.md | Data eligibility and validation |

| SKILL\_TAXONOMY.md | Canonical skill classification |

| PROFICIENCY\_FRAMEWORK.md | Proficiency and evidence interpretation |

| SKILL\_ANALYSIS\_ENGINE.md | Analytical processing responsibilities |

| RECOMMENDATION\_ENGINE.md | Development recommendations |

| ACCESS\_CONTROL.md | Analytical data access |

| DATA\_PRIVACY\_AND\_RETENTION.md | Privacy and retention |

| EXPORT\_ARCHITECTURE.md | Exported analytical results |

| FRONTEND\_ARCHITECTURE.md | Dashboard presentation |

| API\_DOCUMENTATION.md | Analytical API contracts |

| TESTING\_STRATEGY.md | Analytical testing |



\*\*Document status:\*\* Proposed Specification — Version 1.0



\*\*Core principle:\*\* Analytics must describe what the collected evidence supports, not what the institution assumes to be true. Every metric must have a defensible denominator, a clear interpretation, and traceable source data.

