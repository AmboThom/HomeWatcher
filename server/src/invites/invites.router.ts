import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { generate, list, revoke, redeem } from './invites.controller';

const router = Router({ mergeParams: true });

router.get('/', authenticate, requireRole('landlord'), list);
router.post('/', authenticate, requireRole('landlord'), generate);
router.delete('/:code', authenticate, requireRole('landlord'), revoke);
router.post('/redeem', authenticate, requireRole('tenant'), redeem);

export default router;
