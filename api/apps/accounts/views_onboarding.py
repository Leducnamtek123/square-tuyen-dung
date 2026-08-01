import logging
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from shared.configs import variable_system as var_sys
from shared.helpers import helper

from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.accounts.permissions import IsJobSeekerUser, IsEmployerUser
from apps.profiles.models import (
    JobSeekerProfile,
    Resume,
    Company,
    CompanyMember,
    CompanyVerification
)
from apps.files.models import File
from apps.locations.models import City, Location
from common.models import Career

logger = logging.getLogger(__name__)


class GetOnboardingStatusView(APIView):
    """
    Get the onboarding status and completeness score of the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role_name = user.role_name
        is_onboarded = user.is_onboarded
        onboarding_step = user.onboarding_step

        completeness = 0
        if role_name == var_sys.JOB_SEEKER:
            profile = getattr(user, 'job_seeker_profile', None)
            resumes_count = Resume.objects.filter(user=user, is_active=True).count()
            score = 20
            if profile and profile.phone:
                score += 20
            if resumes_count > 0:
                score += 60
            completeness = min(score, 100)
        elif role_name == var_sys.EMPLOYER:
            company = user.get_active_company()
            if company:
                score = 30
                if company.company_name:
                    score += 20
                if company.tax_code:
                    score += 20
                if company.logo:
                    score += 15
                if company.description:
                    score += 15
                completeness = min(score, 100)

        return Response({
            "isOnboarded": is_onboarded,
            "onboardingStep": onboarding_step,
            "roleName": role_name,
            "hasCompany": user.has_company,
            "profileCompleteness": completeness
        }, status=status.HTTP_200_OK)


class CandidateOnboardingView(APIView):
    """
    Complete candidate onboarding wizard (Preferences, Experience, Skills, Initial Resume).
    """
    permission_classes = [IsJobSeekerUser]

    @transaction.atomic
    def post(self, request):
        user = request.user
        data = request.data

        desired_job_title = data.get("desiredJobTitle") or f"Hồ sơ {user.full_name}"
        career_id = data.get("careerId")
        city_id = data.get("cityId")
        salary_min = data.get("salaryMin", 0)
        salary_max = data.get("salaryMax", 0)
        expected_salary = data.get("expectedSalary")
        experience = data.get("experience")
        academic_level = data.get("academicLevel")
        skills_summary = data.get("skillsSummary", "")
        file_id = data.get("fileId")

        # 1. Get or create JobSeekerProfile
        profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
        phone = data.get("phone")
        if phone:
            profile.phone = phone
            profile.save()

        # 2. Get or create Resume
        resume = Resume.objects.filter(user=user).first()
        if not resume:
            resume = Resume(
                user=user,
                job_seeker_profile=profile,
                title=desired_job_title,
                is_active=True
            )

        resume.title = desired_job_title
        if career_id:
            try:
                resume.career = Career.objects.get(id=career_id)
            except Career.DoesNotExist:
                pass
        if city_id:
            try:
                resume.city = City.objects.get(id=city_id)
            except City.DoesNotExist:
                pass

        if salary_min is not None:
            resume.salary_min = salary_min
        if salary_max is not None:
            resume.salary_max = salary_max
        if expected_salary is not None:
            resume.expected_salary = expected_salary
        if experience is not None:
            resume.experience = experience
        if academic_level is not None:
            resume.academic_level = academic_level
        if skills_summary:
            resume.skills_summary = skills_summary
        if file_id:
            try:
                resume.file = File.objects.get(id=file_id)
                resume.type = var_sys.CV_UPLOAD
            except File.DoesNotExist:
                resume.type = var_sys.CV_WEBSITE
        else:
            resume.type = var_sys.CV_WEBSITE

        resume.is_active = True
        resume.save()

        # Fix any legacy resumes belonging to this user with no file to be CV_WEBSITE
        Resume.objects.filter(user=user, file__isnull=True, type=var_sys.CV_UPLOAD).update(type=var_sys.CV_WEBSITE)

        # 3. Update User Onboarding status
        user.is_onboarded = True
        user.onboarding_step = 4
        user.save(update_fields=['is_onboarded', 'onboarding_step', 'update_at'])

        serializer = UserSerializer(user, context={'request': request})
        return Response({
            "message": "Candidate onboarding completed successfully",
            "user": serializer.data
        }, status=status.HTTP_200_OK)


class EmployerOnboardingView(APIView):
    """
    Complete employer onboarding wizard (Company details, Recruiter info, Optional GPKD verification).
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user

        # Ensure user role is Employer
        if user.role_name != var_sys.EMPLOYER:
            user.role_name = var_sys.EMPLOYER
            user.save(update_fields=['role_name', 'update_at'])

        data = request.data
        company_name = (data.get("companyName") or "").strip() or f"Công ty {user.full_name or 'Square'}"
        tax_code = (data.get("taxCode") or "").strip()
        company_phone = (data.get("companyPhone") or "").strip() or user.phone_number or "0900000000"
        company_email = (data.get("companyEmail") or "").strip() or user.email
        raw_emp_size = data.get("employeeSize")
        website_url = data.get("websiteUrl")
        field_operation = data.get("fieldOperation") or "Xây dựng & Kiến trúc"
        description = data.get("description") or ""
        logo_id = data.get("logoId")
        cover_image_id = data.get("coverImageId")
        gpkd_file_id = data.get("gpkdFileId")

        recruiter_name = (data.get("recruiterName") or "").strip()
        recruiter_phone = (data.get("recruiterPhone") or "").strip()

        if recruiter_name:
            user.full_name = recruiter_name
        if recruiter_phone:
            # Prevent IntegrityError if phone_number is already used by another user
            if not User.objects.filter(phone_number=recruiter_phone).exclude(id=user.id).exists():
                user.phone_number = recruiter_phone
        user.save()

        # Parse employee_size safely to valid SmallInteger choice (1..4)
        employee_size = 2
        if raw_emp_size is not None:
            try:
                parsed_sz = int(raw_emp_size)
                if parsed_sz in [1, 2, 3, 4]:
                    employee_size = parsed_sz
            except (ValueError, TypeError):
                pass

        # Get or create Company
        company = user.get_active_company()
        if not company:
            company = Company.objects.filter(user=user).first()
        if not company and company_name:
            company = Company.objects.filter(company_name=company_name).first()

        # Build unique defaults for tax_code, email, phone if creating or updating
        time_tag = int(timezone.now().timestamp())
        fallback_tax = tax_code or f"TAX{user.id}{time_tag}"
        fallback_email = company_email or f"company_{user.id}_{time_tag}@infohr.vn"
        fallback_phone = company_phone or f"09{user.id:08d}"[:15]

        if not company:
            if Company.objects.filter(tax_code=fallback_tax).exists():
                fallback_tax = f"{fallback_tax}_{user.id}"[:30]
            if Company.objects.filter(company_email=fallback_email).exists():
                fallback_email = f"c_{user.id}_{time_tag}@infohr.vn"[:100]
            if Company.objects.filter(company_phone=fallback_phone).exists():
                fallback_phone = f"09{user.id}{time_tag % 10000000}"[:15]

            company = Company.objects.create(
                user=user,
                company_name=company_name,
                company_email=fallback_email,
                company_phone=fallback_phone,
                tax_code=fallback_tax,
                employee_size=employee_size,
                field_operation=field_operation,
                description=description
            )
        else:
            company.company_name = company_name
            company.employee_size = employee_size
            if field_operation:
                company.field_operation = field_operation
            if description:
                company.description = description

            if tax_code and not Company.objects.filter(tax_code=tax_code).exclude(id=company.id).exists():
                company.tax_code = tax_code
            if company_email and not Company.objects.filter(company_email=company_email).exclude(id=company.id).exists():
                company.company_email = company_email
            if company_phone and not Company.objects.filter(company_phone=company_phone).exclude(id=company.id).exists():
                company.company_phone = company_phone

        if website_url:
            company.website_url = website_url

        if logo_id:
            try:
                company.logo = File.objects.get(id=int(logo_id))
            except (File.DoesNotExist, ValueError, TypeError):
                pass

        if cover_image_id:
            try:
                company.cover_image = File.objects.get(id=int(cover_image_id))
            except (File.DoesNotExist, ValueError, TypeError):
                pass

        company.user = user
        company.save()

        # Ensure CompanyMember exists
        try:
            from apps.profiles.services import ensure_company_system_roles
            roles = ensure_company_system_roles(company)
            owner_role = roles.get('owner') if roles else None
            if not owner_role:
                from apps.profiles.models import CompanyRole
                owner_role = CompanyRole.objects.filter(company=company).first()

            CompanyMember.objects.get_or_create(
                user=user,
                company=company,
                defaults={
                    "status": CompanyMember.STATUS_ACTIVE,
                    "is_active": True,
                    "role": owner_role
                }
            )
        except Exception as ex:
            logger.error(f"Error creating CompanyMember for company {company.id}: {str(ex)}")

        user.has_company = True

        # Handle optional GPKD (Company Verification)
        if gpkd_file_id:
            try:
                gpkd_file = File.objects.filter(id=int(gpkd_file_id)).first()
                gpkd_url = gpkd_file.get_full_url() if gpkd_file else str(gpkd_file_id)
                verification, _ = CompanyVerification.objects.get_or_create(company=company)
                verification.submitted_by = user
                verification.business_license = gpkd_url
                verification.legal_company_name = company.company_name
                verification.tax_code = company.tax_code
                verification.status = CompanyVerification.STATUS_PENDING
                verification.save()
            except Exception as ex:
                logger.error(f"Error saving company verification for company {company.id}: {str(ex)}")

        # Complete Onboarding
        user.is_onboarded = True
        user.onboarding_step = 4
        user.save()

        serializer = UserSerializer(user, context={'request': request})
        return Response({
            "message": "Employer onboarding completed successfully",
            "company": {
                "id": company.id,
                "name": company.company_name,
                "taxCode": company.tax_code
            },
            "user": serializer.data
        }, status=status.HTTP_200_OK)
