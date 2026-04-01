import { z } from 'zod';

export const createInviteSchema = z.object({
  expires_at: z.string().datetime('expires_at must be a valid ISO 8601 datetime'),
  max_uses: z.number().int().min(1, 'max_uses must be at least 1'),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

export const redeemInviteSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

export type RedeemInviteInput = z.infer<typeof redeemInviteSchema>;
