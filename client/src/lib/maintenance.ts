import { api } from './api';

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export async function submitRequest(
  propertyId: string,
  input: { title: string; description: string; priority: 'low' | 'medium' | 'high' }
): Promise<MaintenanceRequest> {
  const { data } = await api.post<MaintenanceRequest>(
    `/api/maintenance/properties/${propertyId}/requests`,
    input
  );
  return data;
}

export async function fetchTenantRequests(): Promise<MaintenanceRequest[]> {
  const { data } = await api.get<MaintenanceRequest[]>('/api/maintenance/requests');
  return data;
}

export async function fetchPropertyRequests(propertyId: string): Promise<MaintenanceRequest[]> {
  const { data } = await api.get<MaintenanceRequest[]>(
    `/api/maintenance/properties/${propertyId}/requests`
  );
  return data;
}

export async function updateRequestStatus(
  requestId: string,
  status: 'open' | 'in_progress' | 'resolved'
): Promise<MaintenanceRequest> {
  const { data } = await api.patch<MaintenanceRequest>(
    `/api/maintenance/requests/${requestId}/status`,
    { status }
  );
  return data;
}
