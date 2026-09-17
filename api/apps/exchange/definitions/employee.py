from typing import List, Optional, Tuple
from django.db import models
from apps.exchange.base import BaseExchangeDefinition, ErrorCodes, ExportField, ImportField, ValidationIssue
from apps.exchange.registry import exchange_registry
from apps.hrm.models import Department, Designation, Employee, WorkLocation
from shared.configs import variable_system as var_sys


@exchange_registry.register
class EmployeeExchangeDefinition(BaseExchangeDefinition):
    entity_type = "employee"
    label = "Danh sách nhân sự (HRM)"
    model = Employee
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    matching_keys = ["employeeCode"]
    default_matching_key = "employeeCode"
    supported_modes = ["create", "update", "upsert"]
    atomic_import = True

    export_fields = {
        "employeeCode": ExportField(key="employeeCode", label="Mã nhân viên", model_field="employee_code"),
        "fullName": ExportField(key="fullName", label="Họ và tên", model_field="full_name"),
        "email": ExportField(key="email", label="Email", model_field="email"),
        "phone": ExportField(key="phone", label="Số điện thoại", model_field="phone"),
        "gender": ExportField(
            key="gender",
            label="Giới tính",
            formatter=lambda obj, k: obj.get_gender_display() if hasattr(obj, "get_gender_display") else obj.gender,
        ),
        "dateOfBirth": ExportField(
            key="dateOfBirth",
            label="Ngày sinh",
            formatter=lambda obj, k: obj.date_of_birth.strftime("%d/%m/%Y") if obj.date_of_birth else "",
        ),
        "departmentCode": ExportField(
            key="departmentCode",
            label="Mã phòng ban",
            formatter=lambda obj, k: obj.department.code if obj.department else "",
        ),
        "departmentName": ExportField(
            key="departmentName",
            label="Phòng ban",
            formatter=lambda obj, k: obj.department.name if obj.department else "",
        ),
        "designationTitle": ExportField(
            key="designationTitle",
            label="Chức danh",
            formatter=lambda obj, k: obj.designation.title if obj.designation else "",
        ),
        "workLocationCode": ExportField(
            key="workLocationCode",
            label="Mã chi nhánh",
            formatter=lambda obj, k: obj.work_location.code if obj.work_location else "",
        ),
        "status": ExportField(
            key="status",
            label="Trạng thái",
            formatter=lambda obj, k: obj.get_status_display() if hasattr(obj, "get_status_display") else obj.status,
        ),
        "employmentType": ExportField(
            key="employmentType",
            label="Loại hợp đồng",
            formatter=lambda obj, k: obj.get_employment_type_display() if hasattr(obj, "get_employment_type_display") else obj.employment_type,
        ),
        "joinDate": ExportField(
            key="joinDate",
            label="Ngày vào làm",
            formatter=lambda obj, k: obj.join_date.strftime("%d/%m/%Y") if obj.join_date else "",
        ),
        "bankName": ExportField(key="bankName", label="Ngân hàng", model_field="bank_name"),
        "bankAccountNumber": ExportField(key="bankAccountNumber", label="Số tài khoản", model_field="bank_account_number"),
        "taxId": ExportField(key="taxId", label="Mã số thuế", model_field="tax_id"),
        "socialInsuranceId": ExportField(key="socialInsuranceId", label="Mã số BHXH", model_field="social_insurance_id"),
        "dependentsCount": ExportField(key="dependentsCount", label="Số người phụ thuộc", model_field="dependents_count"),
    }

    import_fields = {
        "employeeCode": ImportField(
            key="employeeCode",
            label="Mã nhân viên",
            aliases=["Mã NV", "employee_code", "Mã"],
            model_field="employee_code",
            field_type="string",
            required=True,
            example="EMP001",
            description="Mã định danh duy nhất của nhân viên trong doanh nghiệp",
        ),
        "firstName": ImportField(
            key="firstName",
            label="Tên",
            aliases=["first_name"],
            model_field="first_name",
            field_type="string",
            required=True,
            example="An",
            description="Tên của nhân viên",
        ),
        "lastName": ImportField(
            key="lastName",
            label="Họ đệm",
            aliases=["Họ và tên đệm", "last_name"],
            model_field="last_name",
            field_type="string",
            required=True,
            example="Nguyễn Văn",
            description="Họ và tên đệm của nhân viên",
        ),
        "email": ImportField(
            key="email",
            label="Email công việc",
            aliases=["Email", "email_address"],
            model_field="email",
            field_type="email",
            required=True,
            example="an.nguyen@company.com",
            description="Địa chỉ email công việc",
        ),
        "phone": ImportField(
            key="phone",
            label="Số điện thoại",
            aliases=["SĐT", "Điện thoại"],
            model_field="phone",
            field_type="phone",
            required=False,
            example="0901234567",
            description="Số điện thoại liên hệ",
        ),
        "gender": ImportField(
            key="gender",
            label="Giới tính",
            aliases=["gender"],
            model_field="gender",
            field_type="enum",
            choices=[("MALE", "Nam"), ("FEMALE", "Nữ"), ("OTHER", "Khác")],
            example="Nam",
            description="Giới tính",
        ),
        "dateOfBirth": ImportField(
            key="dateOfBirth",
            label="Ngày sinh",
            aliases=["birthday", "date_of_birth"],
            model_field="date_of_birth",
            field_type="date",
            required=False,
            example="1995-08-20",
            description="Ngày sinh (YYYY-MM-DD)",
        ),
        "departmentCode": ImportField(
            key="departmentCode",
            label="Mã phòng ban",
            aliases=["Phòng ban", "department"],
            field_type="string",
            required=False,
            example="TECH",
            description="Mã phòng ban mà nhân viên trực thuộc",
        ),
        "designationTitle": ImportField(
            key="designationTitle",
            label="Chức danh",
            aliases=["Chức vụ", "Vị trí", "designation"],
            field_type="string",
            required=False,
            example="Trưởng phòng Kỹ thuật",
            description="Tên chức danh công việc",
        ),
        "workLocationCode": ImportField(
            key="workLocationCode",
            label="Mã chi nhánh",
            aliases=["Địa điểm làm việc", "Chi nhánh", "location"],
            field_type="string",
            required=False,
            example="HQ",
            description="Mã trụ sở hoặc chi nhánh làm việc",
        ),
        "status": ImportField(
            key="status",
            label="Trạng thái làm việc",
            aliases=["Trạng thái", "status"],
            model_field="status",
            field_type="enum",
            choices=[
                ("PROBATION", "Thử việc"),
                ("ACTIVE", "Chính thức"),
                ("RESIGNED", "Đã nghỉ việc"),
                ("TERMINATED", "Sa thải"),
            ],
            example="Chính thức",
            description="Trạng thái làm việc của nhân sự",
        ),
        "employmentType": ImportField(
            key="employmentType",
            label="Loại hợp đồng",
            aliases=["Hình thức làm việc", "employment_type"],
            model_field="employment_type",
            field_type="enum",
            choices=[
                ("FULL_TIME", "Toàn thời gian"),
                ("PART_TIME", "Bán thời gian"),
                ("CONTRACT", "Hợp đồng"),
                ("INTERN", "Thực tập sinh"),
            ],
            example="Toàn thời gian",
            description="Hình thức ký kết lao động",
        ),
        "joinDate": ImportField(
            key="joinDate",
            label="Ngày vào làm",
            aliases=["join_date", "Ngày bắt đầu"],
            model_field="join_date",
            field_type="date",
            required=False,
            example="2024-01-15",
            description="Ngày bắt đầu làm việc chính thức tại công ty",
        ),
        "bankName": ImportField(
            key="bankName",
            label="Tên ngân hàng",
            aliases=["Ngân hàng"],
            model_field="bank_name",
            field_type="string",
            required=False,
            example="Vietcombank",
        ),
        "bankAccountNumber": ImportField(
            key="bankAccountNumber",
            label="Số tài khoản",
            aliases=["STK"],
            model_field="bank_account_number",
            field_type="string",
            required=False,
            example="1012345678",
        ),
        "taxId": ImportField(
            key="taxId",
            label="Mã số thuế",
            aliases=["MST"],
            model_field="tax_id",
            field_type="string",
            required=False,
            example="8329482910",
        ),
        "dependentsCount": ImportField(
            key="dependentsCount",
            label="Số người phụ thuộc",
            aliases=["Người phụ thuộc"],
            model_field="dependents_count",
            field_type="number",
            required=False,
            example="1",
        ),
    }

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = Employee.objects.filter(company=company).select_related(
            "department", "designation", "work_location"
        )
        filters = filters or {}
        if filters.get("search"):
            search_term = str(filters["search"]).strip()
            qs = qs.filter(
                models.Q(full_name__icontains=search_term)
                | models.Q(employee_code__icontains=search_term)
                | models.Q(email__icontains=search_term)
            )
        if filters.get("department"):
            qs = qs.filter(department_id=filters["department"])
        if filters.get("status"):
            qs = qs.filter(status=filters["status"])
        return qs.order_by("-create_at")

    def resolve_relationships(self, row_dict: dict, company) -> Tuple[dict, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []

        # Resolve Department
        dept_code = row_dict.get("departmentCode")
        if dept_code:
            dept = Department.objects.filter(
                company=company, code__iexact=str(dept_code).strip()
            ).first()
            if dept:
                row_dict["_resolved_department"] = dept
            else:
                issues.append(
                    ValidationIssue(
                        field="Mã phòng ban",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Phòng ban với mã '{dept_code}' không tồn tại trong doanh nghiệp.",
                        value=dept_code,
                    )
                )

        # Resolve Designation
        desig_title = row_dict.get("designationTitle")
        if desig_title:
            desig = Designation.objects.filter(
                company=company, title__iexact=str(desig_title).strip()
            ).first()
            if desig:
                row_dict["_resolved_designation"] = desig
            else:
                issues.append(
                    ValidationIssue(
                        field="Chức danh",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Chức danh '{desig_title}' không tồn tại trong doanh nghiệp.",
                        value=desig_title,
                    )
                )

        # Resolve WorkLocation
        loc_code = row_dict.get("workLocationCode")
        if loc_code:
            loc = WorkLocation.objects.filter(
                company=company, code__iexact=str(loc_code).strip()
            ).first()
            if loc:
                row_dict["_resolved_work_location"] = loc
            else:
                issues.append(
                    ValidationIssue(
                        field="Mã chi nhánh",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Chi nhánh với mã '{loc_code}' không tồn tại trong doanh nghiệp.",
                        value=loc_code,
                    )
                )

        return row_dict, issues

    def create_record(self, validated_data: dict, company, user) -> Employee:
        first_name = validated_data.get("firstName", "")
        last_name = validated_data.get("lastName", "")
        full_name = f"{last_name} {first_name}".strip()

        data = {
            "company": company,
            "employee_code": validated_data.get("employeeCode"),
            "first_name": first_name,
            "last_name": last_name,
            "full_name": full_name,
            "email": validated_data.get("email"),
            "phone": validated_data.get("phone"),
            "gender": validated_data.get("gender") or "OTHER",
            "date_of_birth": validated_data.get("dateOfBirth"),
            "department": validated_data.get("_resolved_department"),
            "designation": validated_data.get("_resolved_designation"),
            "work_location": validated_data.get("_resolved_work_location"),
            "status": validated_data.get("status") or "PROBATION",
            "employment_type": validated_data.get("employmentType") or "FULL_TIME",
            "join_date": validated_data.get("joinDate"),
            "bank_name": validated_data.get("bankName"),
            "bank_account_number": validated_data.get("bankAccountNumber"),
            "tax_id": validated_data.get("taxId"),
            "dependents_count": validated_data.get("dependentsCount") or 0,
        }
        return Employee.objects.create(**data)

    def update_record(self, instance: Employee, validated_data: dict, company, user) -> Employee:
        if "firstName" in validated_data:
            instance.first_name = validated_data["firstName"]
        if "lastName" in validated_data:
            instance.last_name = validated_data["lastName"]
        instance.full_name = f"{instance.last_name} {instance.first_name}".strip()

        if "email" in validated_data and validated_data["email"]:
            instance.email = validated_data["email"]
        if "phone" in validated_data:
            instance.phone = validated_data["phone"]
        if "gender" in validated_data and validated_data["gender"]:
            instance.gender = validated_data["gender"]
        if "dateOfBirth" in validated_data:
            instance.date_of_birth = validated_data["dateOfBirth"]
        if "status" in validated_data and validated_data["status"]:
            instance.status = validated_data["status"]
        if "employmentType" in validated_data and validated_data["employmentType"]:
            instance.employment_type = validated_data["employmentType"]
        if "joinDate" in validated_data:
            instance.join_date = validated_data["joinDate"]
        if "bankName" in validated_data:
            instance.bank_name = validated_data["bankName"]
        if "bankAccountNumber" in validated_data:
            instance.bank_account_number = validated_data["bankAccountNumber"]
        if "taxId" in validated_data:
            instance.tax_id = validated_data["taxId"]
        if "dependentsCount" in validated_data and validated_data["dependentsCount"] is not None:
            instance.dependents_count = validated_data["dependentsCount"]

        if "_resolved_department" in validated_data:
            instance.department = validated_data["_resolved_department"]
        if "_resolved_designation" in validated_data:
            instance.designation = validated_data["_resolved_designation"]
        if "_resolved_work_location" in validated_data:
            instance.work_location = validated_data["_resolved_work_location"]

        instance.save()
        return instance
