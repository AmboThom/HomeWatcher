import { z } from 'zod';

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

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createBillSchema = z
  .object({
    payee: z.string().min(1, 'Payee is required').max(200),
    category: z.enum(BILL_CATEGORIES),
    amount: z.number().int().min(1, 'Amount must be greater than 0'),
    paid_at: dateString,
    due_date: dateString.optional(),
    is_recurring: z.boolean().default(false),
    frequency: z.enum(BILL_FREQUENCIES).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => !v.is_recurring || !!v.frequency, {
    message: 'Frequency is required for recurring bills',
    path: ['frequency'],
  });

export const updateBillSchema = z
  .object({
    payee: z.string().min(1).max(200).optional(),
    category: z.enum(BILL_CATEGORIES).optional(),
    amount: z.number().int().min(1, 'Amount must be greater than 0').optional(),
    paid_at: dateString.optional(),
    due_date: dateString.optional(),
    is_recurring: z.boolean().optional(),
    frequency: z.enum(BILL_FREQUENCIES).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => v.is_recurring !== true || !!v.frequency, {
    message: 'Frequency is required for recurring bills',
    path: ['frequency'],
  });

export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
