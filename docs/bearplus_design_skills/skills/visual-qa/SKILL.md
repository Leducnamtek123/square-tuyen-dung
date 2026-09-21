---
name: visual-qa
description: Screenshot-based inspection, visual regression thinking, and hierarchy-first inspection across viewports.
---

# Visual QA

## Method
1. Render the implementation at target viewports.
2. Compare against the intended design.
3. Inspect hierarchy first.
4. Inspect spacing/grid.
5. Inspect typography.
6. Inspect color/borders/shadows.
7. Inspect interaction states.
8. Inspect responsive transformations.
9. Inspect accessibility.
10. Prioritize fixes.

## Do not obsess over pixels first
Fix in this order:
1. wrong structure
2. wrong hierarchy
3. wrong typography
4. wrong spacing
5. wrong component behavior
6. wrong visual details
7. tiny pixel differences

## Report
For each issue:
- severity
- location
- observed
- intended
- likely cause
- recommended fix
