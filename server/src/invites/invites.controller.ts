import { Request, Response, NextFunction } from 'express';
import { createInviteSchema } from './invites.schemas';
import { createInvite, listInvites, revokeInvite, redeemInvite } from './invites.service';
import { redeemInviteSchema } from './invites.schemas';

export async function redeem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = redeemInviteSchema.parse(req.body);
    const property = await redeemInvite(req.user!.id, code);
    res.status(200).json(property);
  } catch (err) {
    next(err);
  }
}

export async function revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await revokeInvite(req.params.id, req.user!.id, req.params.code);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invites = await listInvites(req.params.id, req.user!.id);
    res.json(invites);
  } catch (err) {
    next(err);
  }
}

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createInviteSchema.parse(req.body);
    const invite = await createInvite(req.params.id, req.user!.id, input);
    res.status(201).json(invite);
  } catch (err) {
    next(err);
  }
}
