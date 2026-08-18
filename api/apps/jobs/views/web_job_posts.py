import datetime

from django.db import DatabaseError
from django.db.models import Count, F, Prefetch, Avg, Min, Max, Q
from django.http import Http404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions as perms_sys, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from apps.accounts import permissions as perms_custom
from apps.profiles.models import Resume
from shared import pagination as paginations
from shared import renderers
from shared.audit import AuditLogViewSetMixin, record_audit_log
from shared.permissions import PermissionActionMapMixin
from shared.configs import table_export
from shared.configs import variable_response as var_res
from shared.configs import variable_system as var_sys
from shared.helpers import helper, utils

from ..filters import AliasedOrderingFilter, JobPostFilter
from ..exceptions import JobsDomainError
from ..models import JobPost, JobPostActivity, SavedJobPost
from ..serializers import JobPostSerializer
from ..ai_scoring_service import score_resume_job_fit


class PrivateJobPostViewSet(
    AuditLogViewSetMixin,
    PermissionActionMapMixin,
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.CreateAPIView,
    generics.UpdateAPIView,
    generics.DestroyAPIView,
):
    queryset = JobPost.objects.select_related(
        'company',
        'company__logo',
        'company__cover_image',
        'company__user',
        'location',
        'location__city',
        'career',
    ).annotate(
        applied_total=Count(
            'jobpostactivity',
            filter=Q(jobpostactivity__is_deleted=False),
            distinct=True,
        ),
    ).order_by("-create_at", "-update_at", "-id")
    serializer_class = JobPostSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    permission_classes = [perms_custom.JobPostOwnerPerms]
    filterset_class = JobPostFilter
    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter]
    lookup_field = "slug"
    ordering_fields = (
        ('jobName', 'job_name'),
        ('createAt', 'create_at'),
        ('deadline', 'deadline'),
        ('viewedTotal', 'views'),
        ('appliedTotal', 'applied_total'),
    )

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        val = self.kwargs.get(lookup_url_kwarg) or self.kwargs.get("pk") or self.kwargs.get("slug")
        if not val:
            raise Http404("No JobPost matches the given query.")

        str_val = str(val).strip()
        obj = None
        if str_val.isdigit():
            obj = queryset.filter(id=int(str_val)).first()
        
        if not obj:
            obj = queryset.filter(slug=str_val).first()

        if not obj:
            raise Http404("No JobPost matches the given query.")

        self.check_object_permissions(self.request, obj)
        return obj

    permission_action_map = {
        "get_suggested_job_posts": [perms_sys.IsAuthenticated],
    }
    default_permission_classes = [perms_custom.JobPostOwnerPerms]

    @action(methods=["get"], detail=False, url_path="job-posts-options", url_name="job-posts-options")
    def get_job_post_options(self, request):
        user = request.user
        from apps.accounts.active_company import apply_active_company_from_request
        from apps.profiles.models import Company
        company = apply_active_company_from_request(request)
        if not company:
            company = getattr(user, 'company', None) or Company.objects.filter(user=user).first()
        if not company:
            return var_res.response_data(data=[])
        queryset = JobPost.objects.filter(company=company).order_by("-id")
        serializer = JobPostSerializer(
            queryset,
            many=True,
            fields=[
                "id",
                "jobName",
            ],
        )
        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=True, url_path="ai-recommended-candidates", url_name="ai-recommended-candidates")
    def ai_recommended_candidates(self, request, slug=None, pk=None):
        try:
            job_post = self.get_object()
        except Exception:
            return var_res.response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"errorMessage": ["Không tìm thấy bài tuyển dụng."]},
            )
        
        job_career_id = job_post.career_id
        job_city_id = job_post.location.city_id if (job_post.location and job_post.location.city) else None
        job_title = (job_post.job_name or "").lower()

        matching_qs = Resume.objects.filter(is_active=True)
        if job_career_id:
            matching_qs = matching_qs.filter(career_id=job_career_id)
        if job_city_id:
            matching_qs = matching_qs.filter(city_id=job_city_id)
        matching_qs = matching_qs.select_related('user', 'user__avatar', 'city', 'career')

        resumes = list(matching_qs[:50])

        from apps.profiles.models import ResumeSaved
        saved_resume_ids = set()
        if request.user and request.user.is_authenticated:
            active_comp = getattr(request.user, 'active_company', None)
            if active_comp:
                saved_resume_ids = set(
                    ResumeSaved.objects.filter(company=active_comp).values_list('resume_id', flat=True)
                )

        recommendations: list[dict] = []
        for resume in resumes:
            user = resume.user
            if not user or not user.is_active:
                continue

            # Evaluate fit using LLM Service
            resume_data = {
                "title": resume.title or "",
                "skills": resume.skills_summary or "",
                "experience": resume.experience or 0,
                "academic_level": getattr(resume, "academic_level", 0) or 0,
                "salary_min": getattr(resume, "salary_min", 0) or 0,
                "salary_max": getattr(resume, "salary_max", 0) or 0,
            }
            job_data = {
                "job_name": job_post.job_name or "",
                "description": job_post.job_description or "",
                "experience": job_post.experience or 0,
                "salary_min": job_post.salary_min or 0,
                "salary_max": job_post.salary_max or 0,
            }

            llm_result = score_resume_job_fit(resume_data, job_data, resume_id=resume.id, job_id=job_post.id)
            
            score = None
            reasons = []
            if isinstance(llm_result, dict):
                score_val = llm_result.get("overall_score")
                if score_val is not None:
                    try:
                        score = int(score_val)
                    except (ValueError, TypeError):
                        score = None
                reasons = [r for r in llm_result.get("strengths", []) if isinstance(r, str) and r.strip()]

            if not reasons:
                if job_career_id and resume.career_id == job_career_id:
                    reasons.append(f"Đúng ngành {job_post.career.name if job_post.career else 'nghề'}")
                if job_city_id and resume.city_id == job_city_id:
                    reasons.append(f"Khu vực {resume.city.name if resume.city else ''}")
                if job_title and any(w in (resume.title or '').lower() for w in job_title.split() if len(w) > 2):
                    reasons.append("Chức danh phù hợp")

            avatar_url = None
            if getattr(user, 'avatar', None) and getattr(user.avatar, 'file', None):
                try:
                    avatar_url = helper.get_presigned_url(user.avatar.file.name)
                except Exception:
                    avatar_url = None

            full_name = (user.full_name or user.username or "").strip()

            exp_map = {
                1: "Chưa có kinh nghiệm",
                2: "Dưới 1 năm kinh nghiệm",
                3: "1 năm kinh nghiệm",
                4: "2 năm kinh nghiệm",
                5: "3 năm kinh nghiệm",
                6: "4 năm kinh nghiệm",
                7: "5 năm kinh nghiệm",
                8: "Trên 5 năm kinh nghiệm",
            }
            exp_display = exp_map.get(resume.experience) if resume.experience else None

            recommendations.append({
                "id": resume.id,
                "slug": resume.slug or str(resume.id),
                "userId": user.id,
                "fullName": full_name,
                "title": resume.title or None,
                "avatarUrl": avatar_url,
                "city": resume.city.name if resume.city else None,
                "experience": exp_display,
                "matchScore": score,
                "matchReasons": reasons,
                "skillsSummary": resume.skills_summary or None,
                "updatedAt": resume.update_at.strftime("%d/%m/%Y") if resume.update_at else None,
                "isSaved": resume.id in saved_resume_ids,
            })

        recommendations.sort(key=lambda x: (x["matchScore"] is not None, x["matchScore"] or 0), reverse=True)

        return var_res.response_data(data={
            "jobPostId": job_post.id,
            "jobName": job_post.job_name,
            "totalCount": len(recommendations),
            "candidates": recommendations[:20]
        })

    @action(methods=["get"], detail=False, url_path="suggested-job-posts", url_name="suggested-job-posts")
    def get_suggested_job_posts(self, request):
        resumes = Resume.objects.filter(user=request.user).values_list("career", "city")
        careers_id = [x[0] for x in resumes if x[0] is not None]
        cities_id = [x[1] for x in resumes if x[1] is not None]

        base_qs = (
            JobPost.objects.select_related(
                'company',
                'company__logo',
                'company__cover_image',
                'company__user',
                'location',
                'location__city',
                'career',
            )
            .filter(
                status=var_sys.JobPostStatus.APPROVED,
                deadline__gte=datetime.datetime.now().date(),
                company__is_verified=True,
            )
        )

        filter_q = Q()
        if careers_id:
            filter_q |= Q(career__in=careers_id)
        if cities_id:
            filter_q |= Q(location__city__in=cities_id)

        if filter_q:
            queryset = base_qs.filter(filter_q)
            if not queryset.exists():
                queryset = base_qs
        else:
            queryset = base_qs

        queryset = (
            queryset.prefetch_related(
                Prefetch(
                    'savedjobpost_set',
                    queryset=SavedJobPost.objects.filter(user=request.user)
                    if request.user.is_authenticated
                    else SavedJobPost.objects.none(),
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(user=request.user, is_deleted=False)
                    if request.user.is_authenticated
                    else JobPostActivity.objects.none(),
                ),
            )
            .order_by("-create_at", "-update_at")
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    "salaryMin",
                    "salaryMax",
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'salary',
                    'city',
                    'deadline',
                    'locationDict',
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def create(self, request, *args, **kwargs):
        from rest_framework.exceptions import ValidationError
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from ..services import JobPostService
        try:
            job_post = JobPostService.create_job(
                user=request.user,
                validated_data=serializer.validated_data
            )
        except JobsDomainError as exc:
            raise ValidationError({"errorMessage": [str(exc)]})

        response_serializer = self.get_serializer(job_post)
        record_audit_log(request=request, action="create", instance=job_post)
        return var_res.response_data(status=status.HTTP_201_CREATED, data=response_serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        from ..services import JobPostService
        updated_instance = JobPostService.update_job(
            user=request.user,
            job_post=instance,
            validated_data=serializer.validated_data
        )

        if getattr(updated_instance, '_prefetched_objects_cache', None):
            updated_instance._prefetched_objects_cache = {}

        response_serializer = self.get_serializer(updated_instance)
        record_audit_log(request=request, action="update", instance=updated_instance)
        return var_res.response_data(data=response_serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = (
            self.filter_queryset(
                self.get_queryset()
                .filter(company=request.user.active_company)
                .order_by('-update_at', '-create_at')
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    "id",
                    "slug",
                    "jobName",
                    "createAt",
                    "deadline",
                    "appliedNumber",
                    "views",
                    "isUrgent",
                    "status",
                    "isExpired",
                    "aiRecommendedCount",
                    "aiRecommendedAvatars",
                    "ai_recommended_count",
                    "ai_recommended_avatars",
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False, url_path="export", url_name="job-posts-export")
    def export_job_posts(self, request):
        queryset = (
            self.filter_queryset(
                self.get_queryset()
                .filter(
                    status=var_sys.JobPostStatus.APPROVED,
                    company=request.user.active_company,
                )
                .order_by('update_at', 'create_at')
            )
        )

        serializer = self.get_serializer(
            queryset,
            many=True,
            fields=[
                "id",
                "jobName",
                "views",
                "createAt",
                "deadline",
                "appliedNumber",
            ],
        )

        result_data = utils.convert_data_with_en_key_to_vn_kew(
            serializer.data, table_export.JOB_POSTS_EXPORT_FIELD
        )
        return var_res.response_data(data=result_data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            fields=[
                "id",
                "slug",
                "jobName",
                "academicLevel",
                "deadline",
                "quantity",
                "genderRequired",
                "jobDescription",
                "jobRequirement",
                "benefitsEnjoyed",
                "career",
                'status',
                "position",
                "typeOfWorkplace",
                "experience",
                "jobType",
                "salaryMin",
                "salaryMax",
                "isUrgent",
                "contactPersonName",
                "contactPersonPhone",
                "contactPersonEmail",
                "location",
            ],
        )
        return var_res.response_data(data=serializer.data)


class JobPostViewSet(PermissionActionMapMixin, viewsets.GenericViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = JobPost.objects.select_related(
        'company',
        'company__logo',
        'company__cover_image',
        'company__user',
        'location',
        'location__city',
        'career',
    ).filter(
        status=var_sys.JobPostStatus.APPROVED,
        deadline__gte=datetime.datetime.now().date(),
        company__is_verified=True,
    ).order_by("-is_urgent", "-is_hot", "-create_at", "-update_at", "-id")
    serializer_class = JobPostSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    permission_classes = [perms_sys.AllowAny]
    filterset_class = JobPostFilter
    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter]
    lookup_field = "slug"

    permission_action_map = {
        "get_job_posts_saved": [perms_sys.IsAuthenticated],
        "get_recommended_jobs_action": [perms_sys.AllowAny],
    }
    default_permission_classes = [perms_sys.AllowAny]

    @action(methods=["get"], detail=False, url_path="recommended-jobs", url_name="recommended-jobs")
    def get_recommended_jobs_action(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            queryset = self.queryset[:10]
            serializer = self.get_serializer(queryset, many=True)
            return var_res.response_data(data=serializer.data)

        from apps.jobs.recommendation_service import get_recommended_jobs
        queryset = get_recommended_jobs(user, limit=20)
        if not queryset.exists():
            queryset = self.queryset[:10]

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)
    ordering_fields = (
        ('jobName', 'job_name'),
        ('createAt', 'create_at'),
        ('deadline', 'deadline'),
        ('viewedTotal', 'views'),
    )

    def list(self, request, *args, **kwargs):
        # Cache logic
        from shared.helpers.redis_service import RedisService
        import hashlib
        from urllib.parse import parse_qsl, urlencode

        redis_obj = RedisService()
        raw_query_str = request.GET.urlencode()
        filtered_query = [
            (k, v) for k, v in parse_qsl(raw_query_str, keep_blank_values=False) if v != ""
        ]
        filtered_query.sort()
        query_str = urlencode(filtered_query)
        query_hash = hashlib.md5(query_str.encode("utf-8")).hexdigest()
        cache_key = f'job_list_{query_hash}_{request.user.id if request.user.is_authenticated else 0}'

        try:
            cached_res = redis_obj.get_json(cache_key)
            if cached_res:
                return var_res.response_data(data=cached_res)
        except Exception as e:
            helper.print_log_error("Get cache list job post", e)

        queryset = self.filter_queryset(
            self.get_queryset()
            .prefetch_related(
                Prefetch(
                    'savedjobpost_set',
                    queryset=SavedJobPost.objects.filter(user=request.user)
                    if request.user.is_authenticated
                    else SavedJobPost.objects.none(),
                ),
                Prefetch(
                    'jobpostactivity_set',
                    queryset=JobPostActivity.objects.filter(user=request.user, is_deleted=False)
                    if request.user.is_authenticated
                    else JobPostActivity.objects.none(),
                ),
            )
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    "salaryMin",
                    "salaryMax",
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'salary',
                    'city',
                    'deadline',
                    'locationDict',
                ],
            )
            paginated_response = self.get_paginated_response(serializer.data)
            try:
                redis_obj.set_json(cache_key, paginated_response.data, 300)
            except Exception as e:
                helper.print_log_error("Set cache list job post", e)
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            JobPost.objects.filter(pk=instance.pk).update(views=F('views') + 1)
            instance.refresh_from_db()
        except DatabaseError as ex:
            helper.print_log_error("save views", ex)

        serializer = self.get_serializer(
            instance,
            fields=[
                'id',
                'slug',
                'jobName',
                'deadline',
                'quantity',
                'genderRequired',
                'jobDescription',
                'jobRequirement',
                'benefitsEnjoyed',
                'career',
                'position',
                'typeOfWorkplace',
                'experience',
                'academicLevel',
                'jobType',
                'salaryMin',
                'salaryMax',
                'contactPersonName',
                'contactPersonPhone',
                'contactPersonEmail',
                'location',
                'createAt',
                'isSaved',
                'isApplied',
                'companyDict',
                'views',
            ],
        )
        return var_res.response_data(data=serializer.data)

    @action(methods=["get"], detail=False, url_path="job-posts-saved", url_name="job-posts-saved")
    def get_job_posts_saved(self, request):
        user = request.user
        queryset = (
            user.saved_job_posts.filter(
                status=var_sys.JobPostStatus.APPROVED,
                deadline__gte=datetime.datetime.now().date(),
                company__is_verified=True,
            )
            .select_related(
                'company',
                'company__logo',
                'company__cover_image',
                'company__user',
                'location',
                'location__city',
                'career',
            )
            .prefetch_related(
                Prefetch('savedjobpost_set', queryset=SavedJobPost.objects.filter(user=user)),
                Prefetch('jobpostactivity_set', queryset=JobPostActivity.objects.filter(user=user, is_deleted=False)),
            )
            .order_by('update_at', 'create_at')
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    "salaryMin",
                    "salaryMax",
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'isApplied',
                    'salary',
                    'city',
                    'deadline',
                    'locationDict',
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    @action(methods=["post"], detail=True, url_path="save", url_name="save", permission_classes=[perms_custom.IsJobSeekerUser])
    def save_job(self, request, slug):
        from ..services import JobActivityService
        try:
            is_saved = JobActivityService.toggle_save_job(
                user=request.user,
                job_post=self.get_object()
            )
            return var_res.response_data(data={"isSaved": is_saved})
        except JobsDomainError as e:
            return var_res.response_data(status=status.HTTP_400_BAD_REQUEST, errors={"errorMessage": [str(e)]})

    @action(methods=["get"], detail=True, url_path="salary-insight", url_name="salary-insight")
    def salary_insight(self, request, slug):
        def percentile(values, ratio):
            if not values:
                return None
            ordered = sorted(float(value) for value in values)
            if len(ordered) == 1:
                return ordered[0]
            position = (len(ordered) - 1) * ratio
            lower_index = int(position)
            upper_index = min(lower_index + 1, len(ordered) - 1)
            weight = position - lower_index
            return ordered[lower_index] + (ordered[upper_index] - ordered[lower_index]) * weight

        def rounded(value):
            return int(round(float(value))) if value is not None else None

        job_post = self.get_object()
        career_id = job_post.career_id
        city_id = job_post.location.city_id if job_post.location and job_post.location.city_id else None

        base_queryset = (
            self.get_queryset()
            .filter(salary_min__gt=0, salary_max__gt=0)
            .exclude(pk=job_post.pk)
        )

        scope_candidates = []
        if career_id and city_id:
            scope_candidates.append((
                "sameCareerCity",
                base_queryset.filter(career_id=career_id, location__city_id=city_id),
            ))
        if career_id:
            scope_candidates.append(("sameCareer", base_queryset.filter(career_id=career_id)))
        if city_id:
            scope_candidates.append(("sameCity", base_queryset.filter(location__city_id=city_id)))
        scope_candidates.append(("allActive", base_queryset))

        sample_threshold = 3
        selected_scope = "none"
        queryset = base_queryset.none()
        best_count = 0

        for scope_key, candidate_queryset in scope_candidates:
            candidate_count = candidate_queryset.count()
            if candidate_count >= sample_threshold:
                selected_scope = scope_key
                queryset = candidate_queryset
                best_count = candidate_count
                break
            if candidate_count > best_count:
                selected_scope = scope_key
                queryset = candidate_queryset
                best_count = candidate_count

        if best_count == 0:
            selected_scope = "none"

        aggregate = queryset.aggregate(
            count=Count('id'),
            minSalary=Min('salary_min'),
            maxSalary=Max('salary_max'),
            avgMinSalary=Avg('salary_min'),
            avgMaxSalary=Avg('salary_max'),
        )

        salary_rows = list(queryset.values("salary_min", "salary_max"))
        salary_midpoints = [
            (row["salary_min"] + row["salary_max"]) / 2
            for row in salary_rows
            if row["salary_min"] and row["salary_max"]
        ]
        median_salary = percentile(salary_midpoints, 0.5)
        p25_salary = percentile(salary_midpoints, 0.25)
        p75_salary = percentile(salary_midpoints, 0.75)

        current_mid_salary = None
        salary_delta = None
        salary_delta_percent = None
        salary_position = "unknown"
        if job_post.salary_min and job_post.salary_max:
            current_mid_salary = (job_post.salary_min + job_post.salary_max) / 2
            if median_salary:
                salary_delta = current_mid_salary - median_salary
                salary_delta_percent = (salary_delta / median_salary) * 100
            if p25_salary is not None and p75_salary is not None:
                if current_mid_salary < p25_salary:
                    salary_position = "below"
                elif current_mid_salary > p75_salary:
                    salary_position = "above"
                else:
                    salary_position = "within"

        sample_count = aggregate.get("count") or 0
        confidence = "none"
        if sample_count >= 20:
            confidence = "high"
        elif sample_count >= 5:
            confidence = "medium"
        elif sample_count > 0:
            confidence = "low"

        related_jobs = queryset.select_related('company', 'company__logo').order_by("-update_at", "-id")[:5]
        related_serializer = JobPostSerializer(
            related_jobs,
            many=True,
            fields=['id', 'slug', 'jobName', 'salaryMin', 'salaryMax', 'companyDict', 'city'],
        )

        return var_res.response_data(data={
            "careerId": career_id,
            "cityId": city_id,
            "jobPostId": job_post.id,
            "scope": selected_scope,
            "sampleThreshold": sample_threshold,
            "confidence": confidence,
            "count": sample_count,
            "minSalary": aggregate.get("minSalary"),
            "maxSalary": aggregate.get("maxSalary"),
            "avgMinSalary": rounded(aggregate.get("avgMinSalary")),
            "avgMaxSalary": rounded(aggregate.get("avgMaxSalary")),
            "medianSalary": rounded(median_salary),
            "p25Salary": rounded(p25_salary),
            "p75Salary": rounded(p75_salary),
            "currentSalaryMin": job_post.salary_min,
            "currentSalaryMax": job_post.salary_max,
            "currentMidSalary": rounded(current_mid_salary),
            "salaryDelta": rounded(salary_delta),
            "salaryDeltaPercent": round(float(salary_delta_percent), 1) if salary_delta_percent is not None else None,
            "salaryPosition": salary_position,
            "relatedJobs": related_serializer.data,
        })


class AdminJobPostViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = JobPost.objects.select_related('user', 'company', 'career', 'location').all().order_by(
        "-create_at", "-update_at", "-id"
    )
    serializer_class = JobPostSerializer
    permission_classes = [perms_custom.IsAdminUser]
    pagination_class = paginations.CustomPagination
    filter_backends = [DjangoFilterBackend, AliasedOrderingFilter, SearchFilter]
    filterset_class = JobPostFilter
    search_fields = ['job_name', 'company__company_name']
    ordering_fields = ['id', ('jobName', 'job_name'), 'create_at', 'deadline', 'views']

    def get_queryset(self):
        queryset = super().get_queryset()
        kw = self.request.query_params.get("kw")
        if kw:
            queryset = queryset.filter(
                Q(job_name__icontains=kw)
                | Q(company__company_name__icontains=kw)
                | Q(contact_person_email__icontains=kw)
            )
        is_expired = self.request.query_params.get("isExpired") or self.request.query_params.get("is_expired")
        if is_expired is not None:
            normalized = str(is_expired).strip().lower()
            if normalized in {"1", "true", "yes", "on"}:
                queryset = queryset.filter(
                    status=var_sys.JobPostStatus.APPROVED,
                    deadline__lt=datetime.datetime.now().date(),
                )
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    'id',
                    'slug',
                    'companyDict',
                    'salaryMin',
                    'salaryMax',
                    'jobName',
                    'isHot',
                    'isUrgent',
                    'status',
                    'createAt',
                    'deadline',
                    'locationDict',
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve_job(self, request, pk=None):
        job_post = self.get_object()
        if not job_post.company.is_verified:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"errorMessage": ["Company must be verified before approving a job post."]},
            )
        job_post.status = var_sys.JobPostStatus.APPROVED
        job_post.save()
        record_audit_log(request=request, action="approve", instance=job_post)
        return var_res.response_data(data=JobPostSerializer(job_post).data)

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject_job(self, request, pk=None):
        job_post = self.get_object()
        job_post.status = var_sys.JobPostStatus.REJECTED
        job_post.save()
        record_audit_log(request=request, action="reject", instance=job_post)
        return var_res.response_data(data=JobPostSerializer(job_post).data)

    @action(detail=False, methods=['post'], url_path='bulk-approve')
    def bulk_approve(self, request):
        ids = request.data.get("ids", [])
        if not ids or not isinstance(ids, list):
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"ids": ["Danh sách ID là bắt buộc."]},
            )
        valid_jobs = JobPost.objects.filter(id__in=ids, company__is_verified=True)
        updated_count = valid_jobs.update(status=var_sys.JobPostStatus.APPROVED)
        return var_res.response_data(data={"updatedCount": updated_count})

    @action(detail=False, methods=['post'], url_path='bulk-reject')
    def bulk_reject(self, request):
        ids = request.data.get("ids", [])
        reason = request.data.get("reason", "")
        if not ids or not isinstance(ids, list):
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"ids": ["Danh sách ID là bắt buộc."]},
            )
        updated_count = JobPost.objects.filter(id__in=ids).update(
            status=var_sys.JobPostStatus.REJECTED
        )
        return var_res.response_data(data={"updatedCount": updated_count, "reason": reason})
