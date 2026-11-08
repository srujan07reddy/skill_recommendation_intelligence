import { apiClient } from './client';

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
};

