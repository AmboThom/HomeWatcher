import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validateUuid } from '../middleware/validateUuid';
import { createBill, listBills, updateBill, deleteBill } from './bills.controller';

const router = Router();

router.post('/properties/:propertyId', validateUuid('propertyId'), authenticate, requireRole('landlord', 'tenant'), createBill);
router.get('/properties/:propertyId', validateUuid('propertyId'), authenticate, requireRole('landlord', 'tenant'), listBills);
router.patch('/:billId', validateUuid('billId'), authenticate, requireRole('landlord', 'tenant'), updateBill);
router.delete('/:billId', validateUuid('billId'), authenticate, requireRole('landlord', 'tenant'), deleteBill);

export default router;
