import { apiClient } from './client';

export interface SkillAssessmentItem {
  skill_name: string;
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | string;
  experience_type?: string[];
  evidence_description?: string;
}

export interface StudentAssessmentSubmission {
  student_identifier: string;
  department_code: string;
  program_code?: string;
  skills: SkillAssessmentItem[];
}

export interface StudentAssessmentResponse {
  submission_id: string;
  session_id: string;
  session_student_ref: string;
  recorded_skills_count: number;
  submitted_at: string;
  status: string;
  message: string;
}

export interface TaxonomyFormResponse {
  session_id: string;
  session_name: string;
  allowed_proficiency_levels: string[];
  departments: Array<{ department_code: string; department_name: string }>;
  available_skills: Array<{
    skill_id: string;
    skill_code: string;
    skill_name: string;
    category_name: string;
  }>;
}

export const assessmentsApi = {
  getAssessmentForm: async (sessionId: string): Promise<TaxonomyFormResponse> => {
    const res = await apiClient.get<TaxonomyFormResponse>(
      `/sessions/${sessionId}/assessments/form`
    );
    return res.data;
  },

  submitAssessment: async (
    sessionId: string,
    data: StudentAssessmentSubmission
  ): Promise<StudentAssessmentResponse> => {
    const res = await apiClient.post<StudentAssessmentResponse>(
      `/sessions/${sessionId}/assessments/submit`,
      data
    );
    return res.data;
  },
};

