# ALINDA Design System

> Phase 1 — visual foundation for ALINDA Booking.

## 1. Design Direction

ALINDA should feel **premium, calm, modern and trustworthy** rather than like a generic admin template.

Core principles:

- Warm neutral surfaces instead of cold pure-white layouts.
- Strong dark typography for contrast and clarity.
- Restrained accent usage; color should support actions, not dominate the UI.
- Generous whitespace and soft depth.
- Mobile-first interactions.
- Business pages can inherit a business-specific accent without changing the ALINDA identity.

## 2. Core Colors

### Brand / Neutral

| Token | Value | Usage |
|---|---|---|
| `--alinda-ink` | `#181614` | Primary text, primary buttons |
| `--alinda-ink-soft` | `#3A3733` | Secondary text |
| `--alinda-cream` | `#FAF8F5` | Main application background |
| `--alinda-surface` | `#FFFFFF` | Cards, sheets, inputs |
| `--alinda-line` | `#E8E2DA` | Borders and dividers |
| `--alinda-muted` | `#8A847C` | Muted text |
| `--alinda-accent` | `#B86F61` | Highlights and selected states |
| `--alinda-accent-soft` | `#F3E4E0` | Accent backgrounds |
| `--alinda-success` | `#3E7A5C` | Success states |
| `--alinda-danger` | `#B64C4C` | Error/destructive states |

Business themes should use CSS variables such as `--business-primary` and `--business-primary-soft`. The ALINDA shell remains visually consistent while each business can have its own recognizable accent.

## 3. Typography

Primary typeface: **Geist Sans**.

Hierarchy:

- Display: 48–64px / 1.05 / semibold
- H1: 36–48px / 1.1 / semibold
- H2: 28–36px / 1.15 / semibold
- H3: 20–24px / 1.25 / semibold
- Body: 15–16px / 1.55 / regular
- Small: 13–14px / 1.45 / regular
- Caption: 12px / 1.4 / medium

Avoid excessive font weights. Most screens should rely on regular, medium and semibold.

## 4. Spacing

Use a 4px base grid:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96`

Page content should normally use:

- Mobile horizontal padding: 16px
- Tablet: 24px
- Desktop: 32px
- Maximum content width: 1200px

## 5. Radius

- `sm`: 10px
- `md`: 14px
- `lg`: 20px
- `xl`: 28px
- `pill`: 999px

Cards generally use `lg`; buttons and inputs use `md`.

## 6. Elevation

Depth should stay subtle.

- Card: `0 1px 2px rgba(24, 22, 20, 0.04)`
- Elevated: `0 12px 32px rgba(24, 22, 20, 0.08)`
- Modal: `0 24px 64px rgba(24, 22, 20, 0.14)`

Prefer borders + very soft shadows over heavy shadows.

## 7. Buttons

### Primary

Dark ink background, white text.

Use for the main action: `Randevu Al`, `Kaydet`, `Devam Et`.

### Secondary

Surface background with ink border/text.

### Accent

Accent background with white text. Use sparingly for business-specific actions.

### Ghost

Transparent, no border. Use for low-emphasis navigation actions.

Button heights:

- Small: 36px
- Medium: 44px
- Large: 52px

Buttons should have a visible keyboard focus ring and disabled state.

## 8. Inputs & Controls

Inputs use:

- 44–48px height
- 14px radius
- 1px `--alinda-line` border
- Clear focus ring
- Comfortable 12–14px horizontal padding

Error text appears directly below the field. Do not rely on color alone; include an icon or text explanation.

## 9. Cards

Cards are used heavily in both the public booking page and business panel.

Default card:

- White surface
- 1px warm border
- 20px radius
- 20–24px internal padding
- Minimal shadow

Interactive cards should use a subtle border/background transition on hover.

## 10. Public Business Page

The public page is the primary customer-facing experience.

Structure:

```text
Business Header
    ↓
Business Identity / Hero
    ↓
Service Selection
    ↓
Date Selection
    ↓
Available Times
    ↓
Customer Details
    ↓
Booking Confirmation
```

The experience should feel closer to a premium service website than an enterprise form.

### Business header

- Logo/avatar
- Business name
- Location
- Optional phone/social actions
- Compact mobile layout

### Service cards

Show:

- Service name
- Short description when useful
- Duration
- Price
- Selected state

### Date selector

On mobile, use a horizontal date rail. On desktop, it can become a compact calendar/date grid.

### Time slots

Use clear pill/button slots. Unavailable times should not be visually confused with selectable times.

### Booking CTA

On mobile, keep the primary booking action accessible near the bottom of the viewport when practical.

## 11. Business Panel

Panel visual language is more functional but keeps the same brand system.

Suggested shell:

```text
┌─────────────────────────────────────────────┐
│ ALINDA                 Business / Profile   │
├──────────────┬──────────────────────────────┤
│ Dashboard    │                              │
│ Randevular   │       Main Content           │
│ Hizmetler    │                              │
│ Çalışma Saat │                              │
│ Ayarlar      │                              │
└──────────────┴──────────────────────────────┘
```

Desktop: persistent sidebar.

Mobile: compact top bar + bottom navigation or sheet navigation depending on screen complexity.

Dashboard cards should prioritize:

- Today's appointments
- Upcoming appointments
- Booking count
- Quick actions

## 12. Responsive Breakpoints

- Mobile: `< 640px`
- Tablet: `640–1023px`
- Desktop: `1024–1279px`
- Wide desktop: `1280px+`

Never depend on hover for essential functionality.

## 13. Motion

Motion should communicate state and hierarchy, not decorate every element.

- Fast interaction: 150ms
- Standard transition: 200ms
- Larger entrance: 250ms
- Easing: ease-out

Use subtle opacity/translate transitions for cards and page sections.

Respect `prefers-reduced-motion` and disable non-essential movement when requested.

## 14. Iconography

Use **Lucide Icons** consistently.

Rules:

- Default stroke width: 2
- Avoid mixing icon families.
- Icons should support labels rather than replace important text.
- Standard icon sizes: 16, 18, 20, 24px.

## 15. Accessibility

Minimum requirements for Phase 1:

- Keyboard-visible focus states
- Semantic buttons and links
- Labels for all form controls
- Sufficient text/background contrast
- Never communicate state using color alone
- Respect reduced motion
- Touch targets around 44px or larger

## 16. Component Inventory

Phase 1 component foundation:

- `Button`
- `IconButton`
- `Input`
- `Textarea`
- `Select`
- `Badge`
- `Card`
- `Avatar`
- `Divider`
- `Modal`
- `Toast`
- `Tabs`
- `DatePicker`
- `TimeSlot`
- `ServiceCard`
- `BusinessHeader`
- `PageContainer`
- `SectionHeader`

## 17. Phase 1 Definition of Done

- [x] Visual direction defined
- [x] Color tokens defined
- [x] Typography defined
- [x] Spacing/radius defined
- [x] Button and card rules defined
- [x] Public booking visual structure defined
- [x] Panel visual structure defined
- [x] Responsive rules defined
- [x] Motion/accessibility rules defined
- [ ] Implement tokens in the Next.js app
- [ ] Implement base UI components
- [ ] Build the first public business-page visual prototype
