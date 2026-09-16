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
- [x] Phase 3 — Business panel UI + Firebase Authentication guard
- [ ] Phase 4 — Services & working hours persistence
- [ ] Phase 5 — Customer booking flow persistence
- [ ] Phase 6 — Booking conflict engine
- [ ] Phase 7 — Security rules
- [ ] Phase 8 — Demo, landing page & sales preparation

## Current Implementation

- `/{slug}` resolves a business tenant and renders a tenant-specific public booking page.
- Public business data is sanitized before it reaches the booking UI; internal owner/subscription fields are excluded.
- Firestore lookup is prepared for the `businesses/{businessId}` collection, with mock data retained for local development until Firebase environment variables are configured.
- `/panel` contains the first business dashboard with today's appointment overview and quick actions.
- `/panel/appointments`, `/panel/services`, `/panel/hours` and `/panel/settings` provide the initial management surfaces.
- `/login` signs businesses in with Firebase Email/Password authentication.
- `/panel` and all nested `/panel/*` routes are protected by a client-side Firebase auth guard and redirect unauthenticated users to `/login`.

## Firebase Setup

Copy `.env.example` to `.env.local`, add the Firebase web app configuration, and enable Email/Password under Firebase Authentication before testing the login flow.

## Development Principles

1. Finish and verify each phase before moving to the next.
2. Keep the MVP focused and avoid unnecessary complexity.
3. Treat tenant isolation and booking integrity as core requirements.
4. Build responsive experiences from the beginning.
5. Keep the UI premium, clean and easy to understand.

## Status

🚧 In development — Phase 3 / Authentication + Business Panel
