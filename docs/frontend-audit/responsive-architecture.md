# Frontend Responsive Architecture Specification

## 1. Breakpoint Strategy & Framework Coexistence
Square Tuyen Dung employs a dual-engine styling architecture:
- **Tailwind CSS v4** (`@tailwindcss/postcss`, utility classes)
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px
- **Material UI v6 / Emotion** (`@mui/material`, `themeConfigs/defaultTheme.ts`)
  - `xs`: 0px
  - `sm`: 600px
  - `md`: 900px
  - `lg`: 1200px
  - `xl`: 1536px

### Critical Architectural Finding (FE-RESP-SYS-001):
The mismatch between Tailwind's `md` (768px) and MUI's `md` (900px) causes layout dissonance in viewports between 768px and 900px when MUI `Grid` or `useMediaQuery` is mixed with Tailwind responsive utility classes.

---

## 2. Layout Container Widths & Scaling Rules
- **Public & Job Discovery**: Standard container max-width `max-w-7xl` (1280px) with fluid padding `px-4 sm:px-6 lg:px-8`.
- **Candidate Portal**: Sidebar + fluid main content area with sticky sub-headers.
- **Employer Portal**: Collapsible 260px / 72px sidebar + header + fluid table/kanban container.
- **Admin Portal**: Fixed/collapsible 260px sidebar + top navbar + dynamic data grid containers.
- **Interview AI Room**: 100vh / 100dvh full-screen responsive grid with dynamic aspect ratio preservation.

---

## 3. Viewport Target Matrix
The following viewport tiers must be continuously verified:
- **Ultra-compact Mobile**: `320px` (iPhone SE 1st gen / narrow devices)
- **Standard Mobile**: `375px`, `390px`, `414px` (iPhone 12/13/14/15, Android standard)
- **Tablet Portrait**: `768px` (iPad Mini / standard tablets)
- **Tablet Landscape / Small Desktop**: `1024px` (iPad Pro / small laptops)
- **Standard Desktop**: `1280px`, `1440px` (MacBook Air / 1080p scaled)
- **Large & High-DPI Desktop**: `1920px` (Full HD / 2K monitors)

---

## 4. Key Responsive Anti-Patterns & Elimination Rules
1. **Fixed Width Overflows**: Disallow fixed pixel widths (e.g. `w-[500px]`) without max-width bounds (`max-w-full`).
2. **Double Scrollbars**: Prevent nested `overflow-y-auto` inside layout bodies that already scroll at window level.
3. **Table Mobile Degradation**: All 55 tables must have horizontal scroll wrappers (`overflow-x-auto`) or switch to card view below 768px.
4. **Action Button Wrapping**: Modal footers and table row actions must stack vertically or use responsive flex-wrap on viewports < 640px.
