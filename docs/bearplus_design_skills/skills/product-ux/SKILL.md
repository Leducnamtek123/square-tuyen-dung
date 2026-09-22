---
name: product-ux
description: Designs the user experience before styling it. Information architecture, primary/secondary flows, hierarchy, and complete UI states.
---

# Product UX

## Objective
Design the experience before styling it.

## Workflow
1. Identify users and jobs-to-be-done.
2. Map the primary task.
3. Define information architecture.
4. Define the happy path.
5. Define edge cases.
6. Define all UI states.
7. Identify decision points and friction.
8. Prototype the smallest coherent flow.

## Required states
- initial
- loading
- empty
- populated
- partial
- success
- error
- permission denied
- disabled
- offline/network failure where relevant
- destructive confirmation
- unsaved changes where relevant

## Hierarchy
For every screen identify:
- primary action
- primary information
- secondary information
- contextual information
- escape/back path

## Rules
- Do not add sections just to make a page look full.
- Reduce cognitive load before adding visual polish.
- Never hide important system status behind decoration.
- Preserve user intent through every transition.
