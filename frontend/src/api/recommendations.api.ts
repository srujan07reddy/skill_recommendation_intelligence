import { apiClient } from './client';

export interface RoadmapShInfo {
  slug: string;
  title: string;
  roadmap_url: string;
  role_track: string;
  role_slug: string;
  role_url: string;
  prerequisites: string[];
  target_tier: string;
  milestones: string[];
  all_tiers?: Record<string, string[]>;
}

export interface RoadmapRoleNode {
  skill_name: string;
  status: 'MASTERED' | 'DEVELOPING' | 'MISSING' | string;
  student_count: number;
  coverage_percentage: number;
  actual_proficiency: number;
  target_proficiency: number;
  gap_severity: string;
  roadmap_slug: string;
  roadmap_url: string;
  prerequisites: string[];
  recommended_milestones: string[];
}

export interface RoadmapRoleTrackAnalysis {
  role_track: string;
  slug: string;
  roadmap_url: string;
  description: string;
  readiness_percentage: number;
  total_nodes: number;
  mastered_count: number;
  developing_count: number;
  missing_count: number;
  nodes: RoadmapRoleNode[];
}

export interface SessionRoadmapAnalysisResponse {
  session_id: string;
  department_code: string;
  department_name: string;
  section?: string | null;
  available_sections: string[];
  participating_students: number;
  role_tracks: RoadmapRoleTrackAnalysis[];
}

export interface RecommendationResponse {
  recommendation_id: string;
  session_id: string;
  department_id: string;
  department_code: string;
  department_name: string;
  skill_id: string;
  skill_code: string;
  skill_name: string;
  initiative_category: 'BOOTCAMP' | 'WORKSHOP' | 'PRACTICAL_LAB' | 'CERTIFICATION_PREP' | 'ADVANCED_TRAINING' | string;
  recommendation_title: string;
  recommendation_description: string;
  justification: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  need_type: string;
  target_cohort: string;
  suggested_duration: string;
  learning_objectives: string[];
  supporting_metrics: Record<string, any>;
  roadmap_sh?: RoadmapShInfo | null;
  rule_id: string;
  rule_version: string;
  status: string;
}

export interface RecommendationSummaryResponse {
  session_id: string;
  department_id?: string | null;
  department_code?: string | null;
  total_recommendations: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  category_breakdown: Record<string, number>;
  recommendations: RecommendationResponse[];
}

export const recommendationsApi = {
  getInstitutionalEvents: async (
    sessionId: string,
    includeDraft: boolean = false
  ): Promise<RecommendationSummaryResponse> => {
    const res = await apiClient.get<RecommendationSummaryResponse>(
      `/recommendations/${sessionId}/events`,
      { params: { include_draft: includeDraft } }
    );
    return res.data;
  },

  getDepartmentRecommendations: async (
    sessionId: string,
    departmentId: string,
    includeDraft: boolean = false
  ): Promise<RecommendationSummaryResponse> => {
    const res = await apiClient.get<RecommendationSummaryResponse>(
      `/recommendations/${sessionId}/departments/${departmentId}`,
      { params: { include_draft: includeDraft } }
    );
    return res.data;
  },

  generateRecommendations: async (
    sessionId: string,
    includeDraft: boolean = false,
    departmentId?: string
  ): Promise<RecommendationSummaryResponse> => {
    const res = await apiClient.post<RecommendationSummaryResponse>(
      `/recommendations/${sessionId}/generate`,
      {
        include_draft_benchmarks: includeDraft,
        target_department_id: departmentId,
      }
    );
    return res.data;
  },

  getRoadmapCatalog: async (): Promise<{
    provider: string;
    base_url: string;
    role_tracks: Array<{ role_track: string; slug: string; url: string; description: string; skills: string[] }>;
    skill_tracks: Array<any>;
  }> => {
    const res = await apiClient.get('/roadmaps/catalog');
    return res.data;
  },

  getSessionRoadmapAnalysis: async (
    sessionId: string,
    params?: { department_id?: string; section?: string; include_draft?: boolean }
  ): Promise<SessionRoadmapAnalysisResponse> => {
    const cleanParams: Record<string, any> = { include_draft: params?.include_draft ?? true };
    if (params?.department_id) cleanParams.department_id = params.department_id;
    if (params?.section && params.section !== 'ALL') cleanParams.section = params.section;
    const res = await apiClient.get<SessionRoadmapAnalysisResponse>(
      `/roadmaps/session/${sessionId}/analysis`,
      { params: cleanParams }
    );
    return res.data;
  },
};

