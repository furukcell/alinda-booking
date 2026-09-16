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
- [x] Phase 5 — Customer booking flow persistence
- [x] Phase 6 — Booking conflict engine
- [x] Phase 7 — Firestore security rules
- [x] Phase 8 — Demo, landing page & sales preparation
- [x] Phase 9 — Dynamic availability generation

## Current Implementation

- `/{slug}` resolves a business tenant and renders a tenant-specific public booking page.
- `/` provides the ALINDA sales/demo landing page with example businesses and clear navigation into the booking flow.
- Public business data is sanitized before it reaches the booking UI; internal owner/subscription fields are excluded by the application layer.
- Public services are loaded from `businesses/{businessId}/services` when Firestore is configured, with mock data retained for development fallback.
- `/login` provides Firebase Email/Password authentication.
- `/panel` and `/panel/*` are protected by an authentication guard.
- `/panel/services` supports real Firestore service listing, creation, editing and deletion for the signed-in owner's business.
- `/panel/hours` supports real Firestore working-hour loading and saving for all seven days.
- Business ownership is resolved through the `ownerId` field on the `businesses` collection.
- Public booking requests are persisted under `businesses/{businessId}/bookings`.
- Booking creation atomically reserves `businesses/{businessId}/slots/{date_time}` before creating the booking, preventing two clients from taking the same slot concurrently.
- The public booking page generates the next 14 dates from the visitor's local calendar.
- Available times are generated from the business's persisted working hours and the selected service duration in 30-minute intervals.
- Past time slots are hidden for the current day.
- Occupied deterministic slot documents are checked individually and removed from the public availability list without allowing slot enumeration.
- If a service is longer than the remaining working window, late start times are not offered.
- A final create-only transaction still protects the booking at submission time if another customer takes the slot between availability loading and confirmation.
- `/panel/appointments` reads persisted bookings for the signed-in owner's business.
- `firestore.rules` provides authenticated owner checks for tenant management and restricts booking/slot creation to the expected pending shapes.
- `firebase.json` points Firebase CLI deployments at `firestore.rules`.
- `docs/sales.md` contains the demo flow, pre-demo checklist, MVP boundaries and sales notes.

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

businesses/{businessId}/bookings/{bookingId}
├── businessId
├── serviceId
├── serviceName
├── serviceDurationMinutes
├── servicePrice
├── customerName
├── customerPhone
├── date
├── time
├── status
├── slotId
└── createdAt

businesses/{businessId}/slots/{date_time}
├── slotId
├── date
├── time
├── status
└── createdAt
```

> The public booking flow reads the tenant document directly, so sensitive fields such as billing/subscription secrets must not be stored in `businesses/{businessId}`. A future hardening step can split public business data into a dedicated public collection.

## Development Principles

1. Finish and verify each phase before moving to the next.
2. Keep the MVP focused and avoid unnecessary complexity.
3. Treat tenant isolation and booking integrity as core requirements.
4. Build responsive experiences from the beginning.
5. Keep the UI premium, clean and easy to understand.

## Status

🚧 MVP implemented through dynamic availability. Next work: production hardening, end-to-end Firebase verification, and final sales/demo polish.
