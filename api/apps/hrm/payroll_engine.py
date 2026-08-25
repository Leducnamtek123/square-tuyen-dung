"""
Vietnam Payroll & Personal Income Tax (TNCN) Calculation Engine
Accurately computes Gross-to-Net salaries, statutory insurance deductions
(BHXH 8%, BHYT 1.5%, BHTN 1%), family circumstance deductions, and
progressive PIT (Thuế TNCN 7 bậc) according to Vietnamese Labor & Tax Laws.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any

# Statutory Insurance Rates (Người lao động đóng)
BHXH_RATE = Decimal("0.08")     # 8% Bảo hiểm xã hội
BHYT_RATE = Decimal("0.015")    # 1.5% Bảo hiểm y tế
BHTN_RATE = Decimal("0.01")     # 1% Bảo hiểm thất nghiệp
TOTAL_INSURANCE_RATE = BHXH_RATE + BHYT_RATE + BHTN_RATE  # 10.5%

# Deductions (Mức giảm trừ gia cảnh quy định hiện hành)
PERSONAL_DEDUCTION = Decimal("11000000")   # 11,000,000 VND / tháng cho bản thân
DEPENDENT_DEDUCTION = Decimal("4400000")   # 4,400,000 VND / tháng cho mỗi người phụ thuộc

# Trần đóng bảo hiểm (20 lần mức lương cơ sở / lương tối thiểu vùng)
MAX_SALARY_BHXH_BHYT = Decimal("36000000")  # 20 * 1,800,000 (hoặc lương cơ sở hiện hành)
MAX_SALARY_BHTN = Decimal("99200000")       # 20 * Lương tối thiểu vùng I


def calculate_pit_vietnam(taxable_income: Decimal) -> Decimal:
    """
    Tính Thuế Thu Nhập Cá Nhân (TNCN) theo biểu thuế lũy tiến từng phần 7 bậc (VN).
    """
    if taxable_income <= Decimal("0"):
        return Decimal("0")

    income = taxable_income
    tax = Decimal("0")

    # 7 Bậc thuế lũy tiến
    if income <= Decimal("5000000"):
        tax = income * Decimal("0.05")
    elif income <= Decimal("10000000"):
        tax = income * Decimal("0.10") - Decimal("250000")
    elif income <= Decimal("18000000"):
        tax = income * Decimal("0.15") - Decimal("750000")
    elif income <= Decimal("32000000"):
        tax = income * Decimal("0.20") - Decimal("1650000")
    elif income <= Decimal("52000000"):
        tax = income * Decimal("0.25") - Decimal("3250000")
    elif income <= Decimal("80000000"):
        tax = income * Decimal("0.30") - Decimal("5850000")
    else:
        tax = income * Decimal("0.35") - Decimal("9850000")

    return max(Decimal("0"), tax).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def calculate_vietnam_payroll(
    gross_salary: Decimal | int | float,
    allowance: Decimal | int | float = Decimal("0"),
    bonus: Decimal | int | float = Decimal("0"),
    dependents_count: int = 0,
    working_days_actual: int = 22,
    standard_working_days: int = 22,
    unpaid_leave_days: int = 0,
) -> Dict[str, Any]:
    """
    Tính toán chi tiết bảng lương Gross sang Net chuẩn Việt Nam.
    """
    gross = Decimal(str(gross_salary))
    allow = Decimal(str(allowance))
    bon = Decimal(str(bonus))

    # 1. Tính lương thực tế theo ngày công
    actual_days = max(0, min(standard_working_days, working_days_actual - unpaid_leave_days))
    prorated_salary = (gross / Decimal(standard_working_days) * Decimal(actual_days)).quantize(
        Decimal("1"), rounding=ROUND_HALF_UP
    ) if standard_working_days > 0 else gross

    total_income = prorated_salary + allow + bon

    # 2. Tính các khoản bảo hiểm bắt buộc
    salary_for_bhxh = min(prorated_salary, MAX_SALARY_BHXH_BHYT)
    salary_for_bhtn = min(prorated_salary, MAX_SALARY_BHTN)

    bhxh = (salary_for_bhxh * BHXH_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    bhyt = (salary_for_bhxh * BHYT_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    bhtn = (salary_for_bhtn * BHTN_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    total_insurance = bhxh + bhyt + bhtn

    # 3. Tính giảm trừ gia cảnh
    dep_count = max(0, int(dependents_count))
    total_family_deductions = PERSONAL_DEDUCTION + (Decimal(dep_count) * DEPENDENT_DEDUCTION)

    # 4. Thu nhập tính thuế (Taxable Income)
    # Phụ cấp ăn trưa / điện thoại thường được miễn trừ một phần, ở đây giả định tính thuế trên tổng trừ bảo hiểm & gia cảnh
    income_before_pit = max(Decimal("0"), total_income - total_insurance)
    taxable_income = max(Decimal("0"), income_before_pit - total_family_deductions)

    # 5. Thuế TNCN
    pit = calculate_pit_vietnam(taxable_income)

    # 6. Lương thực nhận (Net Salary)
    net_salary = total_income - total_insurance - pit

    return {
        "gross_salary": gross,
        "allowance": allow,
        "bonus": bon,
        "working_days_actual": actual_days,
        "standard_working_days": standard_working_days,
        "unpaid_leave_days": unpaid_leave_days,
        "total_income": total_income,
        "insurance_deductions": {
            "bhxh_8_percent": bhxh,
            "bhyt_1_5_percent": bhyt,
            "bhtn_1_percent": bhtn,
            "total_insurance": total_insurance,
        },
        "tax_deductions": {
            "personal_deduction": PERSONAL_DEDUCTION,
            "dependents_count": dep_count,
            "dependents_deduction": Decimal(dep_count) * DEPENDENT_DEDUCTION,
            "total_family_deductions": total_family_deductions,
            "taxable_income": taxable_income,
            "personal_income_tax": pit,
        },
        "net_salary": net_salary,
    }
