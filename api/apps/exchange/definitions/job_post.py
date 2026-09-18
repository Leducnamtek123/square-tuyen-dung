from typing import List, Optional, Tuple
from django.db import models
from apps.common.models import Career
from apps.exchange.base import BaseExchangeDefinition, ErrorCodes, ExportField, ImportField, ValidationIssue
from apps.exchange.registry import exchange_registry
from apps.jobs.models import JobPost
from apps.locations.models import City, Location
from shared.configs import variable_system as var_sys


@exchange_registry.register
class JobPostExchangeDefinition(BaseExchangeDefinition):
    entity_type = "job_post"
    label = "Tin tuyển dụng"
    model = JobPost
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    matching_keys = ["jobName"]
    default_matching_key = "jobName"
    supported_modes = ["create", "update", "upsert"]
    atomic_import = True

    export_fields = {
        "jobName": ExportField(key="jobName", label="Chức danh tuyển dụng", model_field="job_name"),
        "careerName": ExportField(
            key="careerName",
            label="Ngành nghề",
            formatter=lambda obj, k: obj.career.name if obj.career else "",
        ),
        "cityName": ExportField(
            key="cityName",
            label="Địa điểm",
            formatter=lambda obj, k: obj.location.city.name if obj.location and obj.location.city else "",
        ),
        "position": ExportField(
            key="position",
            label="Cấp bậc",
            formatter=lambda obj, k: obj.get_position_display() if hasattr(obj, "get_position_display") and obj.position else "",
        ),
        "experience": ExportField(
            key="experience",
            label="Kinh nghiệm",
            formatter=lambda obj, k: obj.get_experience_display() if hasattr(obj, "get_experience_display") and obj.experience else "",
        ),
        "academicLevel": ExportField(
            key="academicLevel",
            label="Học vấn",
            formatter=lambda obj, k: obj.get_academic_level_display() if hasattr(obj, "get_academic_level_display") and obj.academic_level else "",
        ),
        "salaryMin": ExportField(key="salaryMin", label="Lương tối thiểu", model_field="salary_min"),
        "salaryMax": ExportField(key="salaryMax", label="Lương tối đa", model_field="salary_max"),
        "deadline": ExportField(
            key="deadline",
            label="Hạn nộp hồ sơ",
            formatter=lambda obj, k: obj.deadline.strftime("%d/%m/%Y") if obj.deadline else "",
        ),
        "quantity": ExportField(key="quantity", label="Số lượng tuyển", model_field="quantity"),
        "status": ExportField(
            key="status",
            label="Trạng thái tin",
            formatter=lambda obj, k: obj.get_status_display() if hasattr(obj, "get_status_display") else obj.status,
        ),
        "views": ExportField(key="views", label="Lượt xem", model_field="views"),
        "appliedNumber": ExportField(
            key="appliedNumber",
            label="Số hồ sơ ứng tuyển",
            formatter=lambda obj, k: obj.peoples_applied.count() if hasattr(obj, "peoples_applied") else 0,
        ),
        "createAt": ExportField(
            key="createAt",
            label="Ngày đăng",
            formatter=lambda obj, k: obj.create_at.strftime("%d/%m/%Y") if obj.create_at else "",
        ),
    }

    import_fields = {
        "jobName": ImportField(
            key="jobName",
            label="Chức danh tuyển dụng",
            aliases=["Tên công việc", "Tiêu đề tin", "job_name"],
            model_field="job_name",
            field_type="string",
            required=True,
            example="Kỹ sư Giám sát Thi công",
            description="Tên chức danh công việc cần tuyển",
        ),
        "careerName": ImportField(
            key="careerName",
            label="Ngành nghề",
            aliases=["Ngành", "career"],
            field_type="string",
            required=True,
            example="Xây dựng",
            description="Tên ngành nghề tuyển dụng",
        ),
        "cityName": ImportField(
            key="cityName",
            label="Tỉnh / Thành phố",
            aliases=["Thành phố", "city"],
            field_type="string",
            required=True,
            example="Hà Nội",
            description="Tỉnh/Thành phố làm việc",
        ),
        "deadline": ImportField(
            key="deadline",
            label="Hạn nộp hồ sơ",
            aliases=["Hạn tuyển", "deadline"],
            model_field="deadline",
            field_type="date",
            required=True,
            example="2026-12-31",
            description="Ngày hết hạn nhận hồ sơ (YYYY-MM-DD)",
        ),
        "quantity": ImportField(
            key="quantity",
            label="Số lượng tuyển",
            aliases=["Số lượng", "quantity"],
            model_field="quantity",
            field_type="number",
            required=True,
            example="3",
            description="Số lượng nhân sự cần tuyển",
        ),
        "position": ImportField(
            key="position",
            label="Cấp bậc",
            aliases=["Vị trí", "position"],
            model_field="position",
            field_type="enum",
            choices=var_sys.POSITION_CHOICES,
            required=True,
            example="Nhân viên",
        ),
        "typeOfWorkplace": ImportField(
            key="typeOfWorkplace",
            label="Hình thức làm việc",
            aliases=["Nơi làm việc", "type_of_workplace"],
            model_field="type_of_workplace",
            field_type="enum",
            choices=var_sys.TYPE_OF_WORKPLACE_CHOICES,
            required=True,
            example="Tại văn phòng",
        ),
        "experience": ImportField(
            key="experience",
            label="Kinh nghiệm",
            aliases=["Kinh nghiệm yêu cầu"],
            model_field="experience",
            field_type="enum",
            choices=var_sys.EXPERIENCE_CHOICES,
            required=True,
            example="1 - 2 năm",
        ),
        "academicLevel": ImportField(
            key="academicLevel",
            label="Trình độ học vấn",
            aliases=["Bằng cấp", "academic_level"],
            model_field="academic_level",
            field_type="enum",
            choices=var_sys.ACADEMIC_LEVEL,
            required=True,
            example="Đại học",
        ),
        "jobType": ImportField(
            key="jobType",
            label="Loại công việc",
            aliases=["Hình thức hợp đồng", "job_type"],
            model_field="job_type",
            field_type="enum",
            choices=var_sys.JOB_TYPE_CHOICES,
            required=True,
            example="Toàn thời gian",
        ),
        "salaryMin": ImportField(
            key="salaryMin",
            label="Lương tối thiểu",
            aliases=["Lương từ", "salary_min"],
            model_field="salary_min",
            field_type="number",
            required=True,
            example="12000000",
        ),
        "salaryMax": ImportField(
            key="salaryMax",
            label="Lương tối đa",
            aliases=["Lương đến", "salary_max"],
            model_field="salary_max",
            field_type="number",
            required=True,
            example="18000000",
        ),
        "contactPersonName": ImportField(
            key="contactPersonName",
            label="Tên người liên hệ",
            aliases=["Người liên hệ"],
            model_field="contact_person_name",
            field_type="string",
            required=True,
            example="Trần Thị Lan",
        ),
        "contactPersonPhone": ImportField(
            key="contactPersonPhone",
            label="SĐT người liên hệ",
            aliases=["SĐT liên hệ"],
            model_field="contact_person_phone",
            field_type="phone",
            required=True,
            example="0987654321",
        ),
        "contactPersonEmail": ImportField(
            key="contactPersonEmail",
            label="Email người liên hệ",
            aliases=["Email liên hệ"],
            model_field="contact_person_email",
            field_type="email",
            required=True,
            example="lan.tran@company.com",
        ),
        "jobDescription": ImportField(
            key="jobDescription",
            label="Mô tả công việc",
            aliases=["Mô tả", "job_description"],
            model_field="job_description",
            field_type="string",
            required=True,
            example="Giám sát hiện trường thi công, quản lý tiến độ và chất lượng...",
        ),
        "jobRequirement": ImportField(
            key="jobRequirement",
            label="Yêu cầu công việc",
            aliases=["Yêu cầu", "job_requirement"],
            model_field="job_requirement",
            field_type="string",
            required=False,
            example="Tốt nghiệp ĐH chuyên ngành Xây dựng Dân dụng & Công nghiệp...",
        ),
        "benefitsEnjoyed": ImportField(
            key="benefitsEnjoyed",
            label="Quyền lợi",
            aliases=["Chế độ đãi ngộ", "benefits"],
            model_field="benefits_enjoyed",
            field_type="string",
            required=False,
            example="Lương thưởng tháng 13, BHXH đầy đủ, phụ cấp công trình...",
        ),
    }

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = JobPost.objects.filter(company=company).select_related("career", "location__city")
        filters = filters or {}
        if filters.get("search"):
            search_term = str(filters["search"]).strip()
            qs = qs.filter(job_name__icontains=search_term)
        if filters.get("status"):
            qs = qs.filter(status=filters["status"])
        return qs.order_by("-update_at", "-create_at")

    def resolve_relationships(self, row_dict: dict, company) -> Tuple[dict, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []

        career_name = row_dict.get("careerName")
        if career_name:
            c = Career.objects.filter(name__iexact=str(career_name).strip()).first()
            if c:
                row_dict["_resolved_career"] = c
            else:
                issues.append(
                    ValidationIssue(
                        field="Ngành nghề",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Ngành nghề '{career_name}' không tồn tại trong hệ thống.",
                        value=career_name,
                    )
                )

        city_name = row_dict.get("cityName")
        if city_name:
            city_obj = City.objects.filter(name__iexact=str(city_name).strip()).first()
            if city_obj:
                # Find or create general Location entry for this city
                loc, _ = Location.objects.get_or_create(city=city_obj, district=None, address="")
                row_dict["_resolved_location"] = loc
            else:
                issues.append(
                    ValidationIssue(
                        field="Tỉnh / Thành phố",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Tỉnh/Thành phố '{city_name}' không tồn tại trong hệ thống.",
                        value=city_name,
                    )
                )

        return row_dict, issues

    def create_record(self, validated_data: dict, company, user) -> JobPost:
        data = {
            "company": company,
            "user": user,
            "job_name": validated_data.get("jobName"),
            "career": validated_data.get("_resolved_career"),
            "location": validated_data.get("_resolved_location"),
            "deadline": validated_data.get("deadline"),
            "quantity": validated_data.get("quantity") or 1,
            "position": validated_data.get("position"),
            "type_of_workplace": validated_data.get("typeOfWorkplace"),
            "experience": validated_data.get("experience"),
            "academic_level": validated_data.get("academicLevel"),
            "job_type": validated_data.get("jobType"),
            "salary_min": validated_data.get("salaryMin") or 0,
            "salary_max": validated_data.get("salaryMax") or 0,
            "contact_person_name": validated_data.get("contactPersonName"),
            "contact_person_phone": validated_data.get("contactPersonPhone"),
            "contact_person_email": validated_data.get("contactPersonEmail"),
            "job_description": validated_data.get("jobDescription"),
            "job_requirement": validated_data.get("jobRequirement") or "",
            "benefits_enjoyed": validated_data.get("benefitsEnjoyed") or "",
            "status": var_sys.JobPostStatus.APPROVED if getattr(user, "is_staff", False) else var_sys.JobPostStatus.PENDING,
        }
        return JobPost.objects.create(**data)

    def update_record(self, instance: JobPost, validated_data: dict, company, user) -> JobPost:
        for k in ["jobName", "job_name"]:
            if k in validated_data and validated_data[k]:
                instance.job_name = validated_data[k]
        if "deadline" in validated_data and validated_data["deadline"]:
            instance.deadline = validated_data["deadline"]
        if "quantity" in validated_data and validated_data["quantity"]:
            instance.quantity = validated_data["quantity"]
        if "position" in validated_data:
            instance.position = validated_data["position"]
        if "typeOfWorkplace" in validated_data:
            instance.type_of_workplace = validated_data["typeOfWorkplace"]
        if "experience" in validated_data:
            instance.experience = validated_data["experience"]
        if "academicLevel" in validated_data:
            instance.academic_level = validated_data["academicLevel"]
        if "jobType" in validated_data:
            instance.job_type = validated_data["jobType"]
        if "salaryMin" in validated_data:
            instance.salary_min = validated_data["salaryMin"]
        if "salaryMax" in validated_data:
            instance.salary_max = validated_data["salaryMax"]
        if "contactPersonName" in validated_data:
            instance.contact_person_name = validated_data["contactPersonName"]
        if "contactPersonPhone" in validated_data:
            instance.contact_person_phone = validated_data["contactPersonPhone"]
        if "contactPersonEmail" in validated_data:
            instance.contact_person_email = validated_data["contactPersonEmail"]
        if "jobDescription" in validated_data:
            instance.job_description = validated_data["jobDescription"]
        if "jobRequirement" in validated_data:
            instance.job_requirement = validated_data["jobRequirement"]
        if "benefitsEnjoyed" in validated_data:
            instance.benefits_enjoyed = validated_data["benefitsEnjoyed"]
        if "_resolved_career" in validated_data:
            instance.career = validated_data["_resolved_career"]
        if "_resolved_location" in validated_data:
            instance.location = validated_data["_resolved_location"]

        instance.save()
        return instance
