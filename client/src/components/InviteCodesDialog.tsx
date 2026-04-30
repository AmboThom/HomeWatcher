import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

import { fetchInvites, generateInvite, revokeInvite, type Invite } from '@/lib/invites';
import { type Property } from '@/lib/properties';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
  expires_at: z.string().min(1, 'Expiry date is required'),
  max_uses: z.number().int().min(1, 'Must be at least 1'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

function InviteRow({
  invite,
  onRevoke,
  isRevoking,
}: {
  invite: Invite;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const expired = new Date(invite.expires_at) < new Date();
  const exhausted = invite.uses_count >= invite.max_uses;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{invite.code}</span>
          {expired && <Badge variant="destructive" className="text-xs">Expired</Badge>}
          {!expired && exhausted && <Badge variant="secondary" className="text-xs">Full</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {invite.uses_count}/{invite.max_uses} uses · expires{' '}
          {new Date(invite.expires_at).toLocaleDateString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRevoke}
        disabled={isRevoking}
        className="text-destructive hover:text-destructive shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function InviteCodesDialog({ open, onOpenChange, property }: Props) {
  const queryClient = useQueryClient();
  const queryKey = ['invites', property.id];

  const { data: invites, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchInvites(property.id),
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { expires_at: '', max_uses: 1 },
  });

  const generateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      generateInvite(property.id, {
        expires_at: new Date(values.expires_at).toISOString(),
        max_uses: values.max_uses,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Invite code generated');
      form.reset({ expires_at: '', max_uses: 1 });
    },
    onError: () => toast.error('Failed to generate code'),
  });

  const revokeMutation = useMutation({
    mutationFn: (code: string) => revokeInvite(property.id, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Invite code revoked');
    },
    onError: () => toast.error('Failed to revoke code'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite codes — {property.name}</DialogTitle>
        </DialogHeader>

        {/* Generate form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => generateMutation.mutate(v))}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max uses</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? 'Generating...' : 'Generate code'}
            </Button>
          </form>
        </Form>

        <Separator />

        {/* Code list */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {isLoading && (
            <div className="space-y-3 py-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}

          {invites && invites.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No codes yet. Generate one above.
            </p>
          )}

          {invites &&
            invites.map((invite) => (
              <InviteRow
                key={invite.id}
                invite={invite}
                onRevoke={() => revokeMutation.mutate(invite.code)}
                isRevoking={revokeMutation.isPending}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
