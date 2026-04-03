import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, KeyRound, Pencil, Users, Wrench } from 'lucide-react';

import { fetchProperties, type Property } from '@/lib/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyDialog from '@/components/PropertyDialog';
import InviteCodesDialog from '@/components/InviteCodesDialog';
import PropertyTenantsDialog from '@/components/PropertyTenantsDialog';
import MaintenanceRequestsDialog from '@/components/MaintenanceRequestsDialog';

function PropertyCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </CardContent>
    </Card>
  );
}

export default function PropertiesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [inviteProperty, setInviteProperty] = useState<Property | undefined>();
  const [tenantsProperty, setTenantsProperty] = useState<Property | undefined>();
  const [requestsProperty, setRequestsProperty] = useState<Property | undefined>();

  const { data: properties, isLoading, isError } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });

  function openCreate() {
    setEditingProperty(undefined);
    setDialogOpen(true);
  }

  function openEdit(property: Property) {
    setEditingProperty(property);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
        <Button onClick={openCreate}>Add property</Button>
      </div>

      <PropertyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        property={editingProperty}
      />

      {inviteProperty && (
        <InviteCodesDialog
          open={!!inviteProperty}
          onOpenChange={(open) => { if (!open) setInviteProperty(undefined); }}
          property={inviteProperty}
        />
      )}

      {tenantsProperty && (
        <PropertyTenantsDialog
          open={!!tenantsProperty}
          onOpenChange={(open) => { if (!open) setTenantsProperty(undefined); }}
          property={tenantsProperty}
        />
      )}

      {requestsProperty && (
        <MaintenanceRequestsDialog
          open={!!requestsProperty}
          onOpenChange={(open) => { if (!open) setRequestsProperty(undefined); }}
          property={requestsProperty}
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
          <p className="text-sm">No properties yet. Add your first one to get started.</p>
        </div>
      )}

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
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setInviteProperty(property)}>
                    <KeyRound className="h-3.5 w-3.5" />
                    Invite codes
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setTenantsProperty(property)}>
                    <Users className="h-3.5 w-3.5" />
                    Tenants
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setRequestsProperty(property)}>
                    <Wrench className="h-3.5 w-3.5" />
                    Requests
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEdit(property)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
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
