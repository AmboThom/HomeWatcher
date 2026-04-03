import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';

import { fetchPropertyTenants, type Property } from '@/lib/properties';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

export default function PropertyTenantsDialog({ open, onOpenChange, property }: Props) {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['property-tenants', property.id],
    queryFn: () => fetchPropertyTenants(property.id),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Tenants — {property.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          {isLoading && (
            <div className="space-y-3 py-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}

          {tenants && tenants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tenants found.
            </p>
          )}

          {tenants &&
            tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center gap-3 py-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm">
                  {tenant.first_name} {tenant.last_name}
                </span>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
