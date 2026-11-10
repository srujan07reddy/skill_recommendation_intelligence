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
  session_id?: string | null;
  filename: string;
  validation_status: 'VALID' | 'INVALID' | 'WARNINGS';
  total_rows: number;
  valid_rows_count: number;
  error_rows_count: number;
  warning_rows_count: number;
  sections_detected?: string[];
  format_detected?: 'LONG' | 'WIDE';
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
  uploadDataset: async (
    sessionId: string,
    file: File,
    section?: string
  ): Promise<ValidationReportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (section && section.trim()) {
      formData.append('section', section.trim());
    }

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

  directBulkUpload: async (
    file: File,
    options?: {
      section?: string;
      sessionId?: string;
      sessionName?: string;
      academicYear?: string;
    }
  ): Promise<ValidationReportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.section && options.section.trim()) {
      formData.append('section', options.section.trim());
    }
    if (options?.sessionId && options.sessionId.trim()) {
      formData.append('session_id', options.sessionId.trim());
    }
    if (options?.sessionName && options.sessionName.trim()) {
      formData.append('session_name', options.sessionName.trim());
    }
    if (options?.academicYear) {
      formData.append('academic_year', options.academicYear);
    }

    const res = await apiClient.post<ValidationReportResponse>(
      `/uploads/direct`,
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

