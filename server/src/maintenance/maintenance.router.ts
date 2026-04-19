import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validateUuid } from '../middleware/validateUuid';
import {
  submitRequest,
  listByProperty,
  listByTenant,
  updateStatus,
} from './maintenance.controller';

const router = Router();

// Tenant routes
router.post('/properties/:propertyId/requests', validateUuid('propertyId'), authenticate, requireRole('tenant'), submitRequest);
router.get('/requests', authenticate, requireRole('tenant'), listByTenant);

// Landlord routes
router.get('/properties/:propertyId/requests', validateUuid('propertyId'), authenticate, requireRole('landlord'), listByProperty);
router.patch('/requests/:requestId/status', validateUuid('requestId'), authenticate, requireRole('landlord'), updateStatus);

export default router;
