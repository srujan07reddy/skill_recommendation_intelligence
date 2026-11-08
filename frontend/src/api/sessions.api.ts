import { apiClient } from './client';

export interface SessionCreateRequest {
  session_name: string;
  session_type: string;
  department_id?: string;
  academic_year: string;
  expiry_hours: number;
}

export interface SessionResponse {
  session_id: string;
  session_name: string;
  session_type: string;
  status: string;
  department_id?: string;
  department_name?: string;
  academic_year: string;
  created_at: string;
  expiry_time: string;
  record_count: number;
  student_count: number;
}

export interface SessionStatusResponse {
  session_id: string;
  status: string;
  record_count: number;
  student_count: number;
  created_at: string;
  expiry_time: string;
}

export const sessionsApi = {
  createSession: async (data: SessionCreateRequest): Promise<SessionResponse> => {
    const res = await apiClient.post<SessionResponse>('/sessions', data);
    return res.data;
  },

  listSessions: async (departmentId?: string): Promise<SessionResponse[]> => {
    const params = departmentId ? { department_id: departmentId } : {};
    const res = await apiClient.get<SessionResponse[]>('/sessions', { params });
    return res.data;
  },

  getSession: async (sessionId: string): Promise<SessionResponse> => {
    const res = await apiClient.get<SessionResponse>(`/sessions/${sessionId}`);
    return res.data;
  },

  activateSession: async (sessionId: string): Promise<SessionResponse> => {
    const res = await apiClient.post<SessionResponse>(`/sessions/${sessionId}/activate`);
    return res.data;
  },

  closeSession: async (sessionId: string): Promise<SessionResponse> => {
    const res = await apiClient.post<SessionResponse>(`/sessions/${sessionId}/close`);
    return res.data;
  },

  getSessionStatus: async (sessionId: string): Promise<SessionStatusResponse> => {
    const res = await apiClient.get<SessionStatusResponse>(`/sessions/${sessionId}/status`);
    return res.data;
  },

  purgeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },
};

