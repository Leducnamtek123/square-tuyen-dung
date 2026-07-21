# InfoHR White-First Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the InfoHR UI to use a white-first palette with pink as the primary accent, so the product feels cleaner, calmer, and less color-conflicted while still matching the logo.

**Architecture:** We will treat the palette as a design-token problem first, then apply it to shared chrome components, then finish the largest content surfaces. The implementation keeps existing layouts and branding assets, but reduces saturated pink/magenta surfaces to small accents, outlines, CTA states, and focus rings.

**Tech Stack:** Next.js App Router, React, MUI v6, Tailwind-based global CSS variables, existing shared layout components.

---

### Task 1: Rebase the design tokens to a white-first brand palette

**Files:**
- Modify: `frontend/src/themeConfigs/defaultTheme.ts`
- Modify: `frontend/src/utils/muiColors.ts`
- Modify: `frontend/src/components/ThemeRegistry/ThemeRegistry.tsx`
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Verify the current palette hot spots**

Run:
`rg -n "ff0f5b|d81b60|ff6a9a|d1004f|7f0030|fff4f8|ffc3d5|ff97b5" frontend/src/themeConfigs/defaultTheme.ts frontend/src/utils/muiColors.ts frontend/src/components/ThemeRegistry/ThemeRegistry.tsx frontend/src/app/globals.css`

Expected: the palette is still leaning too hard on pink/magenta and rose-tinted backgrounds.

- [ ] **Step 2: Update the shared design tokens**

Set the base UI to these values:

```ts
// frontend/src/themeConfigs/defaultTheme.ts
const colors = {
  primary: {
    light: '#ff6a9a',
    main: '#ff0f5b',
    dark: '#d81b60',
    contrastText: '#ffffff',
    background: 'rgba(255, 15, 91, 0.06)',
    gradient: 'linear-gradient(45deg, #ff0f5b 30%, #ff6a9a 90%)',
  },
  info: {
    main: '#ff0f5b',
    light: '#ff6a9a',
    dark: '#d81b60',
    contrastText: '#ffffff',
    background: 'rgba(255, 15, 91, 0.06)',
  },
  grey: {
    50: '#ffffff',
    100: '#f8fafc',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1f2937',
    900: '#0f172a',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
    placeholder: '#94a3b8',
    italic: { fontStyle: 'italic' },
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
};
```

Mirror the same intent in `frontend/src/utils/muiColors.ts` with `bgDefault: '#ffffff'`, `divider: '#e2e8f0'`, and `info: '#ff6a9a'`.

Set global CSS variables in `frontend/src/app/globals.css` so `--background`, `--card`, `--popover`, and sidebar surfaces are white, with borders in `#e2e8f0` and accent only in `#ff0f5b`.

Keep dark mode usable, but avoid the current overly saturated contrast by using the existing dark shell as a restrained fallback instead of a second brand identity.

- [ ] **Step 3: Tighten MUI overrides**

Update `frontend/src/components/ThemeRegistry/ThemeRegistry.tsx` so cards, app bars, buttons, and focus rings use:
- white or off-white surfaces
- subtle slate shadows
- pink only for primary CTA and focus highlights

Ensure contained primary buttons still use pink, but outlined/text buttons are mostly neutral with pink hover/focus accents.

- [ ] **Step 4: Run token verification**

Run:
`npx jest src/components/Common/MaintenanceModeScreen/__tests__/MaintenanceModeScreenI18n.test.ts --runInBand`

Run:
`npx tsc --noEmit -p tsconfig.json`

Expected: pass with no palette-related type or build errors.

### Task 2: Rebuild the shared shell chrome as a white header/footer system

**Files:**
- Modify: `frontend/src/layouts/components/commons/Header/index.tsx`
- Modify: `frontend/src/layouts/components/commons/Header/HeaderNavLinks.tsx`
- Modify: `frontend/src/layouts/components/commons/Header/HeaderAuthArea.tsx`
- Modify: `frontend/src/layouts/components/commons/Footer/index.tsx`

- [ ] **Step 1: Verify the current shell surfaces**

Run:
`rg -n "linear-gradient|rgba\\(255, 255, 255, 0.12\\)|#ff0f5b|#d1004f|#7f0030|backgroundColor: '#ff|backgroundColor: '#fff4f8'" frontend/src/layouts/components/commons/Header frontend/src/layouts/components/commons/Footer`

Expected: header/footer still show a strong pink-red treatment.

- [ ] **Step 2: Rebuild the common header**

Change `frontend/src/layouts/components/commons/Header/index.tsx` to a white translucent AppBar:
- background `rgba(255,255,255,0.92)`
- shadow `rgba(15, 23, 42, 0.08)`
- border bottom `rgba(226,232,240,0.9)`
- text color `#1f2937`

Update the vertical divider and icon spacing to match the lighter shell.

In `HeaderNavLinks.tsx`, use slate text and a pink-tinted active state:
- active background `rgba(255, 15, 91, 0.08)`
- active border `rgba(255, 15, 91, 0.16)`
- hover background `rgba(255, 15, 91, 0.05)`

In `HeaderAuthArea.tsx`, make the login/register controls feel like clean white pills:
- login button: outlined or light surface with pink text/border
- register button: solid pink primary CTA
- authenticated avatar card: white surface, slate border, subtle shadow

- [ ] **Step 3: Rebuild the footer as a quiet neutral block**

Update `frontend/src/layouts/components/commons/Footer/index.tsx` to a white background, `1px` top border in `#e2e8f0`, navy/slate text, and pink only for hover or small border accents.

Keep the existing content structure, but remove the rose-tinted footer background so the page ends on a calm surface.

- [ ] **Step 4: Validate the shell visually**

Run:
`npx jest src/layouts/components/commons/__tests__/CommonEmployerNavigationRoutes.test.ts --runInBand`

Expected: pass, and the header/footer still route correctly.

### Task 3: Restyle the home hero and other large surfaces to stop the color clash

**Files:**
- Modify: `frontend/src/views/defaultPages/HomePage/index.tsx`
- Modify: `frontend/src/app/globals.css` if hero atmosphere needs tuning
- Modify: `frontend/src/views/authPages/AdminLogin/index.tsx` if its card still reads too pink against the new shell
- Modify: `frontend/src/components/Features/ChatBot/chatbot.css` and/or `frontend/src/components/Features/ChatBot/index.tsx` if the launcher needs softer contrast

- [ ] **Step 1: Verify the hero and hero-adjacent surfaces**

Run:
`rg -n "backgroundImage: `linear-gradient|backgroundColor: '#ff0f5b'|backgroundColor: '#d1004f'|backgroundColor: '#fff4f8'|boxShadow: '0 8px 18px rgba\\(255, 15, 91|rgba\\(255, 255, 255, 0.12\\)" frontend/src/views/defaultPages/HomePage/index.tsx frontend/src/views/authPages/AdminLogin/index.tsx frontend/src/components/Features/ChatBot/index.tsx frontend/src/components/Features/ChatBot/chatbot.css frontend/src/app/globals.css`

Expected: the home page still has too much blue + pink contrast and needs a calmer composition.

- [ ] **Step 2: Make the home page white-led**

In `frontend/src/views/defaultPages/HomePage/index.tsx`:
- keep the image hero, but remove any pink-heavy gradient overlays
- let the hero image stay mostly natural with a light navy or transparent scrim
- use pink only for the search button, chips, and small emphasis states
- keep CTAs readable on white cards

If the hero needs a background treatment, use a subtle white-to-slate overlay, not a strong magenta wash.

- [ ] **Step 3: Smooth the remaining utility surfaces**

Make the admin login card, chatbot launcher, and any major banners follow the same rule:
- white or very light surface
- slate text
- pink for CTA/focus only
- no full-width pink background blocks unless they are tiny badges or button fills

- [ ] **Step 4: Rebuild and smoke test the app**

Run:
`docker compose -f frontend/docker-compose.yaml up -d --build frontend_dev`

Run:
`npx tsc --noEmit -p tsconfig.json`

Expected: container rebuild succeeds, typecheck passes, and the local UI reflects the white-first palette.

### Task 4: Final QA and cleanup

**Files:**
- Modify: any remaining file flagged by the `rg` scans above

- [ ] **Step 1: Scan for leftover strong pink-red surfaces**

Run:
`rg -n "#ff0f5b|#d1004f|#7f0030|#fff4f8|rgba\\(255, 15, 91|rgba\\(255, 92, 138|rgba\\(255, 106, 154" frontend/src`

Expected: only deliberate accent uses remain, not large surfaces.

- [ ] **Step 2: Run targeted UI regression tests**

Run:
`npx jest src/components/Features/ChatBot/__tests__/ChatBotI18n.test.ts src/components/Common/MaintenanceModeScreen/__tests__/MaintenanceModeScreenI18n.test.ts src/layouts/components/commons/__tests__/CommonEmployerNavigationRoutes.test.ts --runInBand`

Expected: all targeted suites pass.

- [ ] **Step 3: Leave a clean handoff**

Commit the palette pass with a message like:
`git commit -m "feat: rebalance InfoHR palette to white-first"`

