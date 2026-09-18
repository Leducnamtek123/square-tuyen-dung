from typing import Optional
from apps.exchange.base import BaseExchangeDefinition, ExportField
from apps.exchange.registry import exchange_registry
from apps.hrm.models import MonthlyPayrollRecord
from shared.configs import variable_system as var_sys


@exchange_registry.register
class PayrollExchangeDefinition(BaseExchangeDefinition):
    entity_type = "payroll"
    label = "Bảng lương hàng tháng (HRM)"
    model = MonthlyPayrollRecord
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    supports_export = True
    supports_import = False

    export_fields = {
        "employeeCode": ExportField(
            key="employeeCode",
            label="Mã nhân viên",
            formatter=lambda obj, k: obj.employee.employee_code if obj.employee else "",
        ),
        "fullName": ExportField(
            key="fullName",
            label="Họ và tên",
            formatter=lambda obj, k: obj.employee.full_name if obj.employee else "",
        ),
        "department": ExportField(
            key="department",
            label="Phòng ban",
            formatter=lambda obj, k: obj.employee.department.name if obj.employee and obj.employee.department else "",
        ),
        "month": ExportField(key="month", label="Tháng", model_field="month"),
        "year": ExportField(key="year", label="Năm", model_field="year"),
        "grossSalary": ExportField(
            key="grossSalary",
            label="Lương Gross (VND)",
            formatter=lambda obj, k: f"{obj.gross_salary:,.0f}" if obj.gross_salary is not None else "0",
        ),
        "allowance": ExportField(
            key="allowance",
            label="Phụ cấp (VND)",
            formatter=lambda obj, k: f"{obj.allowance:,.0f}" if obj.allowance is not None else "0",
        ),
        "bonus": ExportField(
            key="bonus",
            label="Thưởng (VND)",
            formatter=lambda obj, k: f"{obj.bonus:,.0f}" if obj.bonus is not None else "0",
        ),
        "workingDaysActual": ExportField(key="workingDaysActual", label="Công thực tế", model_field="working_days_actual"),
        "standardWorkingDays": ExportField(key="standardWorkingDays", label="Công chuẩn", model_field="standard_working_days"),
        "totalIncome": ExportField(
            key="totalIncome",
            label="Tổng thu nhập (VND)",
            formatter=lambda obj, k: f"{obj.total_income:,.0f}" if obj.total_income is not None else "0",
        ),
        "totalInsurance": ExportField(
            key="totalInsurance",
            label="BH người LĐ (VND)",
            formatter=lambda obj, k: f"{obj.total_insurance:,.0f}" if obj.total_insurance is not None else "0",
        ),
        "taxableIncome": ExportField(
            key="taxableIncome",
            label="Thu nhập tính thuế (VND)",
            formatter=lambda obj, k: f"{obj.taxable_income:,.0f}" if obj.taxable_income is not None else "0",
        ),
        "personalIncomeTax": ExportField(
            key="personalIncomeTax",
            label="Thuế TNCN (VND)",
            formatter=lambda obj, k: f"{obj.personal_income_tax:,.0f}" if obj.personal_income_tax is not None else "0",
        ),
        "netSalary": ExportField(
            key="netSalary",
            label="Lương thực nhận Net (VND)",
            formatter=lambda obj, k: f"{obj.net_salary:,.0f}" if obj.net_salary is not None else "0",
        ),
        "totalCompanyExpense": ExportField(
            key="totalCompanyExpense",
            label="Tổng chi phí DN (VND)",
            formatter=lambda obj, k: f"{obj.total_company_expense:,.0f}" if obj.total_company_expense is not None else "0",
        ),
        "status": ExportField(
            key="status",
            label="Trạng thái",
            formatter=lambda obj, k: obj.get_status_display() if hasattr(obj, "get_status_display") else obj.status,
        ),
        "paymentDate": ExportField(
            key="paymentDate",
            label="Ngày chi trả",
            formatter=lambda obj, k: obj.payment_date.strftime("%d/%m/%Y") if obj.payment_date else "",
        ),
    }

    import_fields = {}

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = MonthlyPayrollRecord.objects.filter(company=company).select_related("employee__department")
        filters = filters or {}
        if filters.get("month"):
            qs = qs.filter(month=filters["month"])
        if filters.get("year"):
            qs = qs.filter(year=filters["year"])
        if filters.get("status"):
            qs = qs.filter(status=filters["status"])
        return qs.order_by("-year", "-month", "employee__employee_code")
