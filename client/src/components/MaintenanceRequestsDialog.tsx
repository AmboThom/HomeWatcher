import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { fetchPropertyRequests, updateRequestStatus, type MaintenanceRequest } from '@/lib/maintenance';
import { type Property } from '@/lib/properties';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const priorityVariant: Record<MaintenanceRequest['priority'], 'destructive' | 'default' | 'secondary'> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

export default function MaintenanceRequestsDialog({ open, onOpenChange, property }: Props) {
  const queryClient = useQueryClient();
  const queryKey = ['property-requests', property.id];

  const { data: requests, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchPropertyRequests(property.id),
    enabled: open,
  });

  const statusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: MaintenanceRequest['status'] }) =>
      updateRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Maintenance requests — {property.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {isLoading && (
            <div className="space-y-3 py-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {requests && requests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No requests for this property.
            </p>
          )}

          {requests &&
            requests.map((request) => (
              <div key={request.id} className="border rounded-md p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{request.title}</p>
                  <Badge variant={priorityVariant[request.priority]} className="shrink-0 capitalize text-xs">
                    {request.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{request.description}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                  <Select
                    value={request.status}
                    onValueChange={(value) =>
                      statusMutation.mutate({
                        requestId: request.id,
                        status: value as MaintenanceRequest['status'],
                      })
                    }
                    disabled={statusMutation.isPending}
                  >
                    <SelectTrigger className="h-7 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
