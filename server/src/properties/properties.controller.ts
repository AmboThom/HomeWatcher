import { Request, Response, NextFunction } from 'express';
import { createPropertySchema, updatePropertySchema } from './properties.schemas';
import {
  createProperty,
  getPropertiesByLandlord,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertyTenants,
} from './properties.service';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createPropertySchema.parse(req.body);
    const property = await createProperty(req.user!.id, input);
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const properties = await getPropertiesByLandlord(req.user!.id);
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const property = await getPropertyById(req.params.id);
    if (!property) {
      res.status(404).json({ status: 'error', message: 'Property not found' });
      return;
    }
    if (property.landlord_id !== req.user!.id) {
      res.status(403).json({ status: 'error', message: 'Forbidden' });
      return;
    }
    res.json(property);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updatePropertySchema.parse(req.body);
    const property = await updateProperty(req.params.id, req.user!.id, input);
    res.json(property);
  } catch (err) {
    next(err);
  }
}

export async function listTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenants = await getPropertyTenants(req.params.id, req.user!.id);
    res.json(tenants);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteProperty(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
