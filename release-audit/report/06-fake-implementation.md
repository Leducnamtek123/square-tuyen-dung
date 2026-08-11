# STEPS 4, 5 & 6: Fake Implementations, Silent Failures & Lying UIs Audit

This document details all code instances of mock fallbacks, silent exception swallowing, fake toast feedback, empty callbacks, and UIs that lie to the user.

---

## 1. Global Mock Fallback Risk (CRITICAL)

- **File**: [initMock.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/mocks/initMock.ts#L105)
- **Code Pattern**:
```typescript
mock.onAny().reply((config) => {
  console.log(`[Mock Fallback] Handled ${config.method?.toUpperCase()} ${config.url}`);
  return [200, { data: [], results: [], count: 0, success: true }];
});
```
- **Classification**: 🔴 **Production Blocker**
- **Impact**: Any missing backend endpoint returns a `200 OK` empty response, tricking frontend code into treating broken APIs as valid zero-item responses.

---

## 2. Empty Event Handlers & Placeholders

- **Files & Line References**:
  - [ComponentsDesignSystemPage.tsx:L176](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/ComponentsDesignSystemPage.tsx#L176): `onClick={() => {}}`
  - [ComponentsDesignSystemPage.tsx:L195](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/ComponentsDesignSystemPage.tsx#L195): `onClick={() => {}}`
  - [ComponentsDesignSystemPage.tsx:L211](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/adminPages/ComponentsDesignSystemPage.tsx#L211): `EmptyCard` `onClick={() => {}}`
- **Classification**: 🟡 **Risky / UX Deficit**
- **Impact**: Clickable buttons present in admin design system show hover states but trigger no action when clicked.

---

## 3. UIs That Lie to the User

### Case 1: Optimistic Stage Transition without Rollback
- **File**: [AppliedResumeKanban](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/AppliedResumeKanban)
- **Problem**: When a candidate card is dragged to a new status stage, UI state updates immediately. If network request fails, card remains in new column without error notification or optimistic rollback.
- **Classification**: 🔴 **Production Blocker**

### Case 2: Resume Download Toast Feedback
- **File**: [AppliedResumeTable/index.tsx](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/views/components/employers/AppliedResumeTable/index.tsx#L209)
- **Problem**: Clicking download fires `toast.success("Downloading...")` before verifying whether S3 presigned URL is active or HTTP request succeeded.
- **Classification**: 🟡 **Risky**
