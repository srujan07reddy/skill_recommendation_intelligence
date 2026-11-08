\# PROFICIENCY\_FRAMEWORK.md



\# Student Skill Intelligence Platform (SSIP)



\*\*Document:\*\* Skill Proficiency Assessment Framework  

\*\*Version:\*\* 1.0  

\*\*Status:\*\* Proposed Framework  

\*\*Last Updated:\*\* November 2026



\---



\## 1. Introduction



The Proficiency Framework defines the methodology used by SSIP to classify student competency across different technical and professional skills.



The platform uses three primary proficiency levels:



1\. Beginner

2\. Intermediate

3\. Expert



The framework establishes consistent definitions, assessment criteria, evidence classifications, calculation rules, and reporting standards.



Its purpose is to ensure that proficiency information collected from different departments and assessment channels can be interpreted consistently.



The framework must distinguish between what a student claims to know and what the student can demonstrate.



\---



\## 2. Objectives



The proficiency framework must:



\- Establish standardized proficiency levels.

\- Define measurable competency indicators.

\- Support different assessment methods.

\- Distinguish self-reported and verified proficiency.

\- Provide consistent classification across departments.

\- Support department-level proficiency analytics.

\- Identify proficiency distribution and competency gaps.

\- Provide reliable inputs to the recommendation engine.

\- Support future integration with certifications and practical assessments.



\---



\## 3. Proficiency Classification Model



SSIP initially uses three proficiency levels.



<text color="secondary" weight="medium" size="xs">INITIAL CLASSIFICATION</text>



| Level | Classification | General Definition |

|---|---|---|

| Level 1 | Beginner | Basic familiarity and understanding of a skill. |

| Level 2 | Intermediate | Ability to apply the skill independently in common situations. |

| Level 3 | Expert | Advanced ability to apply, evaluate, troubleshoot, and work with the skill in complex situations. |



These levels represent broad competency categories.



They are not equivalent to academic grades, professional job titles, or industry certification levels.



\---



\## 4. Detailed Proficiency Definitions



\### 4.1 Beginner



\*\*Definition:\*\* The student has basic awareness or foundational understanding of the skill.



Expected characteristics:



\- Understands basic concepts and terminology.

\- Can identify common tools and components.

\- Can perform simple tasks with guidance.

\- Requires assistance when encountering unfamiliar problems.

\- Has limited practical experience.



Example: Linux



A Beginner may:



\- Explain what Linux is.

\- Identify common Linux distributions.

\- Navigate directories.

\- Execute basic terminal commands.

\- Understand basic file operations.



The student may still require guidance for system administration and troubleshooting.



\### 4.2 Intermediate



\*\*Definition:\*\* The student can independently apply the skill to common practical tasks and solve routine problems.



Expected characteristics:



\- Understands the underlying concepts.

\- Can complete common tasks independently.

\- Can configure and use relevant tools.

\- Can troubleshoot routine issues.

\- Can apply the skill in practical projects.

\- Understands common limitations and best practices.



Example: Linux



An Intermediate student may:



\- Manage users and permissions.

\- Configure basic services.

\- Manage packages.

\- Understand processes and system services.

\- Write basic shell scripts.

\- Troubleshoot common system problems.



\### 4.3 Expert



\*\*Definition:\*\* The student demonstrates advanced practical understanding and can solve complex problems using the skill.



Expected characteristics:



\- Demonstrates deep technical understanding.

\- Handles complex configurations.

\- Diagnoses unfamiliar problems.

\- Evaluates alternative approaches.

\- Understands performance and security implications.

\- Can design or improve technical solutions.

\- Can guide others through complex tasks.



Example: Linux



An Expert student may:



\- Design system administration strategies.

\- Diagnose complex system failures.

\- Analyze system performance.

\- Configure advanced networking and security controls.

\- Automate complex administrative operations.

\- Evaluate system architecture and operational trade-offs.



An Expert classification should require stronger evidence than basic familiarity or routine usage.



\---



\## 5. Proficiency Dimensions



A proficiency level should not be based solely on theoretical knowledge.



The framework considers multiple competency dimensions.



| Dimension | Description |

|---|---|

| Conceptual Understanding | Understanding of principles and terminology |

| Practical Application | Ability to perform tasks using the skill |

| Problem Solving | Ability to identify and resolve problems |

| Tool Proficiency | Ability to use relevant tools and technologies |

| Independent Execution | Ability to work without continuous guidance |

| Advanced Application | Ability to handle complex or unfamiliar situations |



\### 5.1 Dimension Interpretation



| Dimension | Beginner | Intermediate | Expert |

|---|---|---|---|

| Conceptual Understanding | Basic concepts | Strong working knowledge | Deep understanding |

| Practical Application | Simple guided tasks | Independent routine tasks | Complex practical applications |

| Problem Solving | Requires assistance | Solves common problems | Solves complex problems |

| Tool Proficiency | Basic usage | Effective usage | Advanced configuration and evaluation |

| Independent Execution | Limited | Generally independent | Highly independent |

| Advanced Application | Limited exposure | Handles some complex tasks | Handles unfamiliar and complex situations |



Not every skill requires identical assessment tasks. The relevant dimensions and their importance should be configured according to the skill.



\---



\## 6. Proficiency Evidence Classification



SSIP must distinguish the source of proficiency information.



\### 6.1 Self-Reported Proficiency



The student selects their perceived proficiency level.



Example:



```text

Skill: Python

Student Selection: Intermediate

Evidence Type: Self-Reported

```



Characteristics:



\- Easy to collect.

\- Suitable for large-scale assessments.

\- Provides an indication of student confidence and perceived competency.

\- Cannot independently establish actual proficiency.



Self-reported proficiency must be labelled clearly in dashboards and reports.



\### 6.2 Assessment-Based Proficiency



The proficiency level is derived from a structured assessment.



Possible assessment methods:



\- Multiple-choice questions.

\- Practical coding exercises.

\- Configuration tasks.

\- Troubleshooting exercises.

\- Skill-specific examinations.



Assessment-based classification requires a defined assessment blueprint, scoring methodology, and validated proficiency thresholds.



\### 6.3 Project-Based Evidence



The student provides evidence of practical application.



Possible evidence:



\- Academic projects.

\- GitHub repositories.

\- Technical demonstrations.

\- Laboratory work.

\- Project reports.

\- Practical implementation records.



Project evidence should be reviewed against defined competency criteria.



Simply submitting a project link must not automatically establish Expert proficiency.



\### 6.4 Certification-Based Evidence



The student provides a relevant certification.



Examples:



\- Cloud certifications.

\- Networking certifications.

\- Security certifications.

\- Programming certifications.



Certification evidence indicates successful completion of a specific certification assessment.



It does not automatically prove advanced practical competency in every related skill.



\### 6.5 Faculty-Verified Proficiency



An authorized faculty member reviews the student's demonstrated competency.



Possible verification methods:



\- Practical examination.

\- Project demonstration.

\- Technical interview.

\- Laboratory assessment.

\- Structured competency evaluation.



Faculty verification should record the evaluation method and verification status.



\---



\## 7. Evidence and Confidence Model



SSIP must maintain two separate concepts:



1\. Proficiency classification.

2\. Evidence confidence.



A student may report Expert proficiency without having verified evidence.



The system must not convert that claim into verified Expert competency.



\### 7.1 Evidence Status



| Status | Meaning |

|---|---|

| Self-Reported | Student-provided proficiency |

| Evidence Submitted | Supporting evidence provided but not reviewed |

| Under Review | Evidence is being evaluated |

| Verified | Authorized assessment or reviewer confirms the result |

| Rejected | Submitted evidence was not accepted |

| Not Available | No supporting evidence is available |



\### 7.2 Example



| Student | Skill | Claimed Level | Evidence Status |

|---|---|---|---|

| Student A | Python | Intermediate | Self-Reported |

| Student B | Python | Expert | Evidence Submitted |

| Student C | Python | Intermediate | Verified |

| Student D | Python | Beginner | Self-Reported |



The dashboard must preserve these distinctions.



\### 7.3 Confidence Interpretation



The platform may display evidence confidence categories:



\- Unverified.

\- Evidence Submitted.

\- Assessed.

\- Verified.



These are evidence states, not additional proficiency levels.



A numerical confidence score should not be introduced until the institution defines a validated methodology for calculating it.



\---



\## 8. Proficiency Assessment Methodology



\### 8.1 Assessment Structure



An assessment should contain skill-specific questions or tasks mapped to competency dimensions.



Illustrative structure:



```text

Skill Assessment

│

├── Conceptual Questions

│

├── Practical Tasks

│

├── Problem-Solving Tasks

│

├── Tool Usage

│

└── Advanced Application

```



The assessment should evaluate the competencies required for the specific skill.



For example, a Python assessment and a Linux assessment should not use identical practical tasks merely because they share the same proficiency labels.



\### 8.2 Assessment Blueprint



Each assessed skill should define:



\- Learning outcomes.

\- Competency dimensions.

\- Assessment questions or tasks.

\- Scoring criteria.

\- Proficiency thresholds.

\- Required evidence.

\- Assessment version.



\### 8.3 Assessment Methods by Level



| Level | Expected Assessment |

|---|---|

| Beginner | Foundational knowledge and simple practical tasks |

| Intermediate | Independent application and routine problem solving |

| Expert | Advanced application, complex troubleshooting, and design decisions |



The exact assessment tasks must be developed by relevant subject-matter experts.



\---



\## 9. Scoring Framework



\### 9.1 Proposed Scoring Scale



For structured assessments, SSIP may use a normalized score from 0 to 100.



| Score Range | Proficiency |

|---|---|

| 0–39 | Beginner |

| 40–74 | Intermediate |

| 75–100 | Expert |



<text color="secondary" size="xs">These are provisional implementation thresholds, not validated institutional standards.</text>



The institution must approve and validate these thresholds before they are used for formal competency decisions.



\### 9.2 Score Calculation



For an assessment containing multiple competency dimensions:



\\\[

S = \\frac{\\sum\_{i=1}^{n} w\_i s\_i}{\\sum\_{i=1}^{n} w\_i}

\\]



Where:



\- \\(S\\) = Overall assessment score.

\- \\(s\_i\\) = Score for competency dimension \\(i\\).

\- \\(w\_i\\) = Weight assigned to dimension \\(i\\).

\- \\(n\\) = Number of assessed dimensions.



The weights must be defined in the skill-specific assessment blueprint.



\### 9.3 Example



Illustrative Python assessment:



| Dimension | Score | Weight |

|---|---:|---:|

| Conceptual Understanding | 80 | 20% |

| Practical Application | 70 | 40% |

| Problem Solving | 65 | 25% |

| Tool Usage | 75 | 15% |



\\\[

S = (80 \\times 0.20) + (70 \\times 0.40) +

(65 \\times 0.25) + (75 \\times 0.15)

\\]



\\\[

S = 71.25

\\]



Under the provisional thresholds, the result is Intermediate.



\### 9.4 Minimum Competency Conditions



A high overall score must not automatically compensate for a critical failure in an essential competency.



For example, an assessment may require a minimum practical score before a student can receive Expert classification.



Such conditions must be defined in the skill-specific assessment blueprint.



\---



\## 10. Proficiency Calculation Rules



The system must follow these rules:



1\. Self-reported proficiency must not be treated as verified assessment results.

2\. Missing proficiency values must remain unclassified.

3\. Invalid proficiency values must be rejected or flagged.

4\. Different assessment methods must remain distinguishable.

5\. A score must use the correct assessment version.

6\. Thresholds must be configurable.

7\. Historical results must retain their original methodology.

8\. Evidence verification must be recorded separately.

9\. Expert classification must require sufficient evidence under the applicable assessment method.

10\. The system must not infer proficiency from the number of skills selected.



\### 10.1 Multiple Evidence Sources



If multiple sources provide proficiency information for the same student and skill, the platform must apply a defined precedence policy.



A possible policy is:



\- Keep self-reported proficiency as a separate claim.

\- Keep assessment-based proficiency as a separate result.

\- Keep faculty verification as a separate verification record.

\- Do not overwrite one source with another without preserving its origin.



The final dashboard may present the latest verified result alongside the student's claimed proficiency.



\---



\## 11. Department-Level Proficiency Analytics



The proficiency framework feeds the department analytics engine.



\### 11.1 Proficiency Distribution



For each skill, the system calculates the number and percentage of students in each proficiency category.



Example:



| Skill | Beginner | Intermediate | Expert |

|---|---:|---:|---:|

| Python | 40% | 45% | 15% |

| Linux | 55% | 35% | 10% |

| Networking | 30% | 50% | 20% |



These values are illustrative.



\### 11.2 Calculation



\\\[

P\_l = \\frac{N\_l}{N\_e} \\times 100

\\]



Where:



\- \\(P\_l\\) = Percentage of students at proficiency level \\(l\\).

\- \\(N\_l\\) = Number of eligible students classified at level \\(l\\).

\- \\(N\_e\\) = Number of eligible students with a valid proficiency result for that skill.



Students with missing or unclassified proficiency must not be silently included in the denominator.



The dashboard should display the participation and classification coverage alongside the percentages.



\### 11.3 Evidence-Based Segmentation



Analytics should support separate views for:



\- Self-reported proficiency.

\- Assessment-based proficiency.

\- Verified proficiency.



Combining these categories without clear labels would produce misleading institutional insights.



\---



\## 12. Skill Gap Analysis Integration



The proficiency framework supplies the current competency distribution used by the skill gap analysis engine.



The gap engine compares current proficiency against institutionally configured targets.



Example:



| Skill | Current Expert % | Target Expert % | Gap |

|---|---:|---:|---:|

| Python | 15% | 35% | 20 percentage points |

| Linux | 10% | 30% | 20 percentage points |

| Cloud Computing | 8% | 25% | 17 percentage points |



The target values are illustrative.



Gap analysis must consider:



\- Department relevance.

\- Skill importance.

\- Academic year.

\- Assessment participation.

\- Evidence type.

\- Proficiency target.

\- Skill-specific requirements.



A low percentage of Expert students does not automatically mean that every student requires advanced training.



\---



\## 13. Recommendation Engine Integration



The recommendation engine uses proficiency distribution and identified skill gaps to suggest development initiatives.



Illustrative mappings:



| Observed Condition | Potential Recommendation |

|---|---|

| High Beginner distribution | Foundational training |

| High Intermediate distribution with low Expert representation | Advanced practical workshop |

| Low assessment participation | Additional assessment or evidence collection |

| Low practical assessment scores | Hands-on laboratory training |

| Significant gap in a core departmental skill | Department-level development program |



Recommendations must include the evidence and rules that triggered them.



The engine should not recommend an advanced course solely because a student selected Beginner or Expert in a self-reported form.



\---



\## 14. Skill-Specific Proficiency Criteria



The three proficiency labels must be interpreted according to the skill being assessed.



Example: Cybersecurity



| Level | Expected Competency |

|---|---|

| Beginner | Understands security fundamentals and basic terminology |

| Intermediate | Can perform common security testing and analysis tasks |

| Expert | Can design security approaches, investigate complex issues, and evaluate technical trade-offs |



Example: Cloud Computing



| Level | Expected Competency |

|---|---|

| Beginner | Understands cloud concepts and basic service models |

| Intermediate | Can deploy and manage common cloud resources |

| Expert | Can design, optimize, and secure complex cloud architectures |



Example: Python



| Level | Expected Competency |

|---|---|

| Beginner | Understands syntax, variables, loops, functions, and basic data structures |

| Intermediate | Develops applications, uses libraries, handles exceptions, and writes reusable code |

| Expert | Designs complex applications, optimizes performance, and evaluates advanced implementation approaches |



These examples are illustrative. Final criteria should be approved by the relevant subject experts.



\---



\## 15. Data Structure



Proposed logical assessment result:



```json

{

&#x20; "student\_reference": "TEMP-STUDENT-001",

&#x20; "skill\_id": "SKL-0001",

&#x20; "claimed\_proficiency": "Intermediate",

&#x20; "assessed\_proficiency": "Beginner",

&#x20; "assessment\_score": 35,

&#x20; "evidence\_status": "Assessed",

&#x20; "assessment\_method": "Practical Assessment",

&#x20; "assessment\_version": "1.0",

&#x20; "assessed\_at": "2026-11-07T10:30:00",

&#x20; "verified\_by": null

}

```



This is an illustrative temporary data structure.



The actual implementation must distinguish between:



\- Student claims.

\- Assessment outcomes.

\- Evidence submissions.

\- Verification decisions.



The structure must not imply that a student has been faculty-verified merely because an assessment was completed.



\---



\## 16. Integration With Other Modules



| Module | Proficiency Framework Responsibility |

|---|---|

| Student Assessment | Collects claimed proficiency |

| Bulk Upload | Imports existing proficiency information |

| Validation | Checks proficiency values |

| Normalization | Maps approved proficiency labels |

| Session Management | Maintains temporary proficiency records |

| Skill Taxonomy | Identifies the skill being assessed |

| Proficiency Analysis | Calculates proficiency distributions |

| Department Analytics | Aggregates proficiency results |

| Skill Gap Analysis | Compares proficiency against targets |

| Recommendation Engine | Suggests development programs |

| HOD Dashboard | Displays department proficiency |

| Dean Dashboard | Displays institutional proficiency |

| Export Module | Includes authorized proficiency information |



\---



\## 17. Governance and Quality Assurance



The institution should define who is responsible for maintaining the framework.



| Responsibility | Suggested Owner |

|---|---|

| Proficiency definitions | Academic or subject-matter committee |

| Skill-specific criteria | Relevant department experts |

| Assessment design | Authorized faculty or assessment team |

| Score thresholds | Institutional academic authority |

| Evidence verification | Authorized faculty or reviewers |

| Framework configuration | Platform administrator |

| Framework review | Institutional academic committee |



Framework changes must be version-controlled.



A new threshold or assessment method must not silently change the interpretation of existing analysis results.



\---



\## 18. Security and Privacy Considerations



\- Student assessment results must remain within the temporary session lifecycle.

\- Only authorized users may access identifiable assessment results.

\- Aggregate dashboards should not expose individual student performance by default.

\- Evidence files must be protected from unauthorized access.

\- Verification actions must be restricted to authorized reviewers.

\- Sensitive assessment details must not be written into application logs.

\- Exports must enforce the same access controls as dashboards.

\- Assessment results must be removed according to the session retention policy.



\---



\## 19. Acceptance Criteria



The framework is considered implemented when:



\- Three proficiency levels are supported.

\- Each level has documented definitions.

\- Skill-specific assessment criteria can be configured.

\- Self-reported and assessed proficiency remain distinguishable.

\- Evidence status is tracked separately.

\- Missing proficiency values are handled correctly.

\- Assessment scores use configurable thresholds.

\- Department-level distributions are calculated correctly.

\- Gap analysis can use configured proficiency targets.

\- Recommendations can identify the proficiency evidence behind their decisions.

\- Historical analysis retains its original framework version.

\- Role-based access is enforced.



\---



\## 20. Open Decisions



| ID | Decision Required | Impact |

|---|---|---|

| PROF-OD-001 | Should initial assessment use self-reporting only or include structured tests? | Determines assessment implementation |

| PROF-OD-002 | Are the proposed 0–100 thresholds acceptable? | Determines score classification |

| PROF-OD-003 | Who approves skill-specific assessment criteria? | Determines academic governance |

| PROF-OD-004 | Will practical assessments be mandatory for Expert classification? | Determines evidence requirements |

| PROF-OD-005 | Should certifications contribute to proficiency classification or remain supporting evidence? | Determines evidence processing |

| PROF-OD-006 | Should faculty verification be included in the first release? | Determines reviewer workflow |

| PROF-OD-007 | Should assessment dimensions and weights differ by skill? | Determines assessment configuration |

| PROF-OD-008 | What is the policy for conflicting self-reported and assessed results? | Determines dashboard presentation |

| PROF-OD-009 | Should historical assessment results be compared across framework versions? | Determines analytical comparability |



\---



\## 21. Final Summary



The Proficiency Framework provides a standardized methodology for classifying student competencies.



It defines Beginner, Intermediate, and Expert levels while distinguishing between self-reported claims, assessment outcomes, supporting evidence, and verification status.



It supplies the proficiency information required by department analytics, skill gap analysis, and institutional development recommendations.



\*\*Core proficiency principle:\*\*



> Collect claims separately. Assess competencies consistently. Verify with evidence. Analyze without confusing confidence with capability.

