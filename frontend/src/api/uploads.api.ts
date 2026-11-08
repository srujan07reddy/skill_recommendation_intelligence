import { apiClient } from './client';

export interface RowValidationError {
  row_index: number;
  column: string;
  value?: string | null;
  severity: 'ERROR' | 'WARNING';
  message: string;
}

export interface ValidationReportResponse {
  upload_id: string;
  filename: string;
  validation_status: 'VALID' | 'INVALID' | 'WARNINGS';
  total_rows: number;
  valid_rows_count: number;
  error_rows_count: number;
  warning_rows_count: number;
  errors: RowValidationError[];
  sample_valid_rows: Record<string, any>[];
}

export interface UploadConfirmResponse {
  session_id: string;
  upload_id: string;
  committed_records_count: number;
  status: string;
  message: string;
}

export const uploadsApi = {
  uploadDataset: async (sessionId: string, file: File): Promise<ValidationReportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ValidationReportResponse>(
      `/sessions/${sessionId}/uploads`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  getUploadPreview: async (sessionId: string, uploadId: string): Promise<ValidationReportResponse> => {
    const res = await apiClient.get<ValidationReportResponse>(
      `/sessions/${sessionId}/uploads/${uploadId}/preview`
    );
    return res.data;
  },

  confirmUpload: async (sessionId: string, uploadId: string): Promise<UploadConfirmResponse> => {
    const res = await apiClient.post<UploadConfirmResponse>(
      `/sessions/${sessionId}/uploads/${uploadId}/confirm`
    );
    return res.data;
  },
};

