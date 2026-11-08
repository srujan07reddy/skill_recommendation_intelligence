import { apiClient } from './client';

export type ExportMode = 'REPORTS_ONLY' | 'COMPLETE_ANALYSIS';
export type ExportFormat = 'PDF' | 'XLSX' | 'CSV' | 'ZIP';

export interface ExportCreateRequest {
  export_mode: ExportMode;
  format: ExportFormat;
  department_id?: string;
  include_original_upload?: boolean;
  include_identifiable_data?: boolean;
  analysis_revision?: number;
}

export interface ExportMetadataResponse {
  export_id: string;
  session_id: string;
  session_name: string;
  export_mode: string;
  format: string;
  department_id?: string | null;
  department_name?: string | null;
  filename: string;
  file_size_bytes: number;
  sha256_hash: string;
  download_url: string;
  download_token: string;
  created_at: string;
  expires_at: string;
  status: string;
}

export const exportsApi = {
  createExport: async (
    sessionId: string,
    data: ExportCreateRequest
  ): Promise<ExportMetadataResponse> => {
    const res = await apiClient.post<ExportMetadataResponse>(`/sessions/${sessionId}/exports`, data);
    return res.data;
  },

  listExports: async (sessionId?: string): Promise<ExportMetadataResponse[]> => {
    const params: Record<string, any> = {};
    if (sessionId) params.session_id = sessionId;
    const res = await apiClient.get<ExportMetadataResponse[]>('/exports', { params });
    return res.data;
  },

  deleteExport: async (exportId: string): Promise<void> => {
    await apiClient.delete(`/exports/${exportId}`);
  },
};

