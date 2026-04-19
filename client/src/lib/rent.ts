import { api } from './api';

export interface RentAssignment {
  id: string;
  property_id: string;
  tenant_id: string;
  amount: number; // stored in pence
  due_day: number;
  created_at: string;
  updated_at: string;
}

export interface RentPayment {
  id: string;
  assignment_id: string;
  amount: number; // stored in pence
  paid_at: string;
  notes: string | null;
  recorded_by_id: string;
  created_at: string;
}

// Convert pounds to pence
export function toPence(pounds: number): number {
  return Math.round(pounds * 100);
}

// Convert cents to dollars display string
export function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Landlord ───────────────────────────────────────────────────────

export async function createAssignment(
  propertyId: string,
  input: { tenant_id: string; amount: number; due_day: number }
): Promise<RentAssignment> {
  const { data } = await api.post<RentAssignment>(
    `/api/rent/properties/${propertyId}/assignments`,
    input
  );
  return data;
}

export async function updateAssignment(
  assignmentId: string,
  input: { amount?: number; due_day?: number }
): Promise<RentAssignment> {
  const { data } = await api.patch<RentAssignment>(
    `/api/rent/assignments/${assignmentId}`,
    input
  );
  return data;
}

export async function fetchAssignmentsByProperty(propertyId: string): Promise<RentAssignment[]> {
  const { data } = await api.get<RentAssignment[]>(
    `/api/rent/properties/${propertyId}/assignments`
  );
  return data;
}

export async function logPaymentAsLandlord(
  assignmentId: string,
  input: { amount: number; paid_at: string; notes?: string }
): Promise<RentPayment> {
  const { data } = await api.post<RentPayment>(
    `/api/rent/assignments/${assignmentId}/payments`,
    input
  );
  return data;
}

export async function fetchPaymentsByAssignment(assignmentId: string): Promise<RentPayment[]> {
  const { data } = await api.get<RentPayment[]>(
    `/api/rent/assignments/${assignmentId}/payments`
  );
  return data;
}

// ── Tenant ─────────────────────────────────────────────────────────

export async function fetchMyAssignment(): Promise<RentAssignment | null> {
  const { data } = await api.get<RentAssignment | null>('/api/rent/my/assignment');
  return data;
}

export async function logPaymentAsTenant(
  input: { amount: number; paid_at: string; notes?: string }
): Promise<RentPayment> {
  const { data } = await api.post<RentPayment>('/api/rent/my/payments', input);
  return data;
}

export async function fetchMyPayments(): Promise<RentPayment[]> {
  const { data } = await api.get<RentPayment[]>('/api/rent/my/payments');
  return data;
}
