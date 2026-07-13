import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, Repeat } from 'lucide-react';

import {
  BILL_CATEGORIES,
  BILL_FREQUENCIES,
  CATEGORY_LABELS,
  FREQUENCY_LABELS,
  createBill,
  fetchBillsByProperty,
  deleteBill,
  type Bill,
  type BillCategory,
} from '@/lib/bills';
import { formatAmount, toPence } from '@/lib/rent';
import { type Property } from '@/lib/properties';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ── Log bill form ──────────────────────────────────────────────────

const billSchema = z
  .object({
    payee: z.string().min(1, 'Payee is required').max(200),
    category: z.enum(BILL_CATEGORIES),
    amount: z.number().min(0.01, 'Amount is required'),
    paid_at: z.string().min(1, 'Date is required'),
    due_date: z.string().optional(),
    is_recurring: z.boolean(),
    frequency: z.enum(BILL_FREQUENCIES).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => !v.is_recurring || !!v.frequency, {
    message: 'Frequency is required for recurring bills',
    path: ['frequency'],
  });

type BillFormValues = z.infer<typeof billSchema>;

function LogBillForm({ propertyId }: { propertyId: string }) {
  const queryClient = useQueryClient();

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      payee: '',
      category: 'other',
      amount: 0,
      paid_at: '',
      due_date: '',
      is_recurring: false,
      frequency: undefined,
      notes: '',
    },
  });

  const isRecurring = form.watch('is_recurring');

  const mutation = useMutation({
    mutationFn: (values: BillFormValues) =>
      createBill(propertyId, {
        payee: values.payee,
        category: values.category,
        amount: toPence(values.amount),
        paid_at: values.paid_at,
        due_date: values.due_date || undefined,
        is_recurring: values.is_recurring,
        frequency: values.is_recurring ? values.frequency : undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', propertyId] });
      toast.success('Bill logged');
      form.reset();
    },
    onError: () => toast.error('Failed to log bill'),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
        <p className="text-sm font-medium">Log a bill</p>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="payee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payee</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. City Power Co." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BILL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="95.50"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paid_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date paid</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="is_recurring"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === 'recurring')}
                  value={field.value ? 'recurring' : 'one_off'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="one_off">One-off</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isRecurring && (
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BILL_FREQUENCIES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {FREQUENCY_LABELS[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Paid via bank transfer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="sm" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Logging...' : 'Log bill'}
        </Button>
      </form>
    </Form>
  );
}

// ── Bill history ───────────────────────────────────────────────────

function BillRow({ bill, propertyId }: { bill: Bill; propertyId: string }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteBill(bill.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', propertyId] });
      toast.success('Bill deleted');
    },
    onError: () => toast.error('Failed to delete bill'),
  });

  const loggedBy = bill.first_name ? `${bill.first_name} ${bill.last_name}` : null;

  return (
    <div className="flex items-center justify-between gap-2 border rounded-md p-3">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{bill.payee}</p>
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABELS[bill.category]}
          </Badge>
          {bill.is_recurring && bill.frequency && (
            <Badge variant="outline" className="text-xs gap-1">
              <Repeat className="h-3 w-3" />
              {FREQUENCY_LABELS[bill.frequency]}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Paid {new Date(bill.paid_at).toLocaleDateString()}
          {loggedBy ? ` · by ${loggedBy}` : ''}
          {bill.notes ? ` · ${bill.notes}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-medium">{formatAmount(bill.amount)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

export default function BillsDialog({ open, onOpenChange, property }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<BillCategory | 'all'>('all');

  const billsQuery = useQuery({
    queryKey: ['bills', property.id],
    queryFn: () => fetchBillsByProperty(property.id),
    enabled: open,
  });

  const bills = billsQuery.data ?? [];
  const filtered =
    categoryFilter === 'all' ? bills : bills.filter((b) => b.category === categoryFilter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bills — {property.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          <LogBillForm propertyId={property.id} />

          <Separator />

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">History</p>
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as BillCategory | 'all')}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {BILL_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {billsQuery.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}

          {billsQuery.isError && (
            <p className="text-sm text-destructive">Failed to load bills. Please retry.</p>
          )}

          {!billsQuery.isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {bills.length === 0 ? 'No bills logged yet.' : 'No bills in this category.'}
            </p>
          )}

          {filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((bill) => (
                <BillRow key={bill.id} bill={bill} propertyId={property.id} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
