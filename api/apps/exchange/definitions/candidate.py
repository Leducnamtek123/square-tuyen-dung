from typing import List, Optional, Tuple
from django.db import models
from apps.common.models import Career
from apps.exchange.base import BaseExchangeDefinition, ErrorCodes, ExportField, ImportField, ValidationIssue
from apps.exchange.registry import exchange_registry
from apps.locations.models import City
from apps.profiles.models import EmployerCandidateProfile
from shared.configs import variable_system as var_sys


@exchange_registry.register
class CandidateExchangeDefinition(BaseExchangeDefinition):
    entity_type = "candidate"
    label = "Hồ sơ ứng viên doanh nghiệp"
    model = EmployerCandidateProfile
    permission_roles = [var_sys.ADMIN, var_sys.EMPLOYER]
    matching_keys = ["email", "phone"]
    default_matching_key = "email"
    supported_modes = ["create", "update", "upsert"]
    atomic_import = True

    export_fields = {
        "fullName": ExportField(key="fullName", label="Họ và tên", model_field="full_name"),
        "email": ExportField(key="email", label="Email", model_field="email"),
        "phone": ExportField(key="phone", label="Số điện thoại", model_field="phone"),
        "title": ExportField(key="title", label="Chức danh hồ sơ", model_field="title"),
        "cityName": ExportField(
            key="cityName",
            label="Tỉnh / Thành phố",
            formatter=lambda obj, k: getattr(obj.city, "name", "") if getattr(obj, "city", None) else "",
        ),
        "careerName": ExportField(
            key="careerName",
            label="Ngành nghề",
            formatter=lambda obj, k: getattr(obj.career, "name", "") if getattr(obj, "career", None) else "",
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
            label="Trình độ học vấn",
            formatter=lambda obj, k: obj.get_academic_level_display() if hasattr(obj, "get_academic_level_display") and obj.academic_level else "",
        ),
        "expectedSalary": ExportField(key="expectedSalary", label="Mức lương mong muốn", model_field="expected_salary"),
        "skillsSummary": ExportField(key="skillsSummary", label="Kỹ năng", model_field="skills_summary"),
        "note": ExportField(key="note", label="Ghi chú", model_field="note"),
        "createAt": ExportField(
            key="createAt",
            label="Ngày tạo",
            formatter=lambda obj, k: obj.create_at.strftime("%d/%m/%Y %H:%M") if getattr(obj, "create_at", None) else "",
        ),
    }

    import_fields = {
        "fullName": ImportField(
            key="fullName",
            label="Họ và tên",
            aliases=["Họ tên", "full_name", "candidate_name"],
            model_field="full_name",
            field_type="string",
            required=True,
            example="Nguyễn Văn An",
            description="Họ và tên đầy đủ của ứng viên",
        ),
        "email": ImportField(
            key="email",
            label="Email",
            aliases=["Địa chỉ email", "mail"],
            model_field="email",
            field_type="email",
            required=True,
            example="nguyenvanan@example.com",
            description="Email liên hệ của ứng viên (dùng làm khóa chính)",
        ),
        "phone": ImportField(
            key="phone",
            label="Số điện thoại",
            aliases=["SĐT", "Điện thoại", "phone_number"],
            model_field="phone",
            field_type="phone",
            required=False,
            example="0912345678",
            description="Số điện thoại di động",
        ),
        "title": ImportField(
            key="title",
            label="Chức danh hồ sơ",
            aliases=["Vị trí ứng tuyển", "Tiêu đề hồ sơ", "job_title"],
            model_field="title",
            field_type="string",
            required=True,
            example="Kỹ sư Kết cấu Xây dựng",
            description="Chức danh chuyên môn của ứng viên",
        ),
        "cityName": ImportField(
            key="cityName",
            label="Tỉnh / Thành phố",
            aliases=["Địa điểm", "Thành phố", "city"],
            field_type="string",
            required=False,
            example="Hồ Chí Minh",
            description="Tên Tỉnh / Thành phố làm việc",
        ),
        "careerName": ImportField(
            key="careerName",
            label="Ngành nghề",
            aliases=["Ngành", "career"],
            field_type="string",
            required=False,
            example="Xây dựng",
            description="Tên ngành nghề chuyên môn",
        ),
        "position": ImportField(
            key="position",
            label="Cấp bậc",
            aliases=["Vị trí", "Cấp bậc làm việc"],
            model_field="position",
            field_type="enum",
            choices=var_sys.POSITION_CHOICES,
            example="Nhân viên",
            description="Cấp bậc vị trí công việc",
        ),
        "experience": ImportField(
            key="experience",
            label="Kinh nghiệm",
            aliases=["Số năm kinh nghiệm"],
            model_field="experience",
            field_type="enum",
            choices=var_sys.EXPERIENCE_CHOICES,
            example="1 - 2 năm",
            description="Mức kinh nghiệm làm việc",
        ),
        "academicLevel": ImportField(
            key="academicLevel",
            label="Trình độ học vấn",
            aliases=["Bằng cấp", "Học vấn"],
            model_field="academic_level",
            field_type="enum",
            choices=var_sys.ACADEMIC_LEVEL,
            example="Đại học",
            description="Trình độ văn hóa cao nhất",
        ),
        "expectedSalary": ImportField(
            key="expectedSalary",
            label="Mức lương mong muốn",
            aliases=["Lương mong muốn", "Lương"],
            model_field="expected_salary",
            field_type="number",
            required=False,
            example="15000000",
            description="Mức lương kỳ vọng (VND)",
        ),
        "skillsSummary": ImportField(
            key="skillsSummary",
            label="Kỹ năng",
            aliases=["Kỹ năng chuyên môn", "skills"],
            model_field="skills_summary",
            field_type="string",
            required=False,
            example="AutoCAD, Revit, Revit Structure",
            description="Tóm tắt kỹ năng chuyên môn",
        ),
        "note": ImportField(
            key="note",
            label="Ghi chú",
            aliases=["Đánh giá", "note"],
            model_field="note",
            field_type="string",
            required=False,
            example="Ứng viên tiềm năng cho dự án Q2",
            description="Ghi chú nội bộ của nhà tuyển dụng",
        ),
    }

    def get_queryset(self, user, company, filters: Optional[dict] = None):
        qs = EmployerCandidateProfile.objects.filter(company=company).select_related("city", "career")
        filters = filters or {}
        if filters.get("search"):
            search_term = str(filters["search"]).strip()
            qs = qs.filter(
                models.Q(full_name__icontains=search_term)
                | models.Q(email__icontains=search_term)
                | models.Q(title__icontains=search_term)
            )
        if filters.get("city"):
            qs = qs.filter(city_id=filters["city"])
        if filters.get("career"):
            qs = qs.filter(career_id=filters["career"])
        return qs.order_by("-create_at")

    def resolve_relationships(self, row_dict: dict, company) -> Tuple[dict, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []

        # Resolve City
        city_name = row_dict.get("cityName")
        if city_name:
            city_instance = City.objects.filter(name__iexact=str(city_name).strip()).first()
            if city_instance:
                row_dict["_resolved_city"] = city_instance
            else:
                issues.append(
                    ValidationIssue(
                        field="Tỉnh / Thành phố",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Tỉnh/Thành phố '{city_name}' không tồn tại trong hệ thống.",
                        value=city_name,
                    )
                )

        # Resolve Career
        career_name = row_dict.get("careerName")
        if career_name:
            career_instance = Career.objects.filter(name__iexact=str(career_name).strip()).first()
            if career_instance:
                row_dict["_resolved_career"] = career_instance
            else:
                issues.append(
                    ValidationIssue(
                        field="Ngành nghề",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Ngành nghề '{career_name}' không tồn tại trong hệ thống.",
                        value=career_name,
                    )
                )

        return row_dict, issues

    def create_record(self, validated_data: dict, company, user) -> EmployerCandidateProfile:
        data = {
            "company": company,
            "created_by": user,
            "full_name": validated_data.get("fullName"),
            "email": validated_data.get("email"),
            "phone": validated_data.get("phone"),
            "title": validated_data.get("title"),
            "position": validated_data.get("position"),
            "experience": validated_data.get("experience"),
            "academic_level": validated_data.get("academicLevel"),
            "expected_salary": validated_data.get("expectedSalary"),
            "skills_summary": validated_data.get("skillsSummary"),
            "note": validated_data.get("note"),
            "city": validated_data.get("_resolved_city"),
            "career": validated_data.get("_resolved_career"),
        }
        return EmployerCandidateProfile.objects.create(**data)

    def update_record(
        self, instance: EmployerCandidateProfile, validated_data: dict, company, user
    ) -> EmployerCandidateProfile:
        instance.full_name = validated_data.get("fullName", instance.full_name)
        if "phone" in validated_data and validated_data["phone"]:
            instance.phone = validated_data["phone"]
        if "title" in validated_data and validated_data["title"]:
            instance.title = validated_data["title"]
        if "position" in validated_data:
            instance.position = validated_data["position"]
        if "experience" in validated_data:
            instance.experience = validated_data["experience"]
        if "academicLevel" in validated_data:
            instance.academic_level = validated_data["academicLevel"]
        if "expectedSalary" in validated_data:
            instance.expected_salary = validated_data["expectedSalary"]
        if "skillsSummary" in validated_data:
            instance.skills_summary = validated_data["skillsSummary"]
        if "note" in validated_data:
            instance.note = validated_data["note"]
        if "_resolved_city" in validated_data:
            instance.city = validated_data["_resolved_city"]
        if "_resolved_career" in validated_data:
            instance.career = validated_data["_resolved_career"]
        instance.save()
        return instance
