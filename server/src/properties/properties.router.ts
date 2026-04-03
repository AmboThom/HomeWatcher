import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { create, list, getOne, update, remove, listTenants } from './properties.controller';

const router = Router();

router.use(authenticate, requireRole('landlord'));

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);
router.get('/:id/tenants', listTenants);

export default router;
