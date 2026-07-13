import { Request, Response, NextFunction } from 'express';
import { createBillSchema, updateBillSchema } from './bills.schemas';
import {
  createBill as createBillService,
  getBillsByProperty,
  updateBill as updateBillService,
  deleteBill as deleteBillService,
} from './bills.service';

export async function createBill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createBillSchema.parse(req.body);
    const bill = await createBillService(req.params.propertyId, req.user!, input);
    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
}

export async function listBills(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bills = await getBillsByProperty(req.params.propertyId, req.user!);
    res.json(bills);
  } catch (err) {
    next(err);
  }
}

export async function updateBill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateBillSchema.parse(req.body);
    const bill = await updateBillService(req.params.billId, req.user!.id, input);
    res.json(bill);
  } catch (err) {
    next(err);
  }
}

export async function deleteBill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteBillService(req.params.billId, req.user!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
