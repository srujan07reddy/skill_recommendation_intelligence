import { apiClient } from './client';

export type ProposalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'DEFERRED';

export interface ProposalResponse {
  proposal_id: string;
  session_id: string;
  department_id: string;
  department_code: string;
  department_name: string;
  proposal_title: string;
  initiative_category: string;
  target_cohort: string;
  learning_outcomes: string[];
  justification: string;
  proposed_duration_weeks: number;
  estimated_cost: number;
  recommendation_id?: string | null;
  status: ProposalStatus;
  submitted_by?: string | null;
  submitted_at?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  decision_remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalCreateRequest {
  session_id: string;
  department_id: string;
  proposal_title: string;
  initiative_category: 'BOOTCAMP' | 'WORKSHOP' | 'CERTIFICATION_PREP' | 'PRACTICAL_LAB';
  target_cohort: string;
  learning_outcomes: string[];
  justification: string;
  proposed_duration_weeks: number;
  estimated_cost: number;
  recommendation_id?: string | null;
}

export interface ProposalDecisionRequest {
  decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'DEFERRED';
  remarks?: string;
}

export const governanceApi = {
  createProposal: async (data: ProposalCreateRequest): Promise<ProposalResponse> => {
    const res = await apiClient.post<ProposalResponse>('/governance/proposals', data);
    return res.data;
  },

  listProposals: async (sessionId?: string, departmentId?: string): Promise<ProposalResponse[]> => {
    const params: Record<string, any> = {};
    if (sessionId) params.session_id = sessionId;
    if (departmentId) params.department_id = departmentId;
    const res = await apiClient.get<ProposalResponse[]>('/governance/proposals', { params });
    return res.data;
  },

  getProposal: async (proposalId: string): Promise<ProposalResponse> => {
    const res = await apiClient.get<ProposalResponse>(`/governance/proposals/${proposalId}`);
    return res.data;
  },

  submitProposal: async (proposalId: string): Promise<ProposalResponse> => {
    const res = await apiClient.post<ProposalResponse>(`/governance/proposals/${proposalId}/submit`);
    return res.data;
  },

  recordDecision: async (proposalId: string, decision: ProposalDecisionRequest): Promise<ProposalResponse> => {
    const res = await apiClient.post<ProposalResponse>(`/governance/proposals/${proposalId}/decision`, decision);
    return res.data;
  },
};

