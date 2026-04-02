import { api } from './api';

export interface Invite {
  id: string;
  property_id: string;
  code: string;
  expires_at: string;
  max_uses: number;
  uses_count: number;
  created_at: string;
}

export async function fetchInvites(propertyId: string): Promise<Invite[]> {
  const { data } = await api.get<Invite[]>(`/api/properties/${propertyId}/invites`);
  return data;
}

export async function generateInvite(
  propertyId: string,
  input: { expires_at: string; max_uses: number }
): Promise<Invite> {
  const { data } = await api.post<Invite>(`/api/properties/${propertyId}/invites`, input);
  return data;
}

export async function revokeInvite(propertyId: string, code: string): Promise<void> {
  await api.delete(`/api/properties/${propertyId}/invites/${code}`);
}
