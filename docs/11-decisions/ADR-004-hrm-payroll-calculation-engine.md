# ADR-004: Enterprise HRM Payroll Calculation Engine & Vietnam Tax Law

> **Status**: ACCEPTED  
> **Date**: 2026-10-04  
> **Deciders**: Backend Lead, Financial Domain Expert, Architecture Lead  
> **Consulted**: HRM Specialist, QA Lead  
> **Informed**: All Engineering Staff

---

## 1. Context & Problem Statement

InfoHR includes a Native HRM subsystem responsible for generating monthly employee payrolls. Vietnamese labor and personal income tax (PIT) regulations impose specific requirements:
1. Progressive tax brackets: 7 tiers ranging from 5% to 35%.
2. Statutory reliefs: Personal relief of 11,000,000 VND/month and dependent relief of 4,400,000 VND/month per registered dependent (`dependents_count`).
3. Mandatory insurance deductions: Social Insurance (BHXH 8%), Health Insurance (BHYT 1.5%), Unemployment Insurance (BHTN 1%) capped at statutory ceilings.
4. Protection against recalculation: Once a monthly payroll is finalized (`APPROVED` or `PAID`), it must never be overwritten or mutated by automated batch recalculations.

We needed a robust, isolated calculation engine that guarantees financial correctness and auditability.

---

## 2. Decision Drivers

- Exact Compliance with Vietnam Labor Code 2019 & PIT Law.
- Concurrency Protection: Preventing race conditions and double deductions for unpaid leave.
- Auditability & Immutability: Preventing silent modifications to closed payroll ledgers.
- Extensibility: Supporting custom company allowances and overtime bonuses.

---

## 3. Considered Options

- **Option 1: Dedicated Pure-Function Payroll Engine (`payroll_engine.py`) with Status Guards**
- **Option 2: Django ORM signals modifying payroll on attendance changes**
- **Option 3: External Payroll SaaS Integration**

---

## 4. Decision Outcome

**Chosen Option**: **Option 1 (Dedicated Pure-Function Payroll Engine with Status Guards)**.

### Rationale:
1. **Pure Function Determinism**: `calculate_employee_payroll()` operates as a deterministic pure function receiving employee contract, actual days worked, unpaid days, and dependent counts, returning a structured financial ledger.
2. **State Protection Guard**: `PayrollLedgerViewSet` and `PayrollService` enforce a strict guard: records with status `APPROVED` or `PAID` raise `PayrollLockedException` if recalculation is triggered.
3. **Double-Deduction Elimination**: Actual worked days (`actual_days`) explicitly encapsulate paid working days; unpaid leave days (`unpaid_leave_days`) are not subtracted twice.

---

## 5. Pros & Cons of the Options

### Option 1: Dedicated Pure Engine (Chosen)
- Good: 100% testable via unit tests with zero database mock overhead.
- Good: Strictly compliant with Vietnamese statutory formulas.
- Good: Immutable ledger records protect against accidental retroactive modifications.
- Bad: Requires explicit manual or batch recalculation trigger when attendance changes.

### Option 2: Signal-driven Auto-recalculation
- Good: Real-time updates.
- Bad: Fragile cascading effects; high risk of corrupting audited past month records.

### Option 3: External SaaS
- Good: Offloads regulatory liability.
- Bad: High recurring API costs, data privacy issues with candidate/employee records.
