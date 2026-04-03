import { api } from './api';

export interface Property {
  id: string;
  landlord_id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export async function fetchProperties(): Promise<Property[]> {
  const { data } = await api.get<Property[]>('/api/properties');
  return data;
}

export async function createProperty(input: { name: string; address: string }): Promise<Property> {
  const { data } = await api.post<Property>('/api/properties', input);
  return data;
}

export async function updateProperty(
  id: string,
  input: { name?: string; address?: string }
): Promise<Property> {
  const { data } = await api.patch<Property>(`/api/properties/${id}`, input);
  return data;
}

export async function deleteProperty(id: string): Promise<void> {
  await api.delete(`/api/properties/${id}`);
}

export interface TenantSummary {
  id: string;
  first_name: string;
  last_name: string;
}

export async function fetchPropertyTenants(propertyId: string): Promise<TenantSummary[]> {
  const { data } = await api.get<TenantSummary[]>(`/api/properties/${propertyId}/tenants`);
  return data;
}
