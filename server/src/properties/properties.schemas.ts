import { z } from 'zod';

export const createPropertySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  address: z.string().min(1, 'Address is required').max(500),
});

export const updatePropertySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  address: z.string().min(1, 'Address is required').max(500).optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
