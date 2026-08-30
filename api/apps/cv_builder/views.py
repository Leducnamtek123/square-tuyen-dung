from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F
from django.shortcuts import get_object_or_404

from .models import CVTemplate, CandidateCV, CVSuggestion
from .serializers import (
    CVTemplateSerializer,
    CandidateCVListSerializer,
    CandidateCVDetailSerializer,
    CandidateCVCreateUpdateSerializer,
    PublicCVSerializer,
    CVSuggestionSerializer,
)


class CVTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for listing and viewing CV Templates with category filtering,
    keyword searching, and popularity ordering.
    """
    queryset = CVTemplate.objects.filter(is_active=True)
    serializer_class = CVTemplateSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "is_popular", "is_premium"]
    search_fields = ["name", "description", "category_name"]
    ordering_fields = ["sort_order", "use_count", "view_count", "create_at"]
    ordering = ["sort_order", "-use_count"]

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs[lookup_url_kwarg]
        if str(lookup_val).isdigit():
            obj = get_object_or_404(queryset, pk=lookup_val)
        else:
            obj = get_object_or_404(queryset, code=lookup_val)
        self.check_object_permissions(self.request, obj)
        return obj

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        CVTemplate.objects.filter(pk=instance.pk).update(view_count=F("view_count") + 1)
        instance.refresh_from_db(fields=["view_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CandidateCVViewSet(viewsets.ModelViewSet):
    """
    Authenticated ViewSet for Candidates to manage their CV instances,
    supporting Auto-Save updates, duplication, and setting primary CVs.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "template_code"]
    ordering_fields = ["update_at", "create_at", "views_count"]
    ordering = ["-is_main_cv", "-update_at"]

    def get_queryset(self):
        return CandidateCV.objects.filter(user=self.request.user).select_related("template")

    def get_serializer_class(self):
        if self.action == "list":
            return CandidateCVListSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return CandidateCVCreateUpdateSerializer
        return CandidateCVDetailSerializer

    @action(detail=True, methods=["post"], url_path="duplicate")
    def duplicate(self, request, pk=None):
        """
        Duplicates an existing CV with a new auto-generated title and slug.
        """
        source_cv = self.get_object()
        new_title = f"{source_cv.title} (Bản sao)"
        duplicated_cv = CandidateCV.objects.create(
            user=request.user,
            template=source_cv.template,
            template_code=source_cv.template_code,
            title=new_title,
            theme_config=source_cv.theme_config,
            cv_data=source_cv.cv_data,
            thumbnail_url=source_cv.thumbnail_url,
            is_main_cv=False,
            is_public=source_cv.is_public,
        )
        serializer = CandidateCVDetailSerializer(duplicated_cv)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="set-main")
    def set_main(self, request, pk=None):
        """
        Sets this CV as the primary active CV for 1-click applications.
        """
        cv = self.get_object()
        CandidateCV.objects.filter(user=request.user, is_main_cv=True).update(is_main_cv=False)
        cv.is_main_cv = True
        cv.save(update_fields=["is_main_cv"])
        return Response({"detail": "Đã đặt làm CV chính thành công.", "id": cv.id})

    @action(detail=True, methods=["post"], url_path="ai-review")
    def ai_review(self, request, pk=None):
        """
        Intelligent ATS CV Review & Scoring Engine:
        Evaluates 5 dimensions: Contact, Experience Impact, Skills, Credentials, and Readability.
        """
        cv = self.get_object()
        cv_data = cv.cv_data or {}
        personal_info = cv_data.get("personalInfo", {})
        experiences = cv_data.get("experiences", [])
        educations = cv_data.get("educations", [])
        skills = cv_data.get("skills", [])
        projects = cv_data.get("projects", [])
        certificates = cv_data.get("certificates", [])

        # 1. Contact & Identity Score (max 20)
        contact_score = 0
        if personal_info.get("fullName"):
            contact_score += 5
        if personal_info.get("email") and "@" in str(personal_info.get("email")):
            contact_score += 5
        if personal_info.get("phoneNumber"):
            contact_score += 4
        if personal_info.get("title"):
            contact_score += 3
        if personal_info.get("address") or personal_info.get("bio"):
            contact_score += 3
        contact_score = min(contact_score, 20)

        # 2. Experience & Quantifiable Impact Score (max 30)
        exp_score = 0
        has_metrics = False
        import re
        number_pattern = re.compile(r'\d+[%kKmM+]|\b\d{2,}\b|\$\d+')

        if experiences:
            exp_score += 10
            if len(experiences) >= 2:
                exp_score += 5
            for exp in experiences:
                desc = str(exp.get("description", ""))
                if len(desc) > 40:
                    exp_score += 5
                    break
            for exp in experiences:
                desc = str(exp.get("description", ""))
                if number_pattern.search(desc) or "%" in desc or "tăng" in desc.lower() or "giảm" in desc.lower():
                    exp_score += 10
                    has_metrics = True
                    break
        exp_score = min(exp_score, 30)

        # 3. Skills Density Score (max 20)
        skills_score = 0
        if skills:
            skills_score += 10
            if len(skills) >= 4:
                skills_score += 6
            if len(skills) >= 6:
                skills_score += 4
        skills_score = min(skills_score, 20)

        # 4. Education & Credentials Score (max 15)
        edu_score = 0
        if educations:
            edu_score += 10
            for edu in educations:
                if edu.get("major") and edu.get("school"):
                    edu_score += 5
                    break
        if certificates:
            edu_score = min(edu_score + 3, 15)
        edu_score = min(edu_score, 15)

        # 5. Structure & Completeness Score (max 15)
        structure_score = 0
        if cv.title and cv.title != "CV Chưa Đặt Tên":
            structure_score += 5
        if personal_info.get("bio") and len(str(personal_info.get("bio"))) >= 30:
            structure_score += 5
        if projects or certificates or cv_data.get("languages"):
            structure_score += 5
        structure_score = min(structure_score, 15)

        total_score = contact_score + exp_score + skills_score + edu_score + structure_score

        # Determine level & feedback
        if total_score >= 85:
            grade = "Xuất sắc (ATS Chuẩn)"
            badge_color = "emerald"
            summary_feedback = "Hồ sơ của bạn có cấu trúc rất vững chắc, độ dài và các chỉ số định lượng đạt chuẩn quét tự động của các hệ thống tuyển dụng hiện đại."
        elif total_score >= 70:
            grade = "Tốt (Khá hoàn thiện)"
            badge_color = "blue"
            summary_feedback = "Hồ sơ trình bày rõ ràng, đã có các thành phần cơ bản. Cần bổ sung thêm một số số liệu định lượng về kết quả công việc để tăng sức thuyết phục."
        else:
            grade = "Cần cải thiện"
            badge_color = "amber"
            summary_feedback = "Hồ sơ còn thiếu các thông tin quan trọng. Vui lòng bổ sung đầy đủ kinh nghiệm làm việc, kỹ năng chuyên môn và các chứng chỉ nghề nghiệp."

        strengths = []
        if contact_score >= 18:
            strengths.append("Thông tin liên lạc & vị trí công việc đầy đủ, dễ liên hệ.")
        if has_metrics:
            strengths.append("Có chứa số liệu định lượng (%, KPI, kết quả) giúp gây ấn tượng mạnh với nhà tuyển dụng.")
        if len(skills) >= 4:
            strengths.append(f"Danh mục kỹ năng đa dạng ({len(skills)} kỹ năng) giúp vượt qua bộ lọc từ khóa ATS.")
        if len(educations) >= 1:
            strengths.append("Thông tin trình độ học vấn rõ ràng, minh bạch.")

        suggestions = []
        if not has_metrics:
            suggestions.append({
                "category": "Kinh nghiệm làm việc",
                "priority": "high",
                "title": "Bổ sung số liệu định lượng (Action-Verb + Metric)",
                "detail": "Thêm các con số cụ thể vào mô tả công việc (ví dụ: 'Tăng trưởng doanh thu 25%', 'Rút ngắn thời gian xử lý 40%').",
                "example": "• Nâng điểm Lighthouse Core Web Vitals từ 68 lên 96/100, giảm thời gian tải trang trung bình 45%."
            })
        if len(skills) < 5:
            suggestions.append({
                "category": "Kỹ năng chuyên môn",
                "priority": "medium",
                "title": "Bổ sung ít nhất 5-6 kỹ năng cốt lõi",
                "detail": "Hệ thống ATS thường quét các từ khóa công nghệ và kỹ năng phần mềm để phân loại ứng viên.",
                "example": "Thêm các kỹ năng chuyên ngành như React, TypeScript, Agile/Scrum, v.v."
            })
        if not personal_info.get("bio") or len(str(personal_info.get("bio"))) < 30:
            suggestions.append({
                "category": "Mục tiêu nghề nghiệp",
                "priority": "medium",
                "title": "Viết đoạn giới thiệu bản thân súc tích (3-4 dòng)",
                "detail": "Tóm tắt thế mạnh cá nhân và mục tiêu hướng tới vị trí bạn muốn ứng tuyển.",
                "example": "Kỹ sư lập trình Frontend với 5 năm kinh nghiệm, có thế mạnh về hiệu năng web và Design System..."
            })
        if not certificates:
            suggestions.append({
                "category": "Chứng chỉ & Ngoại ngữ",
                "priority": "low",
                "title": "Bổ sung chứng chỉ nghề nghiệp hoặc ngoại ngữ",
                "detail": "Chứng chỉ quốc tế (TOEIC, IELTS, AWS, PMP) giúp CV của bạn vượt trội so với các ứng viên khác.",
                "example": "AWS Certified Cloud Practitioner, IELTS 7.5."
            })

        review_result = {
            "score": total_score,
            "grade": grade,
            "badge_color": badge_color,
            "summary_feedback": summary_feedback,
            "breakdown": {
                "contact": {"score": contact_score, "max": 20, "label": "Thông tin liên hệ"},
                "experience": {"score": exp_score, "max": 30, "label": "Kinh nghiệm & Thành tích"},
                "skills": {"score": skills_score, "max": 20, "label": "Kỹ năng chuyên môn"},
                "education": {"score": edu_score, "max": 15, "label": "Học vấn & Bằng cấp"},
                "structure": {"score": structure_score, "max": 15, "label": "Bố cục & Độ hoàn thiện"},
            },
            "strengths": strengths,
            "suggestions": suggestions,
        }

        cv.ai_score = total_score
        cv.ai_review_data = review_result
        cv.save(update_fields=["ai_score", "ai_review_data"])

        return Response(review_result, status=status.HTTP_200_OK)


class PublicCVView(APIView):
    """
    Public Endpoint allowing Recruiters and viewers to inspect a candidate's CV
    by shareable slug without authentication.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug=None):
        cv = get_object_or_404(CandidateCV, slug=slug, is_public=True)
        cv.views_count += 1
        cv.save(update_fields=["views_count"])
        serializer = PublicCVSerializer(cv)
        return Response(serializer.data)


class CVSuggestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for AI & industry-specific copywriting suggestions.
    """
    queryset = CVSuggestion.objects.filter(is_active=True)
    serializer_class = CVSuggestionSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["industry", "suggestion_type"]
    search_fields = ["title", "content", "industry_name"]
    ordering = ["sort_order", "industry"]
