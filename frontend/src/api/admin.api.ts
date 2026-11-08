import { apiClient } from './client';

export interface ProgramItem {
  program_id: string;
  program_code: string;
  program_name: string;
  qualification: string;
  is_active: boolean;
}

export interface DepartmentItem {
  department_id: string;
  department_code: string;
  department_name: string;
  is_active: boolean;
  programs: ProgramItem[];
}

export interface SchoolItem {
  school_id: string;
  school_code: string;
  school_name: string;
  is_active: boolean;
  departments: DepartmentItem[];
}

export interface SkillItem {
  skill_id: string;
  skill_code: string;
  skill_name: string;
  description?: string;
  aliases: string[];
  is_active: boolean;
}

export interface CategoryItem {
  category_id: string;
  category_code: string;
  category_name: string;
  skills: SkillItem[];
}

export interface DomainItem {
  domain_id: string;
  domain_code: string;
  domain_name: string;
  categories: CategoryItem[];
}

export interface TelemetryResponse {
  platform: string;
  version: string;
  institutional_scope: string;
  privacy_enforcement: string;
  sessions_lifecycle: {
    total_active_windows: number;
    breakdown: Record<string, number>;
  };
  persistent_counts: {
    active_users: number;
    departments: number;
    approved_skills: number;
  };
  ephemeral_storage: {
    session_buffer: string;
    temp_export_files_count: number;
    temp_export_disk_bytes: number;
  };
}

export const adminApi = {
  getAcademicStructure: async (): Promise<SchoolItem[]> => {
    const res = await apiClient.get<SchoolItem[]>('/admin/schools');
    return res.data;
  },

  getTaxonomyExplorer: async (): Promise<DomainItem[]> => {
    const res = await apiClient.get<DomainItem[]>('/admin/taxonomy');
    return res.data;
  },

  getTelemetry: async (): Promise<TelemetryResponse> => {
    const res = await apiClient.get<TelemetryResponse>('/admin/telemetry');
    return res.data;
  },

  triggerCleanupSweep: async (): Promise<any> => {
    const res = await apiClient.post('/admin/cleanup/sweep');
    return res.data;
  },

  purgeSession: async (sessionId: string): Promise<any> => {
    const res = await apiClient.post(`/sessions/${sessionId}/purge`);
    return res.data;
  },
};

