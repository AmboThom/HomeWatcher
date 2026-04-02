import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import type { PropertyRecord } from '../properties/properties.service';

const router = Router();

router.get(
  '/properties',
  authenticate,
  requireRole('tenant'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await pool.query<PropertyRecord>(
        `SELECT p.*
         FROM properties p
         INNER JOIN tenant_properties tp ON tp.property_id = p.id
         WHERE tp.tenant_id = $1
         ORDER BY tp.joined_at DESC`,
        [req.user!.id]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
