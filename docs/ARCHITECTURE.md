# Multi-tenant commerce architecture

## Core concepts
- Each store has a unique `slug` and `id`.
- Store members link users to stores with role-based access.
- Public storefront queries use anonymous Supabase access with RLS filters.
- Mutations run through Server Actions or protected API routes.

## Request flow
- Public: `/{store}` -> Server Component fetches store + products.
- Dashboard: `/dashboard/*` -> Middleware requires session, queries via RLS.
- Checkout: POST `/api/stripe/checkout` -> Stripe Checkout session.
- Webhooks: POST `/api/stripe/webhook` -> update orders/subscriptions.

## Tenant isolation
- RLS policies enforce per-store access by `store_id`.
- `store_members` governs dashboard access.
- Public access limited to stores with `is_public = true`.
