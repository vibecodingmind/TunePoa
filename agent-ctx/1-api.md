# Task 1-api: Complete API Routes Rebuild for TunePoa Platform

## Summary
Rebuilt all API routes with proper authentication, authorization, validation, and consistent response formatting.

## Shared Helpers Created
- `/src/lib/api-response.ts` — Standard response helpers: `success()`, `error()`, `unauthorized()`, `forbidden()`
- `/src/lib/constants.ts` — Valid statuses, status labels/colors, package features, status transition maps, admin/manager role checks
- `/src/lib/auth.ts` — Token-based auth middleware: `authenticate()`, `createToken()`, `decodeToken()`, `hashPassword()`, `verifyPassword()`, `isAdmin()`, `isManager()`, `excludePassword()`

## Auth System
- Token format: `tp_` prefix + base64-encoded JSON `{ userId, email, role, name, exp }`
- 24-hour expiry
- Password hashing: reverse string + base64 (demo-only, documented)
- Token extraction from: `Authorization: Bearer xxx` header, `?token=xxx` query param
- All routes except register/login require authentication
- Admin-only routes check for SUPER_ADMIN or ADMIN roles

## API Routes Rebuilt (18 total)

### Auth
- `POST /api/auth/register` — Validates fields, checks uniqueness, hashes password, creates BUSINESS_OWNER, logs activity
- `POST /api/auth/login` — Finds user, verifies password, checks status, creates token, logs login

### Users
- `GET /api/users` — Admin only, supports role/status/search filters
- `GET|PATCH|DELETE /api/users/[id]` — Self or admin, role/status changes admin-only, soft delete

### Service Requests
- `GET /api/service-requests` — Auth required, non-admin sees own only, supports status/search filters
- `POST /api/service-requests` — Auth required, userId from token
- `GET /api/service-requests/[id]` — Auth required, own or admin
- `PATCH /api/service-requests/[id]` — Manager+ only, validates status transitions (SR_TRANSITIONS), validates assignedTo user
- `DELETE /api/service-requests/[id]` — Own (BUSINESS_OWNER) or admin, only PENDING/REJECTED

### Recordings
- `GET /api/recordings` — Auth required, non-admin filtered to own
- `POST /api/recordings` — Auth required (manager+), auto-sets recordedBy from token
- `GET|PATCH|DELETE /api/recordings/[id]` — Auth required (manager+)

### Packages
- `GET /api/packages` — No auth, active packages with subscription count
- `POST /api/packages` — Admin only
- `GET /api/packages/[id]` — No auth
- `PATCH /api/packages/[id]` — Admin only, JSON.stringify features
- `DELETE /api/packages/[id]` — Admin only, soft delete (isActive=false)

### Subscriptions
- `GET /api/subscriptions` — Auth, non-admin sees own only
- `POST /api/subscriptions` — Auth, validates requestId belongs to user, checks duplicate
- `GET /api/subscriptions/[id]` — Auth, own or admin
- `PATCH /api/subscriptions/[id]` — Admin only, validates SUB_TRANSITIONS, ACTIVE requires PAID, independent paymentStatus/mnoStatus updates
- `DELETE /api/subscriptions/[id]` — Admin only, soft cancel

### Payments
- `GET /api/payments` — Auth, non-admin sees own subscriptions' payments
- `POST /api/payments` — Auth, supports PENDING status, auto-updates subscription paymentStatus on COMPLETED

### MNO Providers
- `GET /api/mno-providers` — No auth
- `POST /api/mno-providers` — Checks duplicate code/name
- `GET /api/mno-providers/[id]` — No auth (new route)
- `PATCH /api/mno-providers/[id]` — Admin only, checks code uniqueness
- `DELETE /api/mno-providers/[id]` — Admin only, soft delete (new route)

### Analytics
- `GET /api/analytics` — Admin only, includes MNO stats and payment method breakdown

### Other
- `GET /api` — API version info
- `POST /api/seed` — Clears all data first, hashed passwords, proper JSON array features, returns tokens
- `POST|PATCH /api/whatsapp` — Manager+ only, auth required

## Validation Rules
- Service Request transitions: PENDING→{IN_PROGRESS,REJECTED}, IN_PROGRESS→{RECORDING,REJECTED}, RECORDING→{AWAITING_VERIFICATION,REJECTED}, AWAITING_VERIFICATION→{APPROVED,REJECTED}, APPROVED→{COMPLETED}, REJECTED→{PENDING}
- Subscription transitions: PENDING→{ACTIVE,CANCELLED}, ACTIVE→{SUSPENDED,EXPIRED,CANCELLED}, EXPIRED→{ACTIVE}, SUSPENDED→{ACTIVE,CANCELLED}
- ACTIVE subscription requires PAID paymentStatus
- Rejecting service request requires rejectionReason
- All responses use consistent `{ success, data/error }` format

## Files Modified
- 3 new lib files: api-response.ts, constants.ts, auth.ts
- 18 API route files rewritten
- 2 new route directories: users/[id], mno-providers/[id]

## Verification
- ESLint: 0 errors
- Database: in sync with schema
- Dev server: running normally
