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

export interface StaffCredentialItem {
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  role: 'Dean' | 'HOD' | string;
  school_id?: string | null;
  school_code?: string | null;
  school_name?: string | null;
  department_id?: string | null;
  department_code?: string | null;
  department_name?: string | null;
  account_status: 'Active' | 'Disabled' | string;
  must_change_password: boolean;
}

export interface SchoolCreateRequest {
  school_code: string;
  school_name: string;
  description?: string;
}

export interface DepartmentCreateRequest {
  school_id: string;
  department_code: string;
  department_name: string;
  program_code?: string;
  program_name?: string;
  qualification?: string;
}

export interface DeanCreateRequest {
  school_id: string;
  full_name: string;
  email: string;
  username?: string;
  password: string;
  must_change_password?: boolean;
  replace_existing?: boolean;
}

export interface HodCreateRequest {
  department_id: string;
  full_name: string;
  email: string;
  username?: string;
  password: string;
  must_change_password?: boolean;
}

export interface DeanUpdateRequest {
  full_name?: string;
  email?: string;
  username?: string;
  school_id?: string;
  password?: string;
  account_status?: 'Active' | 'Disabled';
  must_change_password?: boolean;
  replace_existing?: boolean;
}

export interface HodUpdateRequest {
  full_name?: string;
  email?: string;
  username?: string;
  department_id?: string;
  password?: string;
  account_status?: 'Active' | 'Disabled';
  must_change_password?: boolean;
}

export const adminApi = {
  getAcademicStructure: async (): Promise<SchoolItem[]> => {
    const res = await apiClient.get<SchoolItem[]>('/admin/schools');
    return res.data;
  },

  createSchool: async (payload: SchoolCreateRequest): Promise<SchoolItem> => {
    const res = await apiClient.post<SchoolItem>('/admin/schools', payload);
    return res.data;
  },

  createDepartment: async (payload: DepartmentCreateRequest): Promise<DepartmentItem> => {
    const res = await apiClient.post<DepartmentItem>('/admin/departments', payload);
    return res.data;
  },

  listDeans: async (schoolId?: string): Promise<StaffCredentialItem[]> => {
    const params = schoolId ? { school_id: schoolId } : {};
    const res = await apiClient.get<StaffCredentialItem[]>('/admin/deans', { params });
    return res.data;
  },

  createDean: async (payload: DeanCreateRequest): Promise<StaffCredentialItem> => {
    const res = await apiClient.post<StaffCredentialItem>('/admin/deans', payload);
    return res.data;
  },

  updateDean: async (userId: string, payload: DeanUpdateRequest): Promise<StaffCredentialItem> => {
    const res = await apiClient.patch<StaffCredentialItem>(`/admin/deans/${userId}`, payload);
    return res.data;
  },

  listHods: async (schoolId?: string): Promise<StaffCredentialItem[]> => {
    const params = schoolId ? { school_id: schoolId } : {};
    const res = await apiClient.get<StaffCredentialItem[]>('/admin/hods', { params });
    return res.data;
  },

  createHod: async (payload: HodCreateRequest): Promise<StaffCredentialItem> => {
    const res = await apiClient.post<StaffCredentialItem>('/admin/hods', payload);
    return res.data;
  },

  updateHod: async (userId: string, payload: HodUpdateRequest): Promise<StaffCredentialItem> => {
    const res = await apiClient.patch<StaffCredentialItem>(`/admin/hods/${userId}`, payload);
    return res.data;
  },

  updateUserStatus: async (userId: string, account_status: 'Active' | 'Disabled'): Promise<any> => {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, { account_status });
    return res.data;
  },

  resetUserPassword: async (userId: string, new_password: string, must_change_password = false): Promise<any> => {
    const res = await apiClient.post(`/admin/users/${userId}/reset-password`, {
      new_password,
      must_change_password,
    });
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

