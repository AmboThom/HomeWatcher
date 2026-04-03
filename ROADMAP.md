# HomeWatcher Roadmap

## Phase 1 — Project Scaffolding ✅
- Express/TypeScript server
- React/Vite client
- Docker Compose (Postgres + pgAdmin)
- DB connection and migration runner
- shadcn UI components

## Phase 2 — Authentication ✅
- User registration and login
- JWT access and refresh tokens
- Role-based middleware (landlord / tenant / agent)
- `001_create_users.sql` migration

## Phase 3 — Properties & Invite Code Flow ✅

### Database
- `002_create_properties.sql`
- `003_create_property_invites.sql`
- `004_create_tenant_properties.sql`

### Landlord CRUD (`/api/properties`) ✅
- `POST /api/properties` — create a property
- `GET /api/properties` — list own properties
- `GET /api/properties/:id` — get one property
- `PATCH /api/properties/:id` — update a property
- `DELETE /api/properties/:id` — delete a property

### Invite Codes (`/api/properties/:id/invites`) ✅
- `POST /api/properties/:id/invites` — generate a code (XXXX-XXXX format)
- `GET /api/properties/:id/invites` — list codes for a property
- `DELETE /api/properties/:id/invites/:code` — revoke a code

### Redeem (`/api/invites/redeem`) ✅
- `POST /api/invites/redeem` — tenant joins a property via code

## Phase 4 — Frontend ✅
- Auth pages (register, login)
- Landlord dashboard (property list, create/edit property)
- Invite code management UI
- Tenant dashboard (join via code, view linked properties)

## Phase 5 — Tenant-Facing Features ✅
- View all properties the tenant is linked to
- Landlord can view tenants linked to a property

## Phase 6 — Maintenance Requests 🔲
- `maintenance_requests` table
- Tenant submits a request (title, description, priority)
- Landlord views and updates request status (open → in progress → resolved)

## Phase 7 — Notifications 🔲
- Email on maintenance request submitted (landlord)
- Email on request status change (tenant)

## Phase 8 — Payments / Rent Tracking 🔲
- Landlord sets rent amount per tenant/property
- Tenant logs payment or landlord marks rent received
- Payment history

## Phase 9 — Production Readiness 🔲
- Rate limiting
- Input sanitization audit
- Environment config hardening
- Deployment
