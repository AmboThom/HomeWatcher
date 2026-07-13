import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Wrench, ReceiptText } from 'lucide-react';

import { fetchTenantProperties } from '@/lib/tenant';
import { type Property } from '@/lib/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import JoinPropertyDialog from '@/components/JoinPropertyDialog';
import SubmitRequestDialog from '@/components/SubmitRequestDialog';
import TenantRentSection from '@/components/TenantRentSection';
import BillsDialog from '@/components/BillsDialog';

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
  const [requestProperty, setRequestProperty] = useState<Property | undefined>();
  const [billsProperty, setBillsProperty] = useState<Property | undefined>();

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

      {requestProperty && (
        <SubmitRequestDialog
          open={!!requestProperty}
          onOpenChange={(open) => { if (!open) setRequestProperty(undefined); }}
          property={requestProperty}
        />
      )}

      {billsProperty && (
        <BillsDialog
          open={!!billsProperty}
          onOpenChange={(open) => { if (!open) setBillsProperty(undefined); }}
          property={billsProperty}
        />
      )}

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

      <TenantRentSection />

      {properties && properties.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{property.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{property.address}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setRequestProperty(property)}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Submit request
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setBillsProperty(property)}
                  >
                    <ReceiptText className="h-3.5 w-3.5" />
                    Log bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
