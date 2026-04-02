import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';

import { fetchTenantProperties } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import JoinPropertyDialog from '@/components/JoinPropertyDialog';

function PropertyCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export default function TenantDashboardPage() {
  const [joinOpen, setJoinOpen] = useState(false);

  const { data: properties, isLoading, isError } = useQuery({
    queryKey: ['tenant-properties'],
    queryFn: fetchTenantProperties,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Properties</h1>
        <Button onClick={() => setJoinOpen(true)}>Join property</Button>
      </div>

      <JoinPropertyDialog open={joinOpen} onOpenChange={setJoinOpen} />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Failed to load properties. Please refresh.</p>
      )}

      {properties && properties.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">You haven't joined any properties yet.</p>
          <p className="text-sm">Ask your landlord for an invite code to get started.</p>
        </div>
      )}

      {properties && properties.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{property.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{property.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
