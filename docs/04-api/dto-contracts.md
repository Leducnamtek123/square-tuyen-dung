# Hop Dong DTO & Dong Bo Du Lieu (DTO Contracts & Synchronization)

> **Phan he**: 04-api  
> **Tai lieu**: dto-contracts.md  
> **Nguyen tac**: Type-safe Cross-Service Contract Synchronization

---

## 1. Nguyen Tac Dong Bo Bat Buoc (Strict Synchronization Rule)

Theo quy dinh tai `AGENTS.md`:
> **Quy tac**: Bat cu khi nao Serializer phia Backend DRF (`api/apps/*/serializers.py`) co su thay doi ve truong du lieu (Them truong, xoa truong, doi ten, doi kieu enum), lap trinh vien hoac AI agent **BAT BUOC PHAI DONG BO** kieu du lieu TypeScript tuong ung tai `frontend/src/types/`.

---

## 2. Vi Du Hop Dong DTO Dong Bo Dien Hinh

### 2.1. Thuc The Employee (Native HRM)

**Backend DRF Serializer (`api/apps/hrm/serializers.py`)**:
```python
class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    dependents_count = serializers.IntegerField(default=0)
    status = serializers.ChoiceField(choices=Employee.Status.choices)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_code', 'first_name', 'last_name', 'full_name',
            'department', 'job_title', 'hire_date', 'dependents_count', 'status'
        ]
```

**Frontend TypeScript Interface (`frontend/src/types/hrm.ts`)**:
```typescript
export type EmployeeStatus = 'PROBATION' | 'ACTIVE' | 'RESIGNED';

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  department: number | null;
  job_title: string;
  hire_date: string;
  dependents_count: number;
  status: EmployeeStatus;
}
```

---

### 2.2. Thuc The Bang Luong (Payroll Ledger)

**Backend DRF Serializer (`api/apps/hrm/serializers.py`)**:
```python
class PayrollLedgerSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    net_salary = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = PayrollLedger
        fields = [
            'id', 'employee', 'employee_name', 'month', 'year',
            'base_salary', 'actual_days', 'unpaid_leave_days',
            'gross_income', 'insurance_deduction', 'pit_tax',
            'net_salary', 'status'
        ]
```

**Frontend TypeScript Interface (`frontend/src/types/hrm.ts`)**:
```typescript
export type PayrollStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID';

export interface PayrollRecord {
  id: number;
  employee: number;
  employee_name: string;
  month: number;
  year: number;
  base_salary: number;
  actual_days: number;
  unpaid_leave_days: number;
  gross_income: number;
  insurance_deduction: number;
  pit_tax: number;
  net_salary: number;
  status: PayrollStatus;
}
```

---

## 3. Quy Trinh Kiem Tra Dong Bo Truoc Khi Merge

1. Thay doi serializer o backend.
2. Cap nhat file interface trong `frontend/src/types/`.
3. Chay `pnpm run typecheck` o frontend de phat hien ngay cac vi tri su dung bi anh huong.
4. Chay `python manage.py spectacular` hoac kiem tra Swagger UI de dam bao schema OpenAPI phan anh dung hop dong moi.
