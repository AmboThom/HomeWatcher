import { Routes, Route } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, FileText, Wrench, Bell } from 'lucide-react';

/**
 * Phase 1 placeholder — confirms Tailwind, shadcn/ui, and routing are wired up.
 * Full pages are built in Phase 5.
 */
function PlaceholderPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">HomeWatcher</h1>
          </div>
          <Badge variant="secondary">Phase 1 — Scaffold</Badge>
        </div>

        {/* Status card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Setup Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-medium">✓</span>
              <span>Vite + React + TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-medium">✓</span>
              <span>Tailwind CSS v4</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-medium">✓</span>
              <span>shadcn/ui components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-medium">✓</span>
              <span>React Router v7</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-medium">✓</span>
              <span>TanStack Query v5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-medium">✓</span>
              <span>API proxy → localhost:3001</span>
            </div>
          </CardContent>
        </Card>

        {/* Component showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">shadcn/ui Component Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        {/* Nav icons preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Icon Check (lucide-react)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 text-muted-foreground">
              <div className="flex flex-col items-center gap-1 text-xs">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-xs">
                <FileText className="h-5 w-5" />
                <span>Bills</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-xs">
                <Wrench className="h-5 w-5" />
                <span>Tickets</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-xs">
                <Bell className="h-5 w-5" />
                <span>Alerts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Phase 2 → Database schema + Authentication API
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<PlaceholderPage />} />
    </Routes>
  );
}
