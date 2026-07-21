# Header Breadcrumb Design

## Goal

Move portal breadcrumbs out of child page layouts and into the shared header UI for both employer and admin sidebar layouts.

## Scope

This applies to authenticated `employer` and `admin` pages that use `EmployerLayout` or `AdminLayout`. Public employer pages, auth pages, chat layout pages, candidate interview pages, and public job seeker pages keep their existing layouts.

## User-Facing Behavior

The fixed blue header shows the breadcrumb trail on the left side after the mobile drawer button. The right side keeps language switching, notifications, chat, and user menu unchanged.

For `/employer/question-groups`, the breadcrumb is the localized equivalent of:

`Employer / Online Interview / Question Groups`

The `QuestionGroupsCard` page content no longer renders its own breadcrumb. Other child pages with page-level breadcrumbs follow the same rule so breadcrumbs are not duplicated inside cards or page bodies.

## Architecture

Add a small breadcrumb route metadata helper that maps canonical route paths to breadcrumb labels and hrefs. The shared employer/admin header reads `usePathname()`, resolves the current breadcrumb trail, and renders it as a compact MUI `Breadcrumbs` component.

Route matching supports canonical English paths and localized Vietnamese paths by normalizing path segments through the existing route localization utilities. Dynamic routes match by pattern, for example `employer/interviews/:id`.

## Components

- `src/configs/portalBreadcrumbs.ts`: defines route breadcrumb metadata and resolver utilities.
- `src/layouts/components/employers/Header/index.tsx`: renders resolved breadcrumbs in the shared header.
- Child page files that currently render MUI `Breadcrumbs`: remove those breadcrumb imports/markup when the page uses `EmployerLayout` or `AdminLayout`.

## Styling

Breadcrumbs use white/transparent header styling, fit inside the existing fixed header height, truncate long labels, and hide gracefully on narrow mobile widths if needed. Header controls on the right remain aligned with the screenshot.

## Testing

Add unit tests for the breadcrumb resolver covering:

- employer question groups
- employer interview dynamic detail route
- admin question groups
- Vietnamese localized employer question groups
- unknown route returns no breadcrumb

Run targeted tests, typecheck, and render QA for `/employer/question-groups` with desktop and mobile screenshots.
