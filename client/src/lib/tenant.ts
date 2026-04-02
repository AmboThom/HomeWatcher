import { api } from './api';
import type { Property } from './properties';

export async function fetchTenantProperties(): Promise<Property[]> {
  const { data } = await api.get<Property[]>('/api/tenant/properties');
  return data;
}

export async function redeemInvite(code: string): Promise<Property> {
  const { data } = await api.post<Property>('/api/invites/redeem', { code });
  return data;
}
