import calendar
import datetime
from datetime import timedelta

import pandas as pd
import pytz
from django.db.models import Avg, Count, F, Q, Sum
from django.db.models.functions import ExtractMonth, ExtractYear, TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import status, viewsets

from apps.accounts import permissions as perms_custom
from apps.accounts.models import User
from apps.interviews.models import InterviewEvaluation, InterviewSession, Question, QuestionGroup
from apps.profiles.models import (
    Company,
    CompanyFollowed,
    CompanyVerification,
    JobSeekerProfile,
    Resume,
    ResumeSaved,
    ResumeViewed,
)
from shared.configs import variable_response as var_res
from shared.configs import variable_system as var_sys

from ..models import JobPost, JobPostActivity, SavedJobPost
from ..serializers import StatisticsSerializer


class JobSeekerStatisticViewSet(viewsets.ViewSet):
    permission_classes = [perms_custom.IsJobSeekerUser]

    def statistics(self, request):
        stat_type = (request.query_params.get("type") or "general").strip().lower()
        handlers = {
            "general": self.general_statistics,
            "total-view": self.total_view,
            "activity": self.activity_statistics,
            "activity-statistics": self.activity_statistics,
        }
        handler = handlers.get(stat_type)
        if not handler:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"type": [f"Unsupported statistics type: {stat_type}"]},
                data=None,
            )
        return handler(request)

    def general_statistics(self, request):
        user = request.user
        total_apply = JobPostActivity.objects.filter(user=user).count()
        total_save = SavedJobPost.objects.filter(user=user).count()
        total_view = ResumeViewed.objects.filter(resume__user=user).aggregate(Sum('views'))
        total_follow = CompanyFollowed.objects.filter(user=user).count()

        return var_res.response_data(
            data={
                "totalApply": total_apply,
                "totalSave": total_save,
                "totalView": total_view.get('views__sum', 0) if total_view.get('views__sum') else 0,
                "totalFollow": total_follow,
            }
        )

    def total_view(self, request):
        user = request.user
        total_view = ResumeViewed.objects.filter(resume__user=user).aggregate(Sum('views'))
        return var_res.response_data(
            data={
                "totalView": total_view.get('views__sum', 0) if total_view.get('views__sum') else 0,
            }
        )

    def activity_statistics(self, request):
        user = request.user
        now = datetime.datetime.now()
        last_year_today = now.replace(year=now.year - 1)
        first_day_of_month = last_year_today.replace(day=1)
        last_day = calendar.monthrange(now.year, now.month)[1]
        last_day_of_month = datetime.datetime(now.year, now.month, last_day)

        first_day_of_month_no_utc = first_day_of_month.date()
        last_day_of_month_no_utc = last_day_of_month.date()
        first_day_of_month_utc = first_day_of_month.astimezone(pytz.utc).date()
        last_day_of_month_utc = last_day_of_month.astimezone(pytz.utc).date()

        queryset1 = (
            JobPostActivity.objects.filter(
                user=user, create_at__date__range=[first_day_of_month_utc, last_day_of_month_utc]
            )
            .order_by('create_at')
            .annotate(year=ExtractYear('create_at'), month=ExtractMonth('create_at'))
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        queryset2 = (
            SavedJobPost.objects.filter(
                user=user, create_at__date__range=[first_day_of_month_utc, last_day_of_month_utc]
            )
            .order_by('create_at')
            .annotate(year=ExtractYear('create_at'), month=ExtractMonth('create_at'))
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        queryset3 = (
            CompanyFollowed.objects.filter(
                user=user, create_at__date__range=[first_day_of_month_utc, last_day_of_month_utc]
            )
            .order_by('create_at')
            .annotate(year=ExtractYear('create_at'), month=ExtractMonth('create_at'))
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        labels = []
        data1 = []
        data2 = []
        data3 = []

        title1 = "Applied Jobs"
        title2 = "Saved Jobs"
        title3 = "Companies Followed"

        date_range = pd.date_range(
            start=first_day_of_month_no_utc,
            end=last_day_of_month_no_utc,
            freq='M',
            normalize=True,
        )

        for date in date_range:
            m = date.month
            y = date.year

            items1 = [x for x in queryset1 if x['year'] == y and x['month'] == m]
            data1.append(items1[0]['count'] if items1 else 0)

            items2 = [x for x in queryset2 if x['year'] == y and x['month'] == m]
            data2.append(items2[0]['count'] if items2 else 0)

            items3 = [x for x in queryset3 if x['year'] == y and x['month'] == m]
            data3.append(items3[0]['count'] if items3 else 0)

            labels.append(f'T{m}-{y}')

        return var_res.response_data(
            data={
                "title1": title1,
                "title2": title2,
                "title3": title3,
                "labels": labels,
                "data1": data1,
                "data2": data2,
                "data3": data3,
            }
        )


class EmployerStatisticViewSet(viewsets.ViewSet):
    permission_classes = [perms_custom.IsEmployerUser]

    def statistics(self, request):
        stat_type = (request.query_params.get("type") or "general").strip().lower()
        handlers = {
            "general": self.general_statistics,
            "recruitment": self.recruitment_statistics,
            "candidate": self.candidate_statistics,
            "application": self.application_statistics,
            "recruitment-by-rank": self.recruitment_statistics_by_rank,
            "interview": self.interview_statistics,
        }
        handler = handlers.get(stat_type)
        if not handler:
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"type": [f"Unsupported statistics type: {stat_type}"]},
                data=None,
            )

        if stat_type == "general":
            return handler(request)
        if request.method != "POST":
            return var_res.response_data(
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
                errors={"detail": ["Use POST for this statistics type."]},
                data=None,
            )
        return handler(request)

    def general_statistics(self, request):
        user = request.user
        company = user.active_company

        # Job post stats
        total_job_post = JobPost.objects.filter(company=company).count()
        total_job_posting_pending_approval = JobPost.objects.filter(
            company=company,
            status=var_sys.JobPostStatus.PENDING,
        ).count()
        total_job_post_expired = JobPost.objects.filter(
            company=company,
            deadline__lt=datetime.datetime.now().date(),
        ).count()
        total_apply = JobPostActivity.objects.filter(job_post__company=company).count()

        # Company engagement stats
        total_followers = CompanyFollowed.objects.filter(
            company=company
        ).count()
        # Saved profiles — placeholder for future ResumeSaved model
        total_saved_profiles = ResumeSaved.objects.filter(company=company).count()

        # Interview stats
        interview_qs = InterviewSession.objects.filter(
            job_post__company=company
        )
        total_interviews = interview_qs.count()
        total_interviews_completed = interview_qs.filter(
            status='completed'
        ).count()
        total_interviews_in_progress = interview_qs.filter(
            status='in_progress'
        ).count()

        # AI scores (completed interviews only)
        ai_scores = interview_qs.filter(
            status='completed',
            ai_overall_score__isnull=False,
        ).aggregate(
            avgOverallScore=Avg('ai_overall_score'),
            avgTechnicalScore=Avg('ai_technical_score'),
            avgCommunicationScore=Avg('ai_communication_score'),
        )

        # Conversion rate: applications → interviews
        conversion_rate = round(
            (total_interviews / total_apply * 100) if total_apply > 0 else 0, 1
        )

        return var_res.response_data(
            data={
                "totalJobPost": total_job_post,
                "totalJobPostingPendingApproval": total_job_posting_pending_approval,
                "totalJobPostExpired": total_job_post_expired,
                "totalApply": total_apply,
                "totalFollowers": total_followers,
                "totalSavedProfiles": total_saved_profiles,
                "totalInterviews": total_interviews,
                "totalInterviewsCompleted": total_interviews_completed,
                "totalInterviewsInProgress": total_interviews_in_progress,
                "avgAiOverallScore": float(ai_scores['avgOverallScore'] or 0),
                "avgAiTechnicalScore": float(ai_scores['avgTechnicalScore'] or 0),
                "avgAiCommunicationScore": float(ai_scores['avgCommunicationScore'] or 0),
                "conversionRate": conversion_rate,
            }
        )

    def interview_statistics(self, request):
        """Interview statistics by month — status breakdown + AI score trends."""
        serializer = StatisticsSerializer(data=request.data)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                data=None,
                errors=serializer.errors,
            )

        start_date = pd.to_datetime(serializer.data.get("startDate"))
        end_date = pd.to_datetime(serializer.data.get("endDate"))
        user = request.user
        company = user.active_company

        base_qs = InterviewSession.objects.filter(
            job_post__company=company,
            create_at__date__range=[
                start_date.tz_localize(pytz.utc).date(),
                end_date.tz_localize(pytz.utc).date(),
            ],
        )

        # Status breakdown by month
        status_by_month = (
            base_qs
            .annotate(month=TruncMonth('create_at'))
            .values('month', 'status')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # AI score trends by month
        score_by_month = (
            base_qs
            .filter(status='completed', ai_overall_score__isnull=False)
            .annotate(month=TruncMonth('create_at'))
            .values('month')
            .annotate(
                avgOverall=Avg('ai_overall_score'),
                avgTechnical=Avg('ai_technical_score'),
                avgCommunication=Avg('ai_communication_score'),
                count=Count('id'),
            )
            .order_by('month')
        )

        # Build monthly data
        date_range = pd.date_range(start=start_date, end=end_date, freq='MS')
        labels = []
        completed_data = []
        scheduled_data = []
        cancelled_data = []
        in_progress_data = []
        avg_score_data = []

        status_dict = {}
        for entry in status_by_month:
            key = entry['month'].strftime('%Y-%m')
            if key not in status_dict:
                status_dict[key] = {}
            status_dict[key][entry['status']] = entry['count']

        score_dict = {}
        for entry in score_by_month:
            key = entry['month'].strftime('%Y-%m')
            score_dict[key] = float(entry['avgOverall'] or 0)

        for date in date_range:
            key = date.strftime('%Y-%m')
            labels.append(f"T{date.month}/{date.year}")
            month_data = status_dict.get(key, {})
            completed_data.append(month_data.get('completed', 0))
            scheduled_data.append(month_data.get('scheduled', 0) + month_data.get('draft', 0))
            cancelled_data.append(month_data.get('cancelled', 0))
            in_progress_data.append(
                month_data.get('in_progress', 0)
                + month_data.get('processing', 0)
                + month_data.get('calibration', 0)
            )
            avg_score_data.append(round(score_dict.get(key, 0), 1))

        # Pass/Fail ratio
        eval_qs = InterviewEvaluation.objects.filter(
            interview__job_post__company=company,
            interview__create_at__date__range=[
                start_date.tz_localize(pytz.utc).date(),
                end_date.tz_localize(pytz.utc).date(),
            ],
        )
        passed = eval_qs.filter(result='passed').count()
        failed = eval_qs.filter(result='failed').count()
        pending = eval_qs.filter(result='pending').count()

        # Average duration
        avg_duration = base_qs.filter(
            status='completed', duration__isnull=False
        ).aggregate(avg=Avg('duration'))['avg']

        return var_res.response_data(
            data={
                "labels": labels,
                "completedData": completed_data,
                "scheduledData": scheduled_data,
                "cancelledData": cancelled_data,
                "inProgressData": in_progress_data,
                "avgScoreData": avg_score_data,
                "passedCount": passed,
                "failedCount": failed,
                "pendingCount": pending,
                "avgDurationSeconds": int(avg_duration or 0),
            }
        )

    def recruitment_statistics(self, request):
        serializer = StatisticsSerializer(data=request.data)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                data=None,
                errors=serializer.errors,
            )

        start_date = pd.to_datetime(serializer.data.get("startDate"))
        end_date = pd.to_datetime(serializer.data.get("endDate"))
        user = request.user

        queryset = (
            JobPostActivity.objects.filter(job_post__company=user.active_company)
            .values(stt=F('status'))
            .filter(
                Q(create_at__isnull=True)
                | Q(
                    create_at__date__range=[
                        start_date.tz_localize(pytz.utc).date(),
                        end_date.tz_localize(pytz.utc).date(),
                    ]
                )
            )
            .annotate(countJobPostActivity=Count('id'))
            .order_by('-stt')
        )

        data_results = []
        for application_stt in var_sys.APPLICATION_STATUS:
            items = [x["countJobPostActivity"] for x in queryset if x.get("stt") == application_stt[0]]
            data_results.append(
                {
                    "label": application_stt[1],
                    "data": items if items else [0],
                }
            )

        return var_res.response_data(data=data_results)

    def candidate_statistics(self, request):
        serializer = StatisticsSerializer(data=request.data)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                data=None,
                errors=serializer.errors,
            )

        start_date_str = serializer.data.get("startDate")
        end_date_str = serializer.data.get("endDate")
        start_date1 = pd.to_datetime(start_date_str)
        end_date1 = pd.to_datetime(end_date_str)
        start_date2 = start_date1 - timedelta(days=365)
        end_date2 = end_date1 - timedelta(days=365)

        user = request.user
        queryset1 = (
            JobPostActivity.objects.filter(
                job_post__company=user.active_company,
                create_at__date__range=[
                    start_date1.tz_localize(pytz.utc).date(),
                    end_date1.tz_localize(pytz.utc).date(),
                ],
            )
            .annotate(date=TruncDate('create_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        queryset2 = (
            JobPostActivity.objects.filter(
                job_post__company=user.active_company,
                create_at__date__range=[
                    start_date2.tz_localize(pytz.utc).date(),
                    end_date2.tz_localize(pytz.utc).date(),
                ],
            )
            .annotate(date=TruncDate('create_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        title1 = end_date1.year
        title2 = end_date2.year
        labels = []
        data1 = []
        data2 = []

        # Optimize: convert querysets to dicts for O(1) lookup instead of O(n)
        dict1 = {x['date']: x['count'] for x in queryset1}
        dict2 = {x['date']: x['count'] for x in queryset2}

        date_range = pd.date_range(start=start_date1, end=end_date1, freq='D')
        for date in date_range:
            d = date.date()
            data1.append(dict1.get(d, 0))
            data2.append(dict2.get(d, 0))
            labels.append(date.strftime("%d/%m"))

        return var_res.response_data(
            data={
                "title1": title1,
                "title2": title2,
                "labels": labels,
                "data1": data1,
                "data2": data2,
                "borderColor1": "rgb(53, 162, 235)",
                "backgroundColor1": "rgba(53, 162, 235, 0.5)",
                "borderColor2": "rgb(255, 99, 132)",
                "backgroundColor2": "rgba(255, 99, 132, 0.5)",
            }
        )

    def application_statistics(self, request):
        serializer = StatisticsSerializer(data=request.data)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                data=None,
                errors=serializer.errors,
            )

        start_date = pd.to_datetime(serializer.data.get("startDate"))
        end_date = pd.to_datetime(serializer.data.get("endDate"))
        user = request.user

        # Optimize: cumulative job count using DB aggregation instead of O(n²)
        total_jobs_before_range = JobPost.objects.filter(
            company=user.active_company,
            create_at__date__lt=start_date.tz_localize(pytz.utc).date(),
        ).count()

        jobs_by_date = dict(
            JobPost.objects.filter(
                company=user.active_company,
                create_at__date__range=[
                    start_date.tz_localize(pytz.utc).date(),
                    end_date.tz_localize(pytz.utc).date(),
                ],
            )
            .annotate(date=TruncDate('create_at'))
            .values('date')
            .annotate(count=Count('id'))
            .values_list('date', 'count')
        )

        applies_by_date = dict(
            JobPostActivity.objects.filter(
                job_post__company=user.active_company,
                create_at__date__range=[
                    start_date.tz_localize(pytz.utc).date(),
                    end_date.tz_localize(pytz.utc).date(),
                ],
            )
            .annotate(date=TruncDate('create_at'))
            .values('date')
            .annotate(count=Count('id'))
            .values_list('date', 'count')
        )

        labels = []
        data1 = []
        data2 = []
        cumulative_jobs = total_jobs_before_range
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        for date in date_range:
            d = date.date()
            cumulative_jobs += jobs_by_date.get(d, 0)
            data1.append(cumulative_jobs)
            data2.append(applies_by_date.get(d, 0))
            labels.append(date.strftime("%d/%m"))

        return var_res.response_data(
            data={
                "title1": "Jobs",
                "title2": "Applications",
                "labels": labels,
                "data1": data1,
                "data2": data2,
                "backgroundColor1": "rgb(75, 192, 192)",
                "backgroundColor2": "red",
            }
        )

    def recruitment_statistics_by_rank(self, request):
        serializer = StatisticsSerializer(data=request.data)
        if not serializer.is_valid():
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                data=None,
                errors=serializer.errors,
            )

        start_date = pd.to_datetime(serializer.data.get("startDate"))
        end_date = pd.to_datetime(serializer.data.get("endDate"))

        user = request.user
        company = user.active_company
        if not company:
            return var_res.response_data(data={"labels": [], "data": []})

        queryset = (
            JobPost.objects.filter(company=company)
            .values(academicLevel=F('academic_level'))
            .filter(
                Q(jobpostactivity__create_at__isnull=True)
                | Q(
                    jobpostactivity__create_at__date__range=[
                        start_date.tz_localize(pytz.utc).date(),
                        end_date.tz_localize(pytz.utc).date(),
                    ]
                )
            )
            .annotate(countJobPostActivity=Count('jobpostactivity'))
            .order_by('academic_level')
        )

        labels = []
        data = []
        for academic_level in var_sys.ACADEMIC_LEVEL:
            stt_id = academic_level[0]
            name = academic_level[1]
            items = [x for x in queryset if x["academicLevel"] == stt_id]
            if items:
                data.append(items[0]['countJobPostActivity'])
                labels.append(name)
            else:
                data.append(0)
                labels.append(name)

        return var_res.response_data(
            data={
                "data": data,
                "labels": labels,
                "backgroundColor": [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
            }
        )


class AdminStatisticViewSet(viewsets.ViewSet):
    permission_classes = [perms_custom.IsAdminUser]

    def statistics(self, request):
        stat_type = (request.query_params.get("type") or "general").strip().lower()
        if stat_type != "general":
            return var_res.response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"type": [f"Unsupported statistics type: {stat_type}"]},
                data=None,
            )
        return self.general_statistics(request)

    def general_statistics(self, request):
        today = timezone.localdate()
        recent_start = timezone.now() - timedelta(days=30)

        users_qs = User.objects.all()
        job_posts_qs = JobPost.objects.all()
        applications_qs = JobPostActivity.objects.filter(is_deleted=False)
        interviews_qs = InterviewSession.objects.all()
        companies_qs = Company.objects.all()
        verifications_qs = CompanyVerification.objects.all()
        resumes_qs = Resume.objects.all()

        total_users = users_qs.count()
        total_employers = users_qs.filter(role_name=var_sys.EMPLOYER).count()
        total_job_seekers = users_qs.filter(role_name=var_sys.JOB_SEEKER).count()
        total_admins = users_qs.filter(role_name=var_sys.ADMIN).count()

        total_job_posts = job_posts_qs.count()
        total_job_posts_pending = job_posts_qs.filter(status=var_sys.JobPostStatus.PENDING).count()
        total_job_posts_rejected = job_posts_qs.filter(status=var_sys.JobPostStatus.REJECTED).count()
        total_job_posts_approved = job_posts_qs.filter(status=var_sys.JobPostStatus.APPROVED).count()
        total_job_posts_active = job_posts_qs.filter(
            status=var_sys.JobPostStatus.APPROVED,
            deadline__gte=today,
        ).count()
        total_job_posts_expired = job_posts_qs.filter(
            status=var_sys.JobPostStatus.APPROVED,
            deadline__lt=today,
        ).count()

        total_applications = applications_qs.count()
        total_applications_pending = applications_qs.filter(
            status=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        ).count()
        total_applications_contacted = applications_qs.filter(status=var_sys.ApplicationStatus.CONTACTED).count()
        total_applications_tested = applications_qs.filter(status=var_sys.ApplicationStatus.TESTED).count()
        total_applications_interviewed = applications_qs.filter(status=var_sys.ApplicationStatus.INTERVIEWED).count()
        total_applications_hired = applications_qs.filter(status=var_sys.ApplicationStatus.HIRED).count()
        total_applications_not_selected = applications_qs.filter(status=var_sys.ApplicationStatus.NOT_SELECTED).count()

        total_interviews = interviews_qs.count()
        total_interviews_draft = interviews_qs.filter(status="draft").count()
        total_interviews_scheduled = interviews_qs.filter(status__in=["scheduled", "calibration"]).count()
        total_interviews_in_progress = interviews_qs.filter(status__in=["in_progress", "processing"]).count()
        total_interviews_completed = interviews_qs.filter(status="completed").count()
        total_interviews_cancelled = interviews_qs.filter(status__in=["cancelled", "interrupted"]).count()

        total_companies = companies_qs.count()
        total_companies_verified = companies_qs.filter(is_verified=True).count()
        total_companies_unverified = companies_qs.filter(is_verified=False).count()
        total_company_verifications = verifications_qs.count()
        total_company_verifications_pending = verifications_qs.filter(
            status=CompanyVerification.STATUS_PENDING,
        ).count()
        total_company_verifications_reviewing = verifications_qs.filter(
            status=CompanyVerification.STATUS_REVIEWING,
        ).count()
        total_company_verifications_rejected = verifications_qs.filter(
            status=CompanyVerification.STATUS_REJECTED,
        ).count()

        total_job_seeker_profiles = JobSeekerProfile.objects.count()
        total_resumes = resumes_qs.count()
        total_active_resumes = resumes_qs.filter(is_active=True).count()
        total_saved_job_posts = SavedJobPost.objects.count()
        total_saved_resumes = ResumeSaved.objects.count()
        total_company_followers = CompanyFollowed.objects.count()
        total_resume_views = ResumeViewed.objects.aggregate(total=Sum("views")).get("total") or 0
        total_questions = Question.objects.count()
        total_question_groups = QuestionGroup.objects.count()

        new_users_30d = users_qs.filter(create_at__gte=recent_start).count()
        new_employers_30d = users_qs.filter(role_name=var_sys.EMPLOYER, create_at__gte=recent_start).count()
        new_job_seekers_30d = users_qs.filter(role_name=var_sys.JOB_SEEKER, create_at__gte=recent_start).count()
        new_job_posts_30d = job_posts_qs.filter(create_at__gte=recent_start).count()
        new_applications_30d = applications_qs.filter(create_at__gte=recent_start).count()
        new_interviews_30d = interviews_qs.filter(create_at__gte=recent_start).count()

        return var_res.response_data(
            data={
                "totalUsers": total_users,
                "totalEmployers": total_employers,
                "totalJobSeekers": total_job_seekers,
                "totalAdmins": total_admins,
                "totalJobPosts": total_job_posts,
                "totalJobPostsPending": total_job_posts_pending,
                "totalJobPostsRejected": total_job_posts_rejected,
                "totalJobPostsApproved": total_job_posts_approved,
                "totalJobPostsActive": total_job_posts_active,
                "totalJobPostsExpired": total_job_posts_expired,
                "totalApplications": total_applications,
                "totalApplicationsPending": total_applications_pending,
                "totalApplicationsContacted": total_applications_contacted,
                "totalApplicationsTested": total_applications_tested,
                "totalApplicationsInterviewed": total_applications_interviewed,
                "totalApplicationsHired": total_applications_hired,
                "totalApplicationsNotSelected": total_applications_not_selected,
                "totalInterviews": total_interviews,
                "totalInterviewsDraft": total_interviews_draft,
                "totalInterviewsScheduled": total_interviews_scheduled,
                "totalInterviewsInProgress": total_interviews_in_progress,
                "totalInterviewsCompleted": total_interviews_completed,
                "totalInterviewsCancelled": total_interviews_cancelled,
                "totalCompanies": total_companies,
                "totalCompaniesVerified": total_companies_verified,
                "totalCompaniesUnverified": total_companies_unverified,
                "totalCompanyVerifications": total_company_verifications,
                "totalCompanyVerificationsPending": total_company_verifications_pending,
                "totalCompanyVerificationsReviewing": total_company_verifications_reviewing,
                "totalCompanyVerificationsRejected": total_company_verifications_rejected,
                "totalJobSeekerProfiles": total_job_seeker_profiles,
                "totalResumes": total_resumes,
                "totalActiveResumes": total_active_resumes,
                "totalSavedJobPosts": total_saved_job_posts,
                "totalSavedResumes": total_saved_resumes,
                "totalCompanyFollowers": total_company_followers,
                "totalResumeViews": total_resume_views,
                "totalQuestions": total_questions,
                "totalQuestionGroups": total_question_groups,
                "newUsers30d": new_users_30d,
                "newEmployers30d": new_employers_30d,
                "newJobSeekers30d": new_job_seekers_30d,
                "newJobPosts30d": new_job_posts_30d,
                "newApplications30d": new_applications_30d,
                "newInterviews30d": new_interviews_30d,
            }
        )
