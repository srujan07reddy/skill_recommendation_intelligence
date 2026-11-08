import { apiClient } from './client';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  storage: {
    persistent_db: string;
    ephemeral_cache: string;
  };
}

export async function getSystemHealth(): Promise<HealthCheckResponse> {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
}

