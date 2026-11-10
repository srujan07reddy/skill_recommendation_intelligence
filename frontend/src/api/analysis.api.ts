import { apiClient } from './client';

export interface SkillProficiencyDistribution {
  beginner_count: number;
  beginner_percentage: float;
  intermediate_count: number;
  intermediate_percentage: float;
  expert_count: number;
  expert_percentage: float;
  total_classified: number;
}

// Helper float type
type float = number;

export interface SkillDistributionItem {
  skill_id: string;
  skill_code: string;
  skill_name: string;
  category_name?: string;
  domain_name?: string;
  student_count: number;
  coverage_percentage: number;
  average_numeric_proficiency: number;
  proficiency_distribution: SkillProficiencyDistribution;
}

export interface DepartmentSkillAnalytics {
  session_id: string;
  department_id: string;
  department_code: string;
  department_name: string;
  section?: string | null;
  available_sections?: string[];
  total_eligible_students: number;
  participating_students: number;
  participation_rate: number;
  skills_count: number;
  skills: SkillDistributionItem[];
}

export interface InstitutionalSkillAnalytics {
  session_id: string;
  session_name: string;
  academic_year: string;
  total_participating_students: number;
  distinct_skills_evaluated: number;
  department_summaries: Array<{
    department_id: string;
    department_code: string;
    department_name: string;
    participating_students: number;
    distinct_skills_count: number;
    total_records: number;
    average_proficiency: number;
  }>;
  top_skills: SkillDistributionItem[];
}

export interface SkillGapItem {
  mapping_id?: string;
  skill_id: string;
  skill_code: string;
  skill_name: string;
  department_id: string;
  department_code: string;
  relevance_type: string;
  target_proficiency: number;
  actual_average_proficiency: number;
  proficiency_gap: number;
  target_coverage: number;
  actual_coverage: number;
  coverage_gap: number;
  priority_weight: number;
  gap_score: number;
  gap_severity: 'CRITICAL' | 'MODERATE' | 'MINOR' | 'SATISFIED' | string;
  benchmark_status: 'DRAFT' | 'APPROVED' | 'ARCHIVED' | string;
}

export interface DepartmentGapReport {
  session_id: string;
  department_id: string;
  department_code: string;
  department_name: string;
  section?: string | null;
  available_sections?: string[];
  benchmarks_evaluated: number;
  approved_benchmarks_count: number;
  draft_benchmarks_count: number;
  critical_gaps_count: number;
  moderate_gaps_count: number;
  satisfied_count: number;
  gaps: SkillGapItem[];
}

export interface StudentSkillHave {
  skill_id: string;
  skill_name: string;
  proficiency_level: string;
  numeric_proficiency: number;
  raw_score?: number | null;
}

export interface StudentSkillGapItem {
  skill_name: string;
  relevance_type: string;
  target_proficiency: number;
  current_proficiency: number;
  gap_delta: number;
  status: 'MISSING' | 'BELOW_TARGET' | 'MEETS_TARGET' | string;
}

export interface StudentStudyItem {
  skill_name: string;
  action_type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  study_focus: string;
  roadmap_slug?: string | null;
  roadmap_url?: string | null;
  roadmap_topics?: string[];
}

export interface StudentEvaluationSummary {
  session_student_ref: string;
  section: string;
  department_code: string;
  average_proficiency: number;
  readiness_status: 'NEEDS_CORE_STUDY' | 'DEVELOPING' | 'BENCHMARK_READY' | string;
  skills_have: StudentSkillHave[];
  skill_gaps: StudentSkillGapItem[];
  what_to_study: StudentStudyItem[];
}

export interface SectionEvaluationResponse {
  session_id: string;
  department_id: string;
  department_code: string;
  department_name: string;
  selected_section?: string | null;
  available_sections: string[];
  total_students: number;
  total_records: number;
  what_they_have: SkillDistributionItem[];
  gap_report: DepartmentGapReport;
  cohort_study_roadmap: Array<Record<string, any>>;
  student_evaluations: StudentEvaluationSummary[];
}

export interface InstitutionalGapReport {
  session_id: string;
  session_name: string;
  total_benchmarks_evaluated: number;
  total_critical_gaps: number;
  total_moderate_gaps: number;
  department_gap_summaries: Array<Record<string, any>>;
  priority_gaps: SkillGapItem[];
}

export interface BenchmarkResponse {
  mapping_id: string;
  department_id: string;
  department_code: string;
  department_name: string;
  skill_id: string;
  skill_code: string;
  skill_name: string;
  relevance_type: string;
  target_proficiency: number;
  minimum_coverage: number;
  priority_weight: number;
  status: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
  approved_by?: string | null;
  approved_at?: string | null;
  justification?: string | null;
}

export const analysisApi = {
  getInstitutionalDistribution: async (sessionId: string, schoolId?: string): Promise<InstitutionalSkillAnalytics> => {
    const params = schoolId ? { school_id: schoolId } : {};
    const res = await apiClient.get<InstitutionalSkillAnalytics>(`/analysis/${sessionId}/distribution`, { params });
    return res.data;
  },

  getDepartmentAnalytics: async (
    sessionId: string,
    departmentId: string,
    section?: string
  ): Promise<DepartmentSkillAnalytics> => {
    const params = section && section !== 'ALL' ? { section } : {};
    const res = await apiClient.get<DepartmentSkillAnalytics>(
      `/analysis/${sessionId}/departments/${departmentId}`,
      { params }
    );
    return res.data;
  },

  getSectionEvaluation: async (
    sessionId: string,
    departmentId: string,
    section?: string,
    includeDraft: boolean = true
  ): Promise<SectionEvaluationResponse> => {
    const params: Record<string, any> = { include_draft: includeDraft };
    if (section && section !== 'ALL') params.section = section;
    const res = await apiClient.get<SectionEvaluationResponse>(
      `/analysis/${sessionId}/departments/${departmentId}/section-evaluation`,
      { params }
    );
    return res.data;
  },

  getDepartmentGaps: async (
    sessionId: string,
    departmentId?: string,
    includeDraft: boolean = false,
    section?: string
  ): Promise<DepartmentGapReport> => {
    const params: Record<string, any> = { include_draft: includeDraft };
    if (departmentId) params.department_id = departmentId;
    if (section && section !== 'ALL') params.section = section;
    const res = await apiClient.get<DepartmentGapReport>(`/analysis/${sessionId}/gaps`, { params });
    return res.data;
  },

  getInstitutionalGaps: async (
    sessionId: string,
    includeDraft: boolean = false
  ): Promise<InstitutionalGapReport> => {
    const res = await apiClient.get<InstitutionalGapReport>(`/analysis/${sessionId}/gaps`, {
      params: { include_draft: includeDraft },
    });
    return res.data;
  },

  listBenchmarks: async (departmentId?: string, status?: string): Promise<BenchmarkResponse[]> => {
    const params: Record<string, any> = {};
    if (departmentId) params.department_id = departmentId;
    if (status) params.status = status;
    const res = await apiClient.get<BenchmarkResponse[]>('/benchmarks', { params });
    return res.data;
  },

  approveBenchmark: async (mappingId: string, justification?: string): Promise<BenchmarkResponse> => {
    const res = await apiClient.post<BenchmarkResponse>(`/benchmarks/${mappingId}/approve`, {
      justification,
    });
    return res.data;
  },

  bulkApproveBenchmarks: async (
    departmentId: string,
    justification?: string
  ): Promise<{ department_id: string; approved_count: number; status: string; message: string }> => {
    const res = await apiClient.post(`/benchmarks/departments/${departmentId}/approve-all`, {
      justification,
    });
    return res.data;
  },
};

