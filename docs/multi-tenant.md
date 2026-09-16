# ALINDA Multi-Tenant Core

Phase 2 establishes the rule that one ALINDA deployment serves multiple businesses while each business has its own public slug and configuration.

## Public route

Each business is addressable through:

`/{slug}`

Examples:

- `/meltem-guzellik`
- `/ahmet-berber`

Unknown slugs return a 404 response.

## Business identity

The public booking page currently consumes a tenant-safe `Business` model containing:

- id
- name
- slug
- category
- description
- city / district / address
- phone
- initials
- primary color tokens
- services

Internal fields such as owner identity and subscription data are intentionally not part of this public model.

## Development data

`lib/mock/businesses.ts` provides seed data while the Firebase project is being connected. The seed layer makes it possible to develop and verify tenant routing before production persistence is enabled.

## Firebase direction

Firebase is now included in the project and the client initialization is scaffolded in `lib/firebase/client.ts`. Environment variables are documented in `.env.example`.

The next Phase 2 step is to connect the real Firestore `businesses` collection and replace the mock lookup without exposing tenant-internal fields.
