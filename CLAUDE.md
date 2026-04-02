# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Server (`/server`)
```bash
npm run dev       # Start dev server with hot reload (ts-node-dev)
npm run build     # Compile TypeScript to dist/
npm run start     # Run compiled output
npm run migrate   # Run pending DB migrations
```

### Client (`/client`)
```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Type-check and build for production
npm run lint      # Run ESLint
```

### Infrastructure
```bash
docker compose up -d postgres     # Start Postgres only
docker compose up -d              # Start Postgres + pgAdmin (http://localhost:5050)
```

## Environment Variables (server)

Required — server will throw on startup if missing:
- `DATABASE_URL` — Postgres connection string
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Optional with defaults:
- `PORT` (3001)
- `NODE_ENV` (development)
- `JWT_ACCESS_EXPIRES_IN` (15m)
- `JWT_REFRESH_EXPIRES_IN` (7d)
- `CLIENT_ORIGIN` (http://localhost:5173)

## TypeScript Standards

This project uses TypeScript. Always ensure zero type errors after changes - run `npx tsc --noEmit` before considering work complete.

## Architecture

### Server (`server/src/`)

Feature modules follow a consistent 4-file pattern:
```
feature/
  feature.schemas.ts    — Zod validation schemas and inferred types
  feature.service.ts    — DB queries via pg pool, business logic, error throwing
  feature.controller.ts — Parse input, call service, send response, pass errors to next()
  feature.router.ts     — Route definitions with middleware applied
```

All errors are thrown from the service layer using a local `makeError(message, statusCode)` helper. The global `errorHandler` in `middleware/errorHandler.ts` handles Zod errors (400) and statusCode-stamped errors automatically — controllers just call `next(err)`.

Authentication uses JWT access tokens (Bearer header) + refresh tokens (httpOnly cookie). The `authenticate` middleware attaches `req.user` (`{ id, email, role }`). `requireRole(...roles)` guards routes by role.

Migrations are plain SQL files in `db/migrations/`, numbered `001_`, `002_`, etc. The runner (`db/migrate.ts`) tracks executed migrations in a `migrations` table and runs each file in a transaction. New migrations must follow the naming convention to run in the correct order.

The `invites` router is mounted at two paths in `app.ts`:
- `/api/properties/:id/invites` — landlord code management (uses `mergeParams: true` to access `:id`)
- `/api/invites` — tenant redeem endpoint

### Client (`client/src/`)

- React 19 + Vite + TypeScript
- Routing: `react-router-dom` v7
- Data fetching: `@tanstack/react-query` + `axios`
- Forms: `react-hook-form` + `zod` (note: client uses zod v4, server uses zod v3)
- UI: shadcn components built on Radix UI primitives, styled with Tailwind CSS v4
- Notifications: `sonner`

### Database

Postgres 16. All PKs are `UUID DEFAULT gen_random_uuid()`. Foreign keys use `ON DELETE CASCADE`. The landlord–tenant relationship is mediated entirely through the invite flow — `users` has no property FK.

Key relationships:
- `properties.landlord_id → users.id`
- `property_invites.property_id → properties.id`
- `tenant_properties(tenant_id, property_id)` — join table with a unique constraint, populated when a tenant redeems an invite code
