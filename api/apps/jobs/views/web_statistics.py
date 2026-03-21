import calendar
import datetime
from datetime import timedelta

import pandas as pd
import pytz
from django.db.models import Count, F, Q, Sum
from django.db.models.functions import ExtractMonth, ExtractYear, TruncDate
from rest_framework import status, viewsets

from apps.accounts import permissions as perms_custom
from apps.accounts.models import User
from apps.profiles.models import CompanyFollowed, ResumeViewed
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
        total_job_post = JobPost.objects.filter(company=user.company).count()
        total_job_posting_pending_approval = JobPost.objects.filter(
            company=user.company,
            status=var_sys.JobPostStatus.PENDING,
        ).count()
        total_job_post_expired = JobPost.objects.filter(
            company=user.company,
            deadline__lt=datetime.datetime.now().date(),
        ).count()
        total_apply = JobPostActivity.objects.filter(job_post__company=user.company).count()

        return var_res.response_data(
            data={
                "totalJobPost": total_job_post,
                "totalJobPostingPendingApproval": total_job_posting_pending_approval,
                "totalJobPostExpired": total_job_post_expired,
                "totalApply": total_apply,
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
            JobPostActivity.objects.filter(job_post__company=user.company)
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
                job_post__company=user.company,
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
                job_post__company=user.company,
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

        date_range = pd.date_range(start=start_date1, end=end_date1, freq='D')
        for date in date_range:
            d1 = 0
            d2 = 0
            label = date.strftime("%d/%m")

            items1 = [x for x in queryset1 if x.get("date") == date.date()]
            if items1:
                d1 = items1[0].get("count", 0)

            items2 = [x for x in queryset2 if x.get("date") == date.date()]
            if items2:
                d1 = items2[0].get("count", 0)

            data1.append(d1)
            data2.append(d2)
            labels.append(label)

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

        job_post_data = JobPost.objects.filter(company=user.company).values_list("create_at", flat=True)
        job_post_activity_data = (
            JobPostActivity.objects.filter(job_post__company=user.company)
            .filter(
                create_at__date__range=[
                    start_date.tz_localize(pytz.utc).date(),
                    end_date.tz_localize(pytz.utc).date(),
                ]
            )
            .values_list("create_at", flat=True)
        )

        labels = []
        data1 = []
        data2 = []
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        for date in date_range:
            total_job_post = len(list(filter(lambda item: item.date() <= date.date(), job_post_data)))
            total_apply = len(list(filter(lambda item: item.date() == date.date(), job_post_activity_data)))
            label = date.strftime("%d/%m")
            data1.append(total_job_post)
            data2.append(total_apply)
            labels.append(label)

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
        company = getattr(user, 'company', None)
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
        total_users = User.objects.count()
        total_employers = User.objects.filter(role_name=var_sys.EMPLOYER).count()
        total_job_seekers = User.objects.filter(role_name=var_sys.JOB_SEEKER).count()
        total_job_posts = JobPost.objects.count()
        total_job_posts_pending = JobPost.objects.filter(status=var_sys.JobPostStatus.PENDING).count()
        total_applications = JobPostActivity.objects.count()

        return var_res.response_data(
            data={
                "totalUsers": total_users,
                "totalEmployers": total_employers,
                "totalJobSeekers": total_job_seekers,
                "totalJobPosts": total_job_posts,
                "totalJobPostsPending": total_job_posts_pending,
                "totalApplications": total_applications,
            }
        )
