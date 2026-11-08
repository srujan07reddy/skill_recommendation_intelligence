import { apiClient } from './client';

export interface UserSummary {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  department_id?: string | null;
  department_name?: string | null;
  school_id?: string | null;
  school_code?: string | null;
  school_name?: string | null;
  must_change_password: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserSummary;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', payload);
  return response.data;
}

export async function getCurrentUser(): Promise<UserSummary> {
  const response = await apiClient.get<UserSummary>('/auth/me');
  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/auth/change-password', payload);
  return response.data;
}

export async function logoutApi(): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/auth/logout');
  return response.data;
}
