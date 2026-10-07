# ADR-005: Unified Design System & Multi-Portal Theming

> **Status**: ACCEPTED  
> **Date**: 2026-10-05  
> **Deciders**: Design Lead, Frontend Lead, Product Manager  
> **Consulted**: Marketing, Engineering Staff  
> **Informed**: All Engineering Staff

---

## 1. Context & Problem Statement

InfoHR encompasses 5 distinct portals: Job Seeker (`infohr.vn`), Employer (`employer.infohr.vn`), Voice AI (`aila.infohr.vn`), Admin (`admin.infohr.vn`), and Native HRM (`hrm.infohr.vn`).
Previously, styling conventions varied between portals, causing:
1. Inconsistent brand recognition across commercial domains.
2. Code duplication across UI components (Tables, Modals, Forms, Buttons).
3. Fragmented theme and dark-mode implementations.

We needed a unified, standardized design system aligned with the core Square brand (`square.vn`).

---

## 2. Decision Drivers

- Single Design Token System: Unified palette (Square Primary Orange `#FF5A1F`, Tech Blue `#0066CC`, neutral slate scales).
- Component Reusability: Common data grid, drawers, dialogs, and button primitives across all portals.
- Performance: Minimal CSS bundle overhead using Tailwind CSS v4 and CSS custom properties.
- Accessibility: Guaranteed contrast compliance with WCAG 2.1 AA.

---

## 3. Considered Options

- **Option 1: Tailwind CSS v4 + CSS Custom Properties + Shadcn / Radix UI Primitives**
- **Option 2: Heavy UI Framework (MUI / Ant Design) applied across all pages**
- **Option 3: Separate Tailwind configuration per subdomain**

---

## 4. Decision Outcome

**Chosen Option**: **Option 1 (Tailwind CSS v4 + CSS Custom Properties + Radix/Shadcn Primitives)**.

### Rationale:
1. **Utility-First Speed & Flexibility**: Tailwind CSS v4 provides ultra-fast zero-runtime styling with native CSS variables for theme switching.
2. **Accessible Headless Primitives**: Radix UI delivers battle-tested accessibility (focus management, keyboard shortcuts, ARIA tags) while leaving complete visual control to our brand tokens.
3. **Portal-Specific Accents with Global Cohesion**: Common layout primitives remain identical while individual portals utilize subtle brand accents (e.g. Orange primary for Job Seeker & ATS, Slate/Blue for HRM).

---

## 5. Pros & Cons of the Options

### Option 1: Tailwind CSS v4 + Radix Primitives (Chosen)
- Good: Zero runtime CSS overhead, maximum Lighthouse performance scores.
- Good: Flawless light and dark mode switching via CSS variables.
- Good: 100% accessible primitives out of the box.
- Bad: Requires careful component token discipline across team members.

### Option 2: Heavy UI Framework (Ant Design / MUI full library)
- Good: Pre-built enterprise tables.
- Bad: Massive JavaScript bundle size (>500KB extra), difficult to customize to exact Square branding guidelines.

### Option 3: Separate configs per subdomain
- Good: Strict isolation.
- Bad: High maintenance overhead and severe style drift between teams.
