# ALINDA Booking

Modern, multi-tenant online appointment booking platform for beauty, wellness, personal care and service businesses.

## Vision

ALINDA helps businesses create a professional booking page, manage services and working hours, and receive customer appointments from a simple web experience.

## MVP

- Multi-tenant business architecture
- Public business booking pages
- Service management
- Working hours and availability
- Appointment creation
- Business management panel
- Firebase Authentication
- Firestore data layer
- Secure tenant-based access rules
- Responsive, premium UI

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Lucide Icons

## Project Phases

- [x] Phase 0 — Project foundation
- [x] Phase 1 — ALINDA design system + first public booking prototype
- [x] Phase 2 — Multi-tenant core scaffold + Firestore integration layer
- [x] Phase 3 — Business panel UI + Firebase Authentication
- [x] Phase 4 — Services & working hours persistence
- [ ] Phase 5 — Customer booking flow persistence
- [ ] Phase 6 — Booking conflict engine
- [ ] Phase 7 — Security rules
- [ ] Phase 8 — Demo, landing page & sales preparation

## Current Implementation

- `/{slug}` resolves a business tenant and renders a tenant-specific public booking page.
- Public business data is sanitized before it reaches the booking UI; internal owner/subscription fields are excluded.
- Public services are loaded from `businesses/{businessId}/services` when Firestore is configured, with mock data retained for development fallback.
- `/login` provides Firebase Email/Password authentication.
- `/panel` and `/panel/*` are protected by an authentication guard.
- `/panel/services` supports real Firestore service listing, creation, editing and deletion for the signed-in owner's business.
- `/panel/hours` supports real Firestore working-hour loading and saving for all seven days.
- Business ownership is resolved through the `ownerId` field on the `businesses` collection.

## Firestore MVP Shape

```text
businesses/{businessId}
├── ownerId
├── name
├── slug
├── category
├── description
├── city
├── district
├── address
├── phone
├── initials
├── primaryColor
└── primaryColorSoft

businesses/{businessId}/services/{serviceId}
├── name
├── description
├── durationMinutes
├── price
├── currency
├── createdAt
└── updatedAt

businesses/{businessId}/hours/{dayId}
├── dayOfWeek
├── enabled
├── open
├── close
└── updatedAt
```

> Firestore security rules are intentionally deferred to Phase 7. Until those rules are configured, the client-side owner lookup is an application-layer guard, not the final tenant-isolation boundary.

## Development Principles

1. Finish and verify each phase before moving to the next.
2. Keep the MVP focused and avoid unnecessary complexity.
3. Treat tenant isolation and booking integrity as core requirements.
4. Build responsive experiences from the beginning.
5. Keep the UI premium, clean and easy to understand.

## Status

🚧 In development — Phase 4 / Services & Working Hours
