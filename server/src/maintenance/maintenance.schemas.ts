import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').max(2000),
  priority: z.enum(['low', 'medium', 'high']),
});

export const updateMaintenanceStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceStatusInput = z.infer<typeof updateMaintenanceStatusSchema>;
