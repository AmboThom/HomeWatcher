import { z } from 'zod';

export const createInviteSchema = z.object({
  expires_at: z.string().datetime('expires_at must be a valid ISO 8601 datetime'),
  max_uses: z.number().int().min(1, 'max_uses must be at least 1'),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

export const redeemInviteSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid invite code format'),
});

export type RedeemInviteInput = z.infer<typeof redeemInviteSchema>;
