import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  fetchMyAssignment,
  fetchMyPayments,
  logPaymentAsTenant,
  formatAmount,
  toPence,
} from '@/lib/rent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const schema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount is required'),
  paid_at: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function TenantRentSection() {
  const queryClient = useQueryClient();

  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['my-assignment'],
    queryFn: fetchMyAssignment,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: fetchMyPayments,
    enabled: !!assignment,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, paid_at: '', notes: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      logPaymentAsTenant({
        amount: toPence(values.amount),
        paid_at: new Date(values.paid_at).toISOString(),
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-payments'] });
      toast.success('Payment logged');
      form.reset();
    },
    onError: () => toast.error('Failed to log payment'),
  });

  if (assignmentLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!assignment) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Rent</h2>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {formatAmount(assignment.amount)} / month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Due on day {assignment.due_day} of each month
          </p>

          {/* Log payment form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0.01" placeholder="950.00" {...field} />
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
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bank transfer ref #123" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" size="sm" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Logging...' : 'Log payment'}
              </Button>
            </form>
          </Form>

          {/* Payment history */}
          {paymentsLoading && <Skeleton className="h-16 w-full" />}

          {payments && payments.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Payment history</p>
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between text-sm py-1 border-t">
                  <span className="text-muted-foreground">
                    {new Date(p.paid_at).toLocaleDateString()}
                    {p.notes ? ` · ${p.notes}` : ''}
                  </span>
                  <span className="font-medium">{formatAmount(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {payments && payments.length === 0 && (
            <p className="text-xs text-muted-foreground">No payments logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
