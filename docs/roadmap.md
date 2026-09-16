# ALINDA Booking — Product Roadmap

This roadmap is the working implementation plan for taking ALINDA from the current MVP to a production-ready booking platform.

## Current Status

- [x] Firebase project created
- [x] Blaze billing enabled
- [x] Firebase Authentication — Email/Password
- [x] Firestore database
- [x] Firestore security rules published
- [x] Firebase Storage bucket
- [x] Storage security rules published
- [x] Business demo data
- [x] Services persistence
- [x] Working hours persistence
- [x] Public booking flow persistence
- [x] Booking conflict protection
- [x] Dynamic availability
- [x] Landing/demo page
- [ ] Production deployment — intentionally postponed

---

## Phase 10 — Panel Hardening & Business Management

**Goal:** Make the business panel reliable enough for real businesses.

- [ ] Review dashboard structure and navigation
- [ ] Business profile editing
- [ ] Business contact/address/category editing
- [ ] Service create/edit/delete UX polish
- [ ] Working hours UX polish
- [ ] Loading, empty and error states
- [ ] Toast/feedback states
- [ ] Owner-only access verification across every panel route
- [ ] Mobile responsive panel review

## Phase 11 — Appointment Management

**Goal:** Turn incoming bookings into a usable appointment management workflow.

- [ ] Appointment list refinement
- [ ] Appointment detail view
- [ ] Pending / confirmed / rejected / cancelled statuses
- [ ] Confirm appointment
- [ ] Reject appointment
- [ ] Cancel appointment
- [ ] Date filtering
- [ ] Status filtering
- [ ] Customer search
- [ ] Appointment history
- [ ] Empty states and operational feedback

## Phase 12 — Business Profile & Media

**Goal:** Give each business a professional public identity.

- [ ] Business profile editor
- [ ] Logo upload
- [ ] Cover image upload
- [ ] Storage upload UI
- [ ] Image preview / replace / delete
- [ ] Social media fields
- [ ] Public profile presentation
- [ ] Theme/color customization
- [ ] Validate Storage rules against real upload flows

## Phase 13 — Customer Booking Experience

**Goal:** Make the public booking journey production-quality.

- [ ] Service selection UX polish
- [ ] Date selection UX polish
- [ ] Dynamic time selection UX polish
- [ ] Customer information form validation
- [ ] Booking confirmation screen
- [ ] Booking reference / confirmation details
- [ ] Prevent invalid or stale selections
- [ ] Improve mobile booking experience
- [ ] Error recovery for slot conflicts

## Phase 14 — Security & Edge Cases

**Goal:** Harden the multi-tenant system before production.

- [ ] Full Firestore Rules review
- [ ] Full Storage Rules review
- [ ] Verify tenant isolation
- [ ] Verify unauthorized business access is blocked
- [ ] Verify booking creation shape validation
- [ ] Verify slot collision protection
- [ ] Handle deleted/disabled services safely
- [ ] Handle closed days and past times
- [ ] Review public data exposure
- [ ] Consider separating public business data from internal tenant data
- [ ] Add App Check when appropriate for production

## Phase 15 — Premium UI & UX Polish

**Goal:** Make ALINDA feel like a polished commercial SaaS product.

- [ ] Responsive review across desktop/tablet/mobile
- [ ] Skeleton loading states
- [ ] Smooth page transitions
- [ ] Micro-interactions
- [ ] Modal/drawer polish
- [ ] Form validation polish
- [ ] Typography and spacing consistency
- [ ] Empty/error/success state design
- [ ] Accessibility review
- [ ] Final visual consistency pass

## Phase 16 — Firebase Integration & End-to-End Verification

**Goal:** Verify the complete production data flow before deployment.

- [ ] Connect local development environment with `.env.local`
- [ ] Verify Firebase Web SDK configuration
- [ ] Verify Authentication login/logout
- [ ] Verify Firestore reads/writes
- [ ] Verify Storage upload/delete
- [ ] Verify booking creation
- [ ] Verify slot conflict protection
- [ ] Verify panel permissions
- [ ] Verify public booking availability
- [ ] Run end-to-end manual test scenarios
- [ ] Fix all discovered production blockers

## Phase 17 — Production Deployment

**Goal:** Put ALINDA online after the product is ready.

- [ ] Create Firebase App Hosting backend
- [ ] Connect `furukcell/alinda-booking` GitHub repository
- [ ] Connect `main` as live branch
- [ ] Configure environment variables/secrets
- [ ] Configure production Firebase settings
- [ ] First deployment
- [ ] Verify live URL
- [ ] Verify public booking page in production
- [ ] Verify `/login` and `/panel` in production
- [ ] Verify Firebase services from the deployed app
- [ ] Configure custom domain when ready
- [ ] Add production monitoring/log review

## Phase 18 — Sales-Ready Release

**Goal:** Make ALINDA ready for demonstrations and first paying businesses.

- [ ] Final landing page polish
- [ ] Demo business data polish
- [ ] Sales/demo flow verification
- [ ] Pricing presentation
- [ ] Onboarding flow
- [ ] Business setup checklist
- [ ] Customer-facing booking link sharing
- [ ] Production launch checklist
- [ ] First real-business pilot

---

## Working Order

We will work **one phase at a time** and only mark an item complete after it has been implemented and verified.

**Current next phase:** Phase 10 — Panel Hardening & Business Management

**Deployment policy:** Production deployment is intentionally postponed until the core product, security, UX and end-to-end Firebase flow have been verified.
