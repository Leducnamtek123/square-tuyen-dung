# Implementation Plan: CV Templates Overhaul

## Overview
Overhaul all 8 CV templates in `frontend/src/views/cvBuilderPages/templates`, eliminating hardcoded strings, resolving dark mode and color-clashing bugs, fixing duplicated DOM nodes in `NordicTemplate`, providing full bilingual i18n support, and connecting dynamic theme sizing/spacing.

## Architecture Decisions
1. **Centralized Bilingual Dictionary**: Extract all textual labels into `cvDictionary.ts` supporting `vi` and `en` with type safety.
2. **Dynamic Theme Engine**: Calculate responsive font sizing, spacing, avatar borders, and color tints via `themeStyles.ts` to respect user customizations.
3. **Smart Avatar & Date Formatters**: Provide `AvatarRenderer` (with initials fallback) and `DateRangeText` to prevent broken images and dangling punctuation.
4. **Bridge Layer Integration**: Pass language seamlessly from `CVLivePreview` / `PublicCVPage` into `CVTemplateRenderer` down to each template.

## Tasks Breakdown
Refer to `tasks/todo.md` for task items and execution order.
