import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import {
  submitRequest,
  listByProperty,
  listByTenant,
  updateStatus,
} from './maintenance.controller';

const router = Router();

// Tenant routes
router.post('/properties/:propertyId/requests', authenticate, requireRole('tenant'), submitRequest);
router.get('/requests', authenticate, requireRole('tenant'), listByTenant);

// Landlord routes
router.get('/properties/:propertyId/requests', authenticate, requireRole('landlord'), listByProperty);
router.patch('/requests/:requestId/status', authenticate, requireRole('landlord'), updateStatus);

export default router;
