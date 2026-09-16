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
- [ ] Phase 2 — Multi-tenant core
- [ ] Phase 3 — Business panel
- [ ] Phase 4 — Services & working hours
- [ ] Phase 5 — Customer booking flow
- [ ] Phase 6 — Booking conflict engine
- [ ] Phase 7 — Security rules
- [ ] Phase 8 — Demo, landing page & sales preparation

## Phase 2 Progress

- Business domain types added
- Seed business data added for development
- Dynamic `/{slug}` public business route added
- Unknown business slugs return `404`
- Public booking UI now consumes tenant-specific business data
- Root page now acts as a demo/business selector
- Firebase persistence and authentication remain for the next Phase 2 steps

## Development Principles

1. Finish and verify each phase before moving to the next.
2. Keep the MVP focused and avoid unnecessary complexity.
3. Treat tenant isolation and booking integrity as core requirements.
4. Build responsive experiences from the beginning.
5. Keep the UI premium, clean and easy to understand.

## Status

🚧 In development — Phase 2 / Multi-tenant core
