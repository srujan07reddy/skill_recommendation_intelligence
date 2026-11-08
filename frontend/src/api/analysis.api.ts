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
  benchmarks_evaluated: number;
  approved_benchmarks_count: number;
  draft_benchmarks_count: number;
  critical_gaps_count: number;
  moderate_gaps_count: number;
  satisfied_count: number;
  gaps: SkillGapItem[];
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

  getDepartmentAnalytics: async (sessionId: string, departmentId: string): Promise<DepartmentSkillAnalytics> => {
    const res = await apiClient.get<DepartmentSkillAnalytics>(`/analysis/${sessionId}/departments/${departmentId}`);
    return res.data;
  },

  getDepartmentGaps: async (
    sessionId: string,
    departmentId?: string,
    includeDraft: boolean = false
  ): Promise<DepartmentGapReport> => {
    const params: Record<string, any> = { include_draft: includeDraft };
    if (departmentId) params.department_id = departmentId;
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

