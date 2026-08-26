# Todo Checklist: Mobile Responsive Overhaul

## Phase 1: Foundation Layout, Spacing & Form Popup
- [x] Task 1.1: Optimize MuiShellLayout padding for xs and prevent toolbar overflow
- [x] Task 1.2: Standardize section top margins on HomePage & JobPage
- [x] Task 1.3: Safe area padding for FormPopup on fullscreen mobile
- [x] Task 1.4: Mobile action buttons and spacing in CompanyHeader

## Phase 2: Data Grids, Filters & Tables
- [x] Task 2.1: Implement responsive stacked layout for TablePagination
- [x] Task 2.2: Add touch scrolling and mobile pagination handling in DataTable
- [x] Task 2.3: Fix GlobalFilterBar select width and alignment on mobile
- [x] Task 2.4: Ensure 44px touch targets in JobPostSearchAdvancedFilters

## Phase 3: Interactive Portals (Chat, Kanban, OrgChart)
- [x] Task 3.1: Constrain EmojiPicker width in ChatWindowComposer
- [x] Task 3.2: Add quick status change action on mobile cards in AppliedResumeKanban
- [x] Task 3.3: Optimize indentation and touch scrolling in OrgChartPage
- [x] Task 3.4: Collapse header action buttons on mobile in OrgChartPage

## Verification
- [x] Run `npm run typecheck` (Passed - Exit Code 0)
- [x] Verify viewports at 360px, 375px, 768px, 1440px
