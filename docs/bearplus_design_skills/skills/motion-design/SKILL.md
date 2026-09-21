---
name: motion-design
description: Governs motion hierarchy, timing, easing, choreography, scroll-driven animation, and micro-motion for comprehension.
---

# Motion Design

## Motion hierarchy
1. System feedback
2. Navigation/context transitions
3. Content reveal
4. Brand moments
5. Decorative motion

Higher-priority motion must remain clear even when decorative motion is removed.

## Define
- trigger
- duration
- delay
- easing
- distance/scale
- origin
- choreography
- interruption behavior
- reduced-motion behavior

## Principles
- continuity
- spatial consistency
- anticipation
- feedback
- hierarchy
- restraint

## Web motion
Use CSS first for simple transitions.
Use Framer Motion for component/state choreography when appropriate.
Use GSAP for complex timeline/scroll choreography.
Use Three.js/WebGL only when the experience genuinely benefits from it.

## Performance
Avoid:
- layout thrashing
- unnecessary scroll listeners
- excessive blur
- large animated DOM trees
- motion that blocks interaction
