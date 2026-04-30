import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';

import {
  fetchAssignmentsByProperty,
  fetchPaymentsByAssignment,
  createAssignment,
  logPaymentAsLandlord,
  formatAmount,
  toPence,
  type RentAssignment,
} from '@/lib/rent';
import { fetchPropertyTenants, type Property, type TenantSummary } from '@/lib/properties';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ── Assign rent form ───────────────────────────────────────────────

const assignSchema = z.object({
  tenant_id: z.string().uuid('Select a tenant'),
  amount: z.number().min(0.01, 'Amount is required'),
  due_day: z.number().int().min(1).max(31),
});

type AssignFormValues = z.infer<typeof assignSchema>;

function AssignRentForm({
  propertyId,
  tenants,
  assignedTenantIds,
}: {
  propertyId: string;
  tenants: TenantSummary[];
  assignedTenantIds: Set<string>;
}) {
  const queryClient = useQueryClient();
  const unassigned = tenants.filter((t) => !assignedTenantIds.has(t.id));

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema) as ReturnType<typeof zodResolver<AssignFormValues>>,
    defaultValues: { tenant_id: '', amount: 0, due_day: 1 },
  });

  const mutation = useMutation({
    mutationFn: (values: AssignFormValues) =>
      createAssignment(propertyId, {
        tenant_id: values.tenant_id,
        amount: toPence(values.amount),
        due_day: values.due_day,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-assignments', propertyId] });
      toast.success('Rent assigned');
      form.reset();
    },
    onError: () => toast.error('Failed to assign rent'),
  });

  if (unassigned.length === 0) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
        <p className="text-sm font-medium">Assign rent</p>

        <FormField
          control={form.control}
          name="tenant_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {unassigned.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
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
                    placeholder="950.00"
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
            name="due_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due day</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="1"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="sm" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Assigning...' : 'Assign rent'}
        </Button>
      </form>
    </Form>
  );
}

// ── Log payment form ───────────────────────────────────────────────

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount is required'),
  paid_at: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function AssignmentRow({
  assignment,
  tenantName,
  propertyId,
}: {
  assignment: RentAssignment;
  tenantName: string;
  propertyId: string;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const paymentQueryKey = ['rent-payments', assignment.id];

  const { data: payments } = useQuery({
    queryKey: paymentQueryKey,
    queryFn: () => fetchPaymentsByAssignment(assignment.id),
    enabled: expanded,
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as ReturnType<typeof zodResolver<PaymentFormValues>>,
    defaultValues: { amount: 0, paid_at: '', notes: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: PaymentFormValues) =>
      logPaymentAsLandlord(assignment.id, {
        amount: toPence(values.amount),
        paid_at: new Date(values.paid_at).toISOString(),
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKey });
      queryClient.invalidateQueries({ queryKey: ['rent-assignments', propertyId] });
      toast.success('Payment logged');
      form.reset();
    },
    onError: () => toast.error('Failed to log payment'),
  });

  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{tenantName}</p>
          <p className="text-xs text-muted-foreground">
            {formatAmount(assignment.amount)} / month · due day {assignment.due_day}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1">
          {/* Log payment form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="h-8 text-xs"
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
                      <FormLabel className="text-xs">Date received</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-8 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Notes (optional)</FormLabel>
                    <FormControl>
                      <Input className="h-8 text-xs" placeholder="e.g. Bank transfer" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" variant="outline" className="w-full h-8 text-xs" disabled={mutation.isPending}>
                {mutation.isPending ? 'Logging...' : 'Log payment received'}
              </Button>
            </form>
          </Form>

          {/* Payment history */}
          {payments && payments.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Payment history</p>
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between text-xs py-1 border-t">
                  <span>{new Date(p.paid_at).toLocaleDateString()}{p.notes ? ` · ${p.notes}` : ''}</span>
                  <span className="font-medium">{formatAmount(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {payments && payments.length === 0 && (
            <p className="text-xs text-muted-foreground">No payments logged yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

export default function RentDialog({ open, onOpenChange, property }: Props) {
  const assignmentsQuery = useQuery({
    queryKey: ['rent-assignments', property.id],
    queryFn: () => fetchAssignmentsByProperty(property.id),
    enabled: open,
  });

  const tenantsQuery = useQuery({
    queryKey: ['property-tenants', property.id],
    queryFn: () => fetchPropertyTenants(property.id),
    enabled: open,
  });

  const tenantMap = new Map(
    (tenantsQuery.data ?? []).map((t) => [t.id, `${t.first_name} ${t.last_name}`])
  );

  const assignedTenantIds = new Set(
    (assignmentsQuery.data ?? []).map((a) => a.tenant_id)
  );

  const isLoading = assignmentsQuery.isLoading || tenantsQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rent — {property.name}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4 max-h-[480px] overflow-y-auto">
            <AssignRentForm
              propertyId={property.id}
              tenants={tenantsQuery.data ?? []}
              assignedTenantIds={assignedTenantIds}
            />

            {assignmentsQuery.data && assignmentsQuery.data.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  {assignmentsQuery.data.map((assignment) => (
                    <AssignmentRow
                      key={assignment.id}
                      assignment={assignment}
                      tenantName={tenantMap.get(assignment.tenant_id) ?? 'Unknown tenant'}
                      propertyId={property.id}
                    />
                  ))}
                </div>
              </>
            )}

            {assignmentsQuery.data?.length === 0 && tenantsQuery.data?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tenants linked to this property yet.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
