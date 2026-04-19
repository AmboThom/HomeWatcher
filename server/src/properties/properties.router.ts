import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validateUuid } from '../middleware/validateUuid';
import { create, list, getOne, update, remove, listTenants } from './properties.controller';

const router = Router();

router.use(authenticate, requireRole('landlord'));

router.post('/', create);
router.get('/', list);
router.get('/:id', validateUuid('id'), getOne);
router.patch('/:id', validateUuid('id'), update);
router.delete('/:id', validateUuid('id'), remove);
router.get('/:id/tenants', validateUuid('id'), listTenants);

export default router;
