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
    CompanyVerification,
    AdvancedSkill
)
from apps.files.models import File
from apps.locations.models import City, District, Location
from apps.jobs.models import JobPost
try:
    from apps.common.models import Career
except ImportError:
    from common.models import Career

logger = logging.getLogger(__name__)


def get_file_display_name(file_obj):
    if not file_obj:
        return ""
    if hasattr(file_obj, 'metadata') and file_obj.metadata and isinstance(file_obj.metadata, dict):
        return (
            file_obj.metadata.get("original_name")
            or file_obj.metadata.get("filename")
            or file_obj.metadata.get("name")
            or ""
        )
    if hasattr(file_obj, 'public_id') and file_obj.public_id:
        return file_obj.public_id.split("/")[-1]
    return ""


class GetOnboardingStatusView(APIView):
    """
    Get the onboarding status, completeness score, and pre-filled draft data for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role_name = user.role_name
        is_onboarded = user.is_onboarded
        onboarding_step = user.onboarding_step

        completeness = 0
        candidate_draft = None
        employer_draft = None
        has_existing_membership = False
        existing_company_info = None

        if role_name == var_sys.JOB_SEEKER:
            profile = getattr(user, 'job_seeker_profile', None)
            resume = (
                Resume.objects.select_related('file').filter(user=user, is_active=True).first()
                or Resume.objects.select_related('file').filter(user=user).first()
            )
            
            score = 20
            if profile and profile.phone:
                score += 20
            if resume and resume.career_id:
                score += 20
            if resume and (resume.advanced_skills.exists() or resume.skills_summary):
                score += 20
            if resume and resume.file_id:
                score += 20
            completeness = min(score, 100)

            if resume:
                file_obj = getattr(resume, 'file', None)
                skill_names = list(resume.advanced_skills.values_list('name', flat=True))
                if not skill_names and resume.skills_summary:
                    skill_names = [s.strip() for s in resume.skills_summary.split(',') if s.strip()]

                loc = getattr(profile, 'location', None) if profile else None
                candidate_draft = {
                    "desiredJobTitle": resume.title or "",
                    "careerId": resume.career_id,
                    "cityId": resume.city_id,
                    "address": loc.address if loc else (profile.contact_address if profile else ""),
                    "lat": float(loc.lat) if (loc and loc.lat is not None) else None,
                    "lng": float(loc.lng) if (loc and loc.lng is not None) else None,
                    "typeOfWorkplace": resume.type_of_workplace if resume.type_of_workplace is not None else 1,
                    "salaryMin": int(resume.salary_min) if resume.salary_min is not None else 0,
                    "salaryMax": int(resume.salary_max) if resume.salary_max is not None else 0,
                    "expectedSalary": int(resume.expected_salary) if resume.expected_salary is not None else None,
                    "isSalaryNegotiable": bool(resume.salary_min == 0 and resume.salary_max == 0) if (resume.salary_min is not None or resume.salary_max is not None) else True,
                    "experience": resume.experience,
                    "academicLevel": resume.academic_level,
                    "skills": skill_names,
                    "skillsSummary": resume.skills_summary or "",
                    "fileId": file_obj.id if file_obj else None,
                    "fileName": get_file_display_name(file_obj),
                    "fileUrl": file_obj.get_full_url() if file_obj else ""
                }

        elif role_name == var_sys.EMPLOYER:
            membership = CompanyMember.objects.select_related("company", "role", "company__location", "company__logo").filter(
                user=user, is_active=True
            ).first()
            
            if membership and membership.status == CompanyMember.STATUS_INVITED:
                has_existing_membership = True
                existing_company_info = {
                    "companyId": membership.company.id,
                    "companyName": membership.company.company_name,
                    "roleName": membership.role.name if membership.role else "HR"
                }

            company = user.get_active_company() or (membership.company if membership else None) or Company.objects.filter(user=user).first()
            if company:
                score = 30
                if company.company_name:
                    score += 20
                if company.tax_code and not company.tax_code.startswith("PENDING") and not company.tax_code.startswith("TAX_") and not company.tax_code.startswith("DRAFT_"):
                    score += 20
                if company.logo:
                    score += 15
                if company.description:
                    score += 15
                completeness = min(score, 100)

                logo_file = getattr(company, 'logo', None)
                loc = getattr(company, 'location', None)
                verif = CompanyVerification.objects.filter(company=company).first()
                gpkd_file_id = None
                gpkd_file_name = ""
                gpkd_file_url = ""
                if verif and verif.business_license:
                    gpkd_file_url = verif.business_license
                    gfile = File.objects.filter(url__icontains=verif.business_license).first() if not str(verif.business_license).isdigit() else File.objects.filter(id=int(verif.business_license)).first()
                    if gfile:
                        gpkd_file_id = gfile.id
                        gpkd_file_name = get_file_display_name(gfile) or "GPKD.pdf"

                employer_draft = {
                    "companyName": company.company_name or "",
                    "logoId": logo_file.id if logo_file else None,
                    "logoUrl": logo_file.get_full_url() if logo_file else "",
                    "taxCode": company.tax_code if (company.tax_code and not company.tax_code.startswith("PENDING") and not company.tax_code.startswith("TAX_") and not company.tax_code.startswith("DRAFT_")) else "",
                    "employeeSize": company.employee_size,
                    "fieldOperation": company.field_operation or "",
                    "cityId": loc.city_id if loc else None,
                    "districtId": loc.district_id if loc else None,
                    "address": loc.address if loc else "",
                    "websiteUrl": company.website_url or "",
                    "description": company.description or "",
                    "companyEmail": company.company_email or "",
                    "companyPhone": company.company_phone or "",
                    "recruiterName": user.full_name or "",
                    "recruiterTitle": "",
                    "recruiterPhone": user.phone_number or "",
                    "recruiterEmail": user.email,
                    "gpkdFileId": gpkd_file_id,
                    "gpkdFileName": gpkd_file_name,
                    "gpkdFileUrl": gpkd_file_url,
                }

        return Response({
            "isOnboarded": is_onboarded,
            "onboardingStep": onboarding_step,
            "roleName": role_name,
            "hasCompany": user.has_company,
            "profileCompleteness": completeness,
            "candidateDraft": candidate_draft,
            "employerDraft": employer_draft,
            "hasExistingMembership": has_existing_membership,
            "existingCompany": existing_company_info
        }, status=status.HTTP_200_OK)


class CandidateStepSaveView(APIView):
    """
    Save candidate onboarding step data (Draft persistence).
    """
    permission_classes = [IsJobSeekerUser]

    @transaction.atomic
    def patch(self, request):
        user = request.user
        data = request.data
        step = data.get("step", 1)

        profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
        resume = Resume.objects.filter(user=user).first()
        if not resume:
            resume = Resume.objects.create(
                user=user,
                job_seeker_profile=profile,
                title=data.get("desiredJobTitle") or f"Hồ sơ {user.full_name}",
                is_active=True
            )

        if "desiredJobTitle" in data:
            resume.title = data.get("desiredJobTitle") or resume.title
        if "careerId" in data:
            career_id = data.get("careerId")
            if career_id:
                try:
                    resume.career = Career.objects.get(id=career_id)
                except Career.DoesNotExist:
                    pass
        if "cityId" in data:
            city_id = data.get("cityId")
            if city_id:
                try:
                    resume.city = City.objects.get(id=city_id)
                except City.DoesNotExist:
                    pass

        # Handle candidate precise location & address
        if "address" in data or "lat" in data or "lng" in data:
            profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
            address_val = data.get("address")
            lat_val = data.get("lat")
            lng_val = data.get("lng")
            if address_val or lat_val is not None or lng_val is not None:
                if not profile.location:
                    profile.location = Location.objects.create(
                        address=address_val or "",
                        lat=lat_val if lat_val is not None else None,
                        lng=lng_val if lng_val is not None else None,
                        city_id=city_id if "cityId" in data else None
                    )
                else:
                    if address_val is not None:
                        profile.location.address = address_val
                    if lat_val is not None:
                        profile.location.lat = lat_val
                    if lng_val is not None:
                        profile.location.lng = lng_val
                    if "cityId" in data and data.get("cityId"):
                        profile.location.city_id = data.get("cityId")
                    profile.location.save()
                if address_val:
                    profile.contact_address = address_val
                profile.save()

        if "typeOfWorkplace" in data:
            resume.type_of_workplace = data.get("typeOfWorkplace")

        if "salaryMin" in data:
            resume.salary_min = data.get("salaryMin", 0)
        if "salaryMax" in data:
            resume.salary_max = data.get("salaryMax", 0)
        if "expectedSalary" in data:
            resume.expected_salary = data.get("expectedSalary")

        # Salary min <= max validation
        if resume.salary_min and resume.salary_max and resume.salary_min > resume.salary_max:
            return Response(
                {"salaryMin": ["Lương tối thiểu không được lớn hơn lương tối đa."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        if "experience" in data:
            resume.experience = data.get("experience")
        if "academicLevel" in data:
            resume.academic_level = data.get("academicLevel")

        # Handle skills
        skills = data.get("skills")
        if skills is not None and isinstance(skills, list):
            resume.skills_summary = ", ".join([str(s).strip() for s in skills if str(s).strip()])
            # Sync AdvancedSkill models
            resume.advanced_skills.all().delete()
            for skill_name in skills:
                name_clean = str(skill_name).strip()
                if name_clean:
                    AdvancedSkill.objects.create(
                        resume=resume,
                        name=name_clean,
                        level=3
                    )
        elif "skillsSummary" in data:
            resume.skills_summary = data.get("skillsSummary")

        # Handle CV File
        if "fileId" in data:
            file_id = data.get("fileId")
            if file_id:
                try:
                    cv_file = File.objects.get(id=file_id)
                    resume.file = cv_file
                    resume.type = var_sys.CV_UPLOAD
                except File.DoesNotExist:
                    pass
            else:
                resume.file = None
                resume.type = var_sys.CV_WEBSITE

        resume.save()

        # Update onboarding step
        user.onboarding_step = max(user.onboarding_step, int(step))
        user.save(update_fields=['onboarding_step', 'update_at'])

        return Response({
            "message": "Draft saved successfully",
            "onboardingStep": user.onboarding_step
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

        desired_job_title = (data.get("desiredJobTitle") or "").strip()
        career_id = data.get("careerId")
        city_id = data.get("cityId")
        type_of_workplace = data.get("typeOfWorkplace", 1)
        salary_min = data.get("salaryMin", 0)
        salary_max = data.get("salaryMax", 0)
        expected_salary = data.get("expectedSalary")
        experience = data.get("experience", 1)
        academic_level = data.get("academicLevel", 3)
        skills = data.get("skills", [])
        skills_summary = data.get("skillsSummary", "")
        file_id = data.get("fileId")

        # Validation
        errors = {}
        if not desired_job_title:
            errors["desiredJobTitle"] = ["Vui lòng nhập vị trí công việc mong muốn."]
        if not career_id:
            errors["careerId"] = ["Vui lòng chọn ngành nghề chính."]
        if not city_id:
            errors["cityId"] = ["Vui lòng chọn địa điểm làm việc mong muốn."]
        if salary_min and salary_max and int(salary_min) > int(salary_max):
            errors["salaryMin"] = ["Lương tối thiểu không được lớn hơn lương tối đa."]

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # 1. Get or create JobSeekerProfile
        profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
        phone = data.get("phone")
        if phone:
            profile.phone = phone

        address_val = data.get("address")
        lat_val = data.get("lat")
        lng_val = data.get("lng")
        if address_val or lat_val is not None or lng_val is not None:
            if not profile.location:
                profile.location = Location.objects.create(
                    address=address_val or "",
                    lat=lat_val if lat_val is not None else None,
                    lng=lng_val if lng_val is not None else None,
                    city_id=city_id
                )
            else:
                if address_val is not None:
                    profile.location.address = address_val
                if lat_val is not None:
                    profile.location.lat = lat_val
                if lng_val is not None:
                    profile.location.lng = lng_val
                if city_id:
                    profile.location.city_id = city_id
                profile.location.save()
            if address_val:
                profile.contact_address = address_val

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
                return Response({"careerId": ["Ngành nghề không hợp lệ."]}, status=status.HTTP_400_BAD_REQUEST)
        if city_id:
            try:
                resume.city = City.objects.get(id=city_id)
            except City.DoesNotExist:
                return Response({"cityId": ["Địa điểm không hợp lệ."]}, status=status.HTTP_400_BAD_REQUEST)

        resume.type_of_workplace = type_of_workplace
        resume.salary_min = salary_min or 0
        resume.salary_max = salary_max or 0
        if expected_salary is not None:
            resume.expected_salary = expected_salary
        resume.experience = experience
        resume.academic_level = academic_level

        if isinstance(skills, list) and skills:
            resume.skills_summary = ", ".join([str(s).strip() for s in skills if str(s).strip()])
            resume.advanced_skills.all().delete()
            for skill_name in skills:
                name_clean = str(skill_name).strip()
                if name_clean:
                    AdvancedSkill.objects.create(
                        resume=resume,
                        name=name_clean,
                        level=3
                    )
        elif skills_summary:
            resume.skills_summary = skills_summary

        if file_id:
            try:
                cv_file = File.objects.get(id=file_id)
                resume.file = cv_file
                resume.type = var_sys.CV_UPLOAD
            except File.DoesNotExist:
                resume.type = var_sys.CV_WEBSITE
        else:
            resume.type = var_sys.CV_WEBSITE

        resume.is_active = True
        resume.save()

        # 3. Update User Onboarding status
        user.is_onboarded = True
        user.onboarding_step = 4
        user.save(update_fields=['is_onboarded', 'onboarding_step', 'update_at'])

        # 4. Fetch 3 recommended jobs for First Value UI
        recommended_jobs = []
        try:
            jobs_qs = JobPost.objects.filter(
                status=var_sys.JobPostStatus.APPROVED,
                is_active=True,
            ).select_related('company', 'company__logo', 'location__city')
            
            # Filter by career or city
            filtered = jobs_qs.filter(career_id=career_id)
            if filtered.exists():
                jobs_qs = filtered
            if city_id:
                filtered_city = jobs_qs.filter(location__city_id=city_id)
                if filtered_city.exists():
                    jobs_qs = filtered_city

            for j in jobs_qs.order_by('-is_hot', '-create_at')[:3]:
                c = j.company
                logo_url = c.logo.get_full_url() if c and c.logo else ""
                city_name = j.location.city.name if j.location and j.location.city else "Toàn quốc"
                recommended_jobs.append({
                    "id": j.id,
                    "jobName": j.job_name,
                    "companyName": c.company_name if c else "Doanh nghiệp",
                    "companyLogo": logo_url,
                    "cityName": city_name,
                    "salaryMin": int(j.salary_min) if j.salary_min else 0,
                    "salaryMax": int(j.salary_max) if j.salary_max else 0,
                    "slug": getattr(j, 'slug', str(j.id)),
                })
        except Exception as ex:
            logger.warning(f"Error fetching recommended jobs: {ex}")

        serializer = UserSerializer(user, context={'request': request})
        return Response({
            "message": "Candidate onboarding completed successfully",
            "user": serializer.data,
            "recommendedJobs": recommended_jobs
        }, status=status.HTTP_200_OK)


class EmployerStepSaveView(APIView):
    """
    Save employer onboarding step data (Draft persistence).
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def patch(self, request):
        user = request.user
        data = request.data
        step = data.get("step", 1)

        company_name = (data.get("companyName") or "").strip()
        tax_code = (data.get("taxCode") or "").strip()
        company_phone = (data.get("companyPhone") or "").strip()
        company_email = (data.get("companyEmail") or "").strip()
        raw_emp_size = data.get("employeeSize")
        website_url = data.get("websiteUrl")
        field_operation = data.get("fieldOperation")
        description = data.get("description")
        logo_id = data.get("logoId")
        city_id = data.get("cityId")
        district_id = data.get("districtId")
        address = (data.get("address") or "").strip()
        gpkd_file_id = data.get("gpkdFileId")

        recruiter_name = (data.get("recruiterName") or "").strip()
        recruiter_phone = (data.get("recruiterPhone") or "").strip()

        if recruiter_name:
            user.full_name = recruiter_name
        if recruiter_phone:
            if not User.objects.filter(phone_number=recruiter_phone).exclude(id=user.id).exists():
                user.phone_number = recruiter_phone
        user.save()

        # Find or create Company
        company = user.get_active_company() or Company.objects.filter(user=user).first()
        if not company and company_name:
            company = Company.objects.create(
                user=user,
                company_name=company_name,
                company_email=company_email or user.email,
                company_phone=company_phone or user.phone_number or "0900000000",
                tax_code=tax_code or f"PENDING_{user.id}",
                employee_size=int(raw_emp_size) if raw_emp_size in [1, 2, 3, 4] else 2,
                field_operation=field_operation or "",
                description=description or ""
            )
        elif company:
            if company_name:
                company.company_name = company_name
            if raw_emp_size in [1, 2, 3, 4]:
                company.employee_size = int(raw_emp_size)
            if field_operation:
                company.field_operation = field_operation
            if description is not None:
                company.description = description
            if website_url is not None:
                company.website_url = website_url
            if company_email and not Company.objects.filter(company_email=company_email).exclude(id=company.id).exists():
                company.company_email = company_email
            if company_phone and not Company.objects.filter(company_phone=company_phone).exclude(id=company.id).exists():
                company.company_phone = company_phone
            if tax_code and not Company.objects.filter(tax_code=tax_code).exclude(id=company.id).exists():
                company.tax_code = tax_code

        if company:
            # Handle Logo
            if logo_id:
                try:
                    company.logo = File.objects.get(id=int(logo_id))
                except (File.DoesNotExist, ValueError, TypeError):
                    pass

            # Handle Location
            if city_id:
                try:
                    city = City.objects.get(id=int(city_id))
                    district = District.objects.filter(id=int(district_id), city=city).first() if district_id else None
                    if not company.location:
                        loc = Location.objects.create(city=city, district=district, address=address or city.name)
                        company.location = loc
                    else:
                        company.location.city = city
                        company.location.district = district
                        if address:
                            company.location.address = address
                        company.location.save()
                except Exception as ex:
                    logger.warning(f"Error saving company location draft: {ex}")

            company.save()

            # Handle GPKD
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
                    logger.warning(f"Error saving GPKD draft: {ex}")

        # Update step
        user.onboarding_step = max(user.onboarding_step, int(step))
        user.save(update_fields=['onboarding_step', 'update_at'])

        return Response({
            "message": "Employer draft saved successfully",
            "onboardingStep": user.onboarding_step
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
        company_name = (data.get("companyName") or "").strip()
        tax_code = (data.get("taxCode") or "").strip()
        company_phone = (data.get("companyPhone") or "").strip() or user.phone_number or ""
        company_email = (data.get("companyEmail") or "").strip() or user.email
        raw_emp_size = data.get("employeeSize")
        website_url = data.get("websiteUrl")
        field_operation = (data.get("fieldOperation") or "").strip()
        description = data.get("description") or ""
        logo_id = data.get("logoId")
        city_id = data.get("cityId")
        district_id = data.get("districtId")
        address = (data.get("address") or "").strip()
        gpkd_file_id = data.get("gpkdFileId")

        recruiter_name = (data.get("recruiterName") or "").strip()
        recruiter_phone = (data.get("recruiterPhone") or "").strip()

        # Check existing membership (Invited Recruiter)
        membership = CompanyMember.objects.filter(user=user, is_active=True).first()
        if membership and membership.status == CompanyMember.STATUS_INVITED:
            membership.status = CompanyMember.STATUS_ACTIVE
            membership.joined_at = timezone.now()
            membership.save()
            
            if recruiter_name:
                user.full_name = recruiter_name
            if recruiter_phone and not User.objects.filter(phone_number=recruiter_phone).exclude(id=user.id).exists():
                user.phone_number = recruiter_phone
            user.is_onboarded = True
            user.onboarding_step = 4
            user.has_company = True
            user.save()

            serializer = UserSerializer(user, context={'request': request})
            return Response({
                "message": "Accepted company invitation and completed onboarding",
                "company": {
                    "id": membership.company.id,
                    "name": membership.company.company_name
                },
                "user": serializer.data
            }, status=status.HTTP_200_OK)

        # Validation for new company creation
        errors = {}
        if not company_name:
            errors["companyName"] = ["Vui lòng nhập tên công ty / doanh nghiệp."]
        if not recruiter_name:
            errors["recruiterName"] = ["Vui lòng nhập họ tên người phụ trách tuyển dụng."]

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        if recruiter_name:
            user.full_name = recruiter_name
        if recruiter_phone:
            if not User.objects.filter(phone_number=recruiter_phone).exclude(id=user.id).exists():
                user.phone_number = recruiter_phone
        user.save()

        # Parse employee_size
        employee_size = 2
        if raw_emp_size is not None:
            try:
                parsed_sz = int(raw_emp_size)
                if parsed_sz in [1, 2, 3, 4]:
                    employee_size = parsed_sz
            except (ValueError, TypeError):
                pass

        # Get or create Company
        company = user.get_active_company() or Company.objects.filter(user=user).first()
        if not company and company_name:
            company = Company.objects.filter(company_name=company_name).first()

        clean_tax = (tax_code or "").strip()
        clean_email = (company_email or user.email or "").strip()
        clean_phone = (company_phone or user.phone_number or "").strip()

        if not company:
            # Duplicate validation
            if clean_tax and Company.objects.filter(tax_code=clean_tax).exists():
                return Response(
                    {"errors": {"taxCode": ["Mã số thuế này đã được đăng ký bởi doanh nghiệp khác."]}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if clean_email and Company.objects.filter(company_email=clean_email).exists():
                return Response(
                    {"errors": {"companyEmail": ["Email này đã được sử dụng bởi doanh nghiệp khác."]}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if clean_phone and Company.objects.filter(company_phone=clean_phone).exists():
                return Response(
                    {"errors": {"companyPhone": ["Số điện thoại này đã được sử dụng bởi doanh nghiệp khác."]}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            final_tax = clean_tax or f"PENDING_{user.id}"
            final_email = clean_email or user.email
            final_phone = clean_phone or user.phone_number or ""

            company = Company.objects.create(
                user=user,
                company_name=company_name or f"Doanh nghiệp {user.full_name or user.id}",
                company_email=final_email,
                company_phone=final_phone,
                tax_code=final_tax,
                employee_size=employee_size,
                field_operation=field_operation or "",
                description=description or ""
            )
        else:
            if company_name:
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

        # Link Location
        if city_id:
            try:
                city = City.objects.get(id=int(city_id))
                district = District.objects.filter(id=int(district_id), city=city).first() if district_id else None
                if not company.location:
                    loc = Location.objects.create(city=city, district=district, address=address or city.name)
                    company.location = loc
                else:
                    company.location.city = city
                    company.location.district = district
                    if address:
                        company.location.address = address
                    company.location.save()
            except Exception as ex:
                logger.warning(f"Error updating company location: {ex}")

        company.user = user
        company.save()

        # Ensure CompanyMember with Owner role exists
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

        # Handle optional GPKD
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
                logger.error(f"Error saving company verification: {str(ex)}")

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
