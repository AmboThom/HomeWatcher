import { Request, Response, NextFunction } from 'express';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  createPaymentSchema,
} from './rent.schemas';
import {
  createAssignment,
  updateAssignment,
  getAssignmentsByProperty,
  getAssignmentByTenant,
  createPayment,
  getPaymentsByAssignment,
} from './rent.service';

// ── Landlord ───────────────────────────────────────────────────────

export async function assignRent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createAssignmentSchema.parse(req.body);
    const assignment = await createAssignment(req.params.propertyId, req.user!.id, input);
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function updateRent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateAssignmentSchema.parse(req.body);
    const assignment = await updateAssignment(req.params.assignmentId, req.user!.id, input);
    res.json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignments = await getAssignmentsByProperty(req.params.propertyId, req.user!.id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

export async function logPaymentAsLandlord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createPaymentSchema.parse(req.body);
    const payment = await createPayment(req.params.assignmentId, req.user!.id, input);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

// ── Tenant ─────────────────────────────────────────────────────────

export async function getMyAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await getAssignmentByTenant(req.user!.id);
    res.json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function logPaymentAsTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createPaymentSchema.parse(req.body);
    const assignment = await getAssignmentByTenant(req.user!.id);
    if (!assignment) {
      res.status(404).json({ status: 'error', message: 'No rent assignment found' });
      return;
    }
    const payment = await createPayment(assignment.id, req.user!.id, input);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

export async function listMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await getAssignmentByTenant(req.user!.id);
    if (!assignment) {
      res.json([]);
      return;
    }
    const payments = await getPaymentsByAssignment(assignment.id);
    res.json(payments);
  } catch (err) {
    next(err);
  }
}

export async function listPaymentsByAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payments = await getPaymentsByAssignment(req.params.assignmentId);
    res.json(payments);
  } catch (err) {
    next(err);
  }
}
