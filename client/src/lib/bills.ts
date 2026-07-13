import { api } from './api';

export const BILL_CATEGORIES = [
  'electricity',
  'gas',
  'water',
  'internet',
  'council_tax',
  'insurance',
  'service_charge',
  'maintenance',
  'other',
] as const;

export const BILL_FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'annually'] as const;

export type BillCategory = (typeof BILL_CATEGORIES)[number];
export type BillFrequency = (typeof BILL_FREQUENCIES)[number];

export const CATEGORY_LABELS: Record<BillCategory, string> = {
  electricity: 'Electricity',
  gas: 'Gas',
  water: 'Water',
  internet: 'Internet',
  council_tax: 'Council tax',
  insurance: 'Insurance',
  service_charge: 'Service charge',
  maintenance: 'Maintenance',
  other: 'Other',
};

export const FREQUENCY_LABELS: Record<BillFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
};

export interface Bill {
  id: string;
  property_id: string;
  created_by_id: string;
  payee: string;
  category: BillCategory;
  amount: number; // stored in cents
  paid_at: string;
  due_date: string | null;
  is_recurring: boolean;
  frequency: BillFrequency | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // present in the landlord listing only
  first_name?: string;
  last_name?: string;
}

export interface CreateBillInput {
  payee: string;
  category: BillCategory;
  amount: number; // cents
  paid_at: string; // YYYY-MM-DD
  due_date?: string;
  is_recurring: boolean;
  frequency?: BillFrequency;
  notes?: string;
}

export async function createBill(propertyId: string, input: CreateBillInput): Promise<Bill> {
  const { data } = await api.post<Bill>(`/api/bills/properties/${propertyId}`, input);
  return data;
}

export async function fetchBillsByProperty(propertyId: string): Promise<Bill[]> {
  const { data } = await api.get<Bill[]>(`/api/bills/properties/${propertyId}`);
  return data;
}

export async function updateBill(
  billId: string,
  input: Partial<CreateBillInput>
): Promise<Bill> {
  const { data } = await api.patch<Bill>(`/api/bills/${billId}`, input);
  return data;
}

export async function deleteBill(billId: string): Promise<void> {
  await api.delete(`/api/bills/${billId}`);
}
