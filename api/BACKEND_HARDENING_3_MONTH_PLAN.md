# Backend Hardening Plan (3 Months / 6 Sprints)

## Goal
- Zero authorization leaks due to role/ownership mistakes.
- Standardized API contract for all responses (success + error).
- Clear layering: views orchestrate, services own business logic.

## Rollout Safety
- `API_RESPONSE_ENVELOPE_V2` feature flag is enabled by default.
- Can set `API_RESPONSE_ENVELOPE_V2=false` to fallback to legacy envelope while migrating clients.

## Sprint Breakdown

### Sprint 1 (Done - foundation delivered)
- Added centralized DRF exception handler: `shared.exceptions.api_exception_handler`.
- Standardized response helper + renderer to unified envelope.
- Added feature flag for safe rollout: `API_RESPONSE_ENVELOPE_V2`.
- Fixed critical runtime response bugs (`response_data(...)` misuse).
- Normalized a few 404/500 mappings in sensitive actions.

### Sprint 2 (In progress - authorization policy)
- Added `PermissionActionMapMixin` to reduce typo-prone `get_permissions` branches.
- Applied mixin to critical modules:
  - Jobs app/web entrypoints.
  - Profiles resume app/web entrypoints.
- Hardened role constraints on sensitive actions (`save_job`, resume owner actions).

### Sprint 3
- Move remaining business logic from Views into Services for Jobs + Profiles.
- Add service-level unit tests for apply/resume/company follow/save flows.

### Sprint 4
- Isolate Interview + AI integrations behind integration/service boundary.
- Enforce transaction boundaries for critical status transition flows.

### Sprint 5
- De-duplicate web/app code paths through shared use-cases and DTO mapping.

### Sprint 6
- Structured logging (JSON): request_id, user_id, role, endpoint latency.
- Error taxonomy + alert wiring for 5xx spikes.
- Performance pass for N+1 and expensive list endpoints.

## Mandatory Engineering Rules
- No broad `except Exception` unless re-raising domain-safe error.
- No business logic in serializer `create/update` for complex flows.
- No new role checks inline; must use shared permission/policy layer.
- No duplicated web/app business rules; service/use-case must be shared.

## Verification Matrix (required in CI)
- Roles: `public`, `jobseeker`, `employer`, `admin`.
- Endpoint classes:
  - ownership-protected resources,
  - role-protected actions,
  - anonymous access endpoints,
  - mutation flows with state transitions.
