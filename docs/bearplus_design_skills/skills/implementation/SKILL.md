---
name: implementation
description: Translates approved design into production code without degrading concept, introducing magic numbers, or inventing fake data.
---

# Design Implementation

## Objective
Translate approved design intent into production-quality code without degrading the concept.

## Before coding
Read:
- product requirements
- design direction
- component rules
- tokens
- interaction/motion requirements
- responsive requirements
- accessibility requirements

## Implementation rules
- reuse established primitives
- use semantic HTML
- keep content/data separate from presentation
- avoid magic numbers when tokens apply
- avoid fake data and invented business logic
- preserve loading/error/empty states
- preserve exact product terminology
- do not silently "fix" unknown backend values
- do not use `any` as a shortcut
- do not replace real APIs with mock behavior unless explicitly requested

## Refactor
After implementation inspect:
- duplication
- component boundaries
- naming
- responsive behavior
- performance
- accessibility
- visual drift
