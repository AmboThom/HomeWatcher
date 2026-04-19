import { z } from 'zod';

export const createAssignmentSchema = z.object({
  tenant_id: z.string().uuid('Invalid tenant ID'),
  amount: z.number().int().min(1, 'Amount must be greater than 0'),
  due_day: z.number().int().min(1).max(31),
});

export const updateAssignmentSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be greater than 0').optional(),
  due_day: z.number().int().min(1).max(31).optional(),
});

export const createPaymentSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be greater than 0'),
  paid_at: z.string().datetime('paid_at must be a valid ISO 8601 datetime'),
  notes: z.string().max(500).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
