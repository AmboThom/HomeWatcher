import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validateUuid } from '../middleware/validateUuid';
import {
  assignRent,
  updateRent,
  listAssignments,
  logPaymentAsLandlord,
  listPaymentsByAssignment,
  getMyAssignment,
  logPaymentAsTenant,
  listMyPayments,
} from './rent.controller';

const router = Router();

// ── Landlord ───────────────────────────────────────────────────────
router.post('/properties/:propertyId/assignments', validateUuid('propertyId'), authenticate, requireRole('landlord'), assignRent);
router.patch('/assignments/:assignmentId', validateUuid('assignmentId'), authenticate, requireRole('landlord'), updateRent);
router.get('/properties/:propertyId/assignments', validateUuid('propertyId'), authenticate, requireRole('landlord'), listAssignments);
router.post('/assignments/:assignmentId/payments', validateUuid('assignmentId'), authenticate, requireRole('landlord'), logPaymentAsLandlord);
router.get('/assignments/:assignmentId/payments', validateUuid('assignmentId'), authenticate, requireRole('landlord'), listPaymentsByAssignment);

// ── Tenant ─────────────────────────────────────────────────────────
router.get('/my/assignment', authenticate, requireRole('tenant'), getMyAssignment);
router.post('/my/payments', authenticate, requireRole('tenant'), logPaymentAsTenant);
router.get('/my/payments', authenticate, requireRole('tenant'), listMyPayments);

export default router;
