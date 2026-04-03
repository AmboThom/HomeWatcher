import { Request, Response, NextFunction } from 'express';
import { createMaintenanceSchema, updateMaintenanceStatusSchema } from './maintenance.schemas';
import {
  createRequest,
  getRequestsByProperty,
  getRequestsByTenant,
  updateRequestStatus,
} from './maintenance.service';

export async function submitRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createMaintenanceSchema.parse(req.body);
    const request = await createRequest(req.user!.id, req.params.propertyId, input);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function listByProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await getRequestsByProperty(req.params.propertyId, req.user!.id);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function listByTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await getRequestsByTenant(req.user!.id);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateMaintenanceStatusSchema.parse(req.body);
    const request = await updateRequestStatus(req.params.requestId, req.user!.id, input);
    res.json(request);
  } catch (err) {
    next(err);
  }
}
