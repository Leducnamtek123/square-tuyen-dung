# ❓ Clarification & Question Protocol

> **Ecosystem**: Square Tuyển Dụng (InfoHR)  
> **Standard**: Evidence Over Assumption & Ambiguity Resolution  
> **Audience**: Software Engineers, Product Owners & AI Assistants

---

## 1. 📌 Core Philosophy: Evidence Over Assumption

In complex enterprise platforms like InfoHR, silent assumptions lead to schema corruption, security vulnerabilities, and broken contracts between the Voice AI engine, backend APIs, and frontend portals.

> **Golden Rule**: If a requirement is underspecified, contradictory, or architecturally sensitive, **PAUSE AND ASK**. Never invent non-existent database columns, API endpoints, or business workflows.

---

## 2. 🛑 When You MUST Pause & Ask Clarification

You must trigger this protocol whenever:

1. **Underspecified Requirements**: A feature request lacks clear inputs, outputs, error handling, or user roles.
2. **Conflicting Specifications**: A new requirement contradicts existing business logic, database constraints, or ADR decisions.
3. **Destructive Operations**: Changes involving database column drops, schema alterations, or permission escalations.
4. **Third-Party Integration Boundaries**: Unknown API rate limits, payload contracts, or authentication schemes for external LLM/TTS services.
5. **Architectural Forks**: Multiple valid technical implementations exist with significant trade-offs (e.g. Polling vs WebSocket, Client-side vs Server-side PDF generation).

---

## 3. 🎯 The 4-Step Question Formulation Framework

When asking questions to team leads, product owners, or users, structure questions according to this standard format:

```text
### 1. Context & Goal
[Brief 1-2 sentence description of what is being built or solved]

### 2. Specific Ambiguity / Decision Point
[What exact question or fork in the road needs clarification]

### 3. Evaluated Options & Trade-offs
- **Option A**: [Description]
  - *Pros*: [Benefits]
  - *Cons*: [Drawbacks / Complexity]
- **Option B**: [Description]
  - *Pros*: [Benefits]
  - *Cons*: [Drawbacks / Complexity]

### 4. Recommendation & Next Step
[Our recommended choice based on current architecture and DoD standards]
```

---

## 4. 📝 Living Documentation in Feature Specs

Every new feature directory in `docs/features/<YYYY-MM-DD-feature-name>/` MUST include a `questions.md` file:

- **Pending Questions**: Log unresolved items with date and owner.
- **Resolved Decisions**: Record the user/team decision, date, and rationale.
- **Assumptions**: Explicitly list all temporary working assumptions made while awaiting feedback.

---

## 5. 🚫 Red Flags (What NOT to Do)

| ❌ Anti-Pattern | ✅ Correct Behavior |
| :--- | :--- |
| Silently creating a mock API response shape when backend is unbuilt | Ask for DRF serializer specification or propose a contract in `questions.md`. |
| Guessing candidate scoring formulas for the Voice AI interviewer | Ask Product Owner or reference `docs/BUSINESS_REQUIREMENTS.md`. |
| Asking trivial yes/no questions without proposing solutions | Provide concrete options and state a clear recommendation. |
| Making breaking changes to existing models without migration review | Stop, document risks, and outline a backward-compatible migration plan. |
