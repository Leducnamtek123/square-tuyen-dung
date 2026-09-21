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
                Resume.objects.select_related('file').filter(user=user, type=var_sys.CV_WEBSITE, is_active=True).first()
                or Resume.objects.select_related('file').filter(user=user, type=var_sys.CV_WEBSITE).first()
                or Resume.objects.select_related('file').filter(user=user, is_active=True).first()
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
                    "phone": (profile.phone if profile else "") or user.phone_number or "",
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
                    license_str = str(verif.business_license).strip()
                    gfile = None
                    if license_str.isdigit():
                        gfile = File.objects.filter(id=int(license_str)).first()
                    else:
                        gfile = (
                            File.objects.filter(public_id=license_str).first()
                            or File.objects.filter(public_id__icontains=license_str).first()
                        )
                        if not gfile and "/" in license_str:
                            tail = license_str.split("/")[-1]
                            if tail:
                                gfile = File.objects.filter(public_id__icontains=tail).first()

                    if gfile:
                        gpkd_file_id = gfile.id
                        gpkd_file_name = get_file_display_name(gfile) or "GPKD.pdf"
                        gpkd_file_url = gfile.get_full_url()
                    else:
                        gpkd_file_url = verif.business_license

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

    def post(self, request):
        return self.patch(request)

    @transaction.atomic
    def patch(self, request):
        user = request.user
        data = request.data
        step = data.get("step", 1)

        profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
        resume = (
            Resume.objects.filter(user=user, type=var_sys.CV_WEBSITE).first()
            or Resume.objects.filter(user=user).first()
        )
        if not resume:
            resume = Resume.objects.create(
                user=user,
                job_seeker_profile=profile,
                type=var_sys.CV_WEBSITE,
                title=data.get("desiredJobTitle") or data.get("title") or f"Hồ sơ {user.full_name}",
                is_active=True
            )
        else:
            resume.type = var_sys.CV_WEBSITE

        full_name_val = (str(data.get("fullName") or data.get("full_name") or "")).strip()
        if full_name_val:
            user.full_name = full_name_val
            user.save(update_fields=['full_name', 'update_at'])

        phone_val = (str(data.get("phone") or data.get("phone_number") or "")).strip()
        if phone_val:
            profile.phone = phone_val
            profile.save(update_fields=['phone'])
            user.phone_number = phone_val
            user.save(update_fields=['phone_number', 'update_at'])

        title_val = data.get("desiredJobTitle") or data.get("title")
        if title_val:
            resume.title = str(title_val).strip()

        career_id = data.get("careerId") or data.get("career")
        if career_id:
            try:
                resume.career = Career.objects.get(id=career_id)
            except (Career.DoesNotExist, ValueError):
                pass

        city_id = data.get("cityId") or data.get("city")
        if city_id:
            try:
                resume.city = City.objects.get(id=city_id)
            except (City.DoesNotExist, ValueError):
                pass
            if not profile.location:
                profile.location = Location.objects.create(city_id=city_id)
                profile.save(update_fields=['location'])
            elif not profile.location.city_id:
                profile.location.city_id = city_id
                profile.location.save(update_fields=['city_id'])

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
                        city_id=city_id if city_id else None
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

        type_of_workplace = data.get("typeOfWorkplace") or data.get("type_of_workplace")
        if type_of_workplace is not None:
            resume.type_of_workplace = type_of_workplace

        salary_min = data.get("salaryMin") if "salaryMin" in data else data.get("salary_min")
        if salary_min is not None:
            resume.salary_min = salary_min
        salary_max = data.get("salaryMax") if "salaryMax" in data else data.get("salary_max")
        if salary_max is not None:
            resume.salary_max = salary_max
        expected_salary = data.get("expectedSalary") if "expectedSalary" in data else data.get("expected_salary")
        if expected_salary is not None:
            resume.expected_salary = expected_salary

        # Salary min <= max validation
        if resume.salary_min and resume.salary_max and resume.salary_min > resume.salary_max:
            return Response(
                {"salaryMin": ["Lương tối thiểu không được lớn hơn lương tối đa."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        experience = data.get("experience")
        if experience is not None:
            resume.experience = experience
        academic_level = data.get("academicLevel") if "academicLevel" in data else data.get("academic_level")
        if academic_level is not None:
            resume.academic_level = academic_level

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
        elif "skillsSummary" in data or "skills_summary" in data:
            resume.skills_summary = data.get("skillsSummary") or data.get("skills_summary")

        # Handle CV File
        file_id = data.get("fileId") or data.get("file_id")
        if file_id is not None:
            if file_id:
                try:
                    cv_file = File.objects.get(id=file_id)
                    Resume.objects.filter(file=cv_file).exclude(id=resume.id).update(file=None)
                    resume.file = cv_file
                except (File.DoesNotExist, ValueError):
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

        full_name_val = (str(data.get("fullName") or data.get("full_name") or "")).strip()
        if full_name_val:
            user.full_name = full_name_val
            user.save(update_fields=['full_name', 'update_at'])

        desired_job_title = (data.get("desiredJobTitle") or data.get("title") or "").strip()
        career_id = data.get("careerId") or data.get("career")
        city_id = data.get("cityId") or data.get("city")
        type_of_workplace = data.get("typeOfWorkplace") if "typeOfWorkplace" in data else data.get("type_of_workplace", 1)
        salary_min = data.get("salaryMin") if "salaryMin" in data else data.get("salary_min", 0)
        salary_max = data.get("salaryMax") if "salaryMax" in data else data.get("salary_max", 0)
        expected_salary = data.get("expectedSalary") if "expectedSalary" in data else data.get("expected_salary")
        experience = data.get("experience") if "experience" in data else 1
        academic_level = data.get("academicLevel") if "academicLevel" in data else data.get("academic_level", 3)
        skills = data.get("skills", [])
        skills_summary = data.get("skillsSummary") or data.get("skills_summary") or ""
        file_id = data.get("fileId") or data.get("file_id")

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
        phone = data.get("phone") or data.get("phone_number")
        if phone:
            phone_clean = str(phone).strip()
            profile.phone = phone_clean
            user.phone_number = phone_clean
            user.save(update_fields=['phone_number', 'update_at'])

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
        elif city_id:
            if not profile.location:
                profile.location = Location.objects.create(city_id=city_id)
            elif not profile.location.city_id:
                profile.location.city_id = city_id
                profile.location.save(update_fields=['city_id'])

        profile.save()

        # 2. Get or create Resume (Always ensure primary online CV is CV_WEBSITE)
        resume = (
            Resume.objects.filter(user=user, type=var_sys.CV_WEBSITE).first()
            or Resume.objects.filter(user=user).first()
        )
        if not resume:
            resume = Resume(
                user=user,
                job_seeker_profile=profile,
                title=desired_job_title,
                type=var_sys.CV_WEBSITE,
                is_active=True
            )
        else:
            resume.type = var_sys.CV_WEBSITE

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
        resume.type = var_sys.CV_WEBSITE
        resume.is_active = True
        resume.save()

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
                Resume.objects.filter(file=cv_file).exclude(id=resume.id).update(file=None)
                resume.file = cv_file
            except File.DoesNotExist:
                pass

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

    def post(self, request):
        return self.patch(request)

    @transaction.atomic
    def patch(self, request):
        user = request.user
        data = request.data or {}

        def _get(camel_key, snake_key, default=None):
            if camel_key in data and data[camel_key] is not None:
                return data[camel_key]
            if snake_key in data and data[snake_key] is not None:
                return data[snake_key]
            return default

        step = _get("step", "step", 1)

        company_name = (_get("companyName", "company_name", "") or "").strip()
        tax_code = (_get("taxCode", "tax_code", "") or "").strip()
        company_phone = (_get("companyPhone", "company_phone", "") or "").strip()
        company_email = (_get("companyEmail", "company_email", "") or "").strip()
        raw_emp_size = _get("employeeSize", "employee_size")
        website_url = _get("websiteUrl", "website_url")
        field_operation = _get("fieldOperation", "field_operation")
        description = _get("description", "description")
        logo_id = _get("logoId", "logo_id", _get("logo", "logo"))
        cover_image_id = _get("coverImageId", "cover_image_id", _get("coverImage", "cover_image"))
        city_id = _get("cityId", "city_id")
        district_id = _get("districtId", "district_id")
        address = (_get("address", "address", "") or "").strip()
        gpkd_file_id = _get("gpkdFileId", "gpkd_file_id")

        recruiter_name = (_get("recruiterName", "recruiter_name", "") or "").strip()
        recruiter_phone = (_get("recruiterPhone", "recruiter_phone", "") or "").strip()

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
            # Handle Logo (Safe-unlink to prevent MySQL 1062 IntegrityError)
            if logo_id:
                try:
                    logo_file = File.objects.get(id=int(logo_id))
                    Company.objects.filter(logo=logo_file).exclude(id=company.id).update(logo=None)
                    company.logo = logo_file
                except (File.DoesNotExist, ValueError, TypeError):
                    pass

            # Handle Cover Image (Safe-unlink to prevent MySQL 1062 IntegrityError)
            if cover_image_id:
                try:
                    cover_file = File.objects.get(id=int(cover_image_id))
                    Company.objects.filter(cover_image=cover_file).exclude(id=company.id).update(cover_image=None)
                    company.cover_image = cover_file
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

        data = request.data or {}

        def _get(camel_key, snake_key, default=None):
            if camel_key in data and data[camel_key] is not None:
                return data[camel_key]
            if snake_key in data and data[snake_key] is not None:
                return data[snake_key]
            return default

        company_name = (_get("companyName", "company_name", "") or "").strip()
        tax_code = (_get("taxCode", "tax_code", "") or "").strip()
        company_phone = (_get("companyPhone", "company_phone", "") or "").strip() or user.phone_number or ""
        company_email = (_get("companyEmail", "company_email", "") or "").strip() or user.email
        raw_emp_size = _get("employeeSize", "employee_size")
        website_url = _get("websiteUrl", "website_url")
        field_operation = (_get("fieldOperation", "field_operation", "") or "").strip()
        description = _get("description", "description", "") or ""
        logo_id = _get("logoId", "logo_id", _get("logo", "logo"))
        cover_image_id = _get("coverImageId", "cover_image_id", _get("coverImage", "cover_image"))
        city_id = _get("cityId", "city_id")
        district_id = _get("districtId", "district_id")
        address = (_get("address", "address", "") or "").strip()
        gpkd_file_id = _get("gpkdFileId", "gpkd_file_id")

        recruiter_name = (_get("recruiterName", "recruiter_name", "") or "").strip()
        recruiter_phone = (_get("recruiterPhone", "recruiter_phone", "") or "").strip()

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
                logo_file = File.objects.get(id=int(logo_id))
                Company.objects.filter(logo=logo_file).exclude(id=company.id).update(logo=None)
                company.logo = logo_file
            except (File.DoesNotExist, ValueError, TypeError):
                pass

        if cover_image_id:
            try:
                cover_file = File.objects.get(id=int(cover_image_id))
                Company.objects.filter(cover_image=cover_file).exclude(id=company.id).update(cover_image=None)
                company.cover_image = cover_file
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


class CandidateCvParseView(APIView):
    """
    Parse uploaded candidate CV file and extract candidate details (AI Auto-fill).
    """
    permission_classes = [IsJobSeekerUser]

    def post(self, request):
        file_id = request.data.get("fileId")
        if not file_id:
            return Response({"message": "Vui lòng cung cấp fileId"}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = File.objects.filter(id=file_id).first()
        if not file_obj:
            return Response({"message": "Không tìm thấy tệp tin"}, status=status.HTTP_404_NOT_FOUND)

        from apps.profiles.services.pdf_extraction import parse_cv_text_content
        from shared.helpers.cloudinary_service import CloudinaryService
        from django.conf import settings
        import fitz

        client = CloudinaryService._get_client()
        bucket = getattr(settings, "MINIO_BUCKET", "square")

        text_content = ""
        try:
            resp = client.get_object(bucket, file_obj.public_id)
            file_bytes = resp.read()
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text_content = "\n".join([page.get_text() for page in doc])
        except Exception as err:
            logger.warning(f"Could not read/parse PDF for file {file_id}: {err}")

        parsed = parse_cv_text_content(text_content) if text_content else {}

        # Match skills from text
        matched_skills = []
        if text_content:
            try:
                known_skills = list(AdvancedSkill.objects.values_list('name', flat=True)[:100])
            except Exception:
                known_skills = []
            if not known_skills:
                known_skills = [
                    "React", "JavaScript", "TypeScript", "Node.js", "Python", "Java", "SQL",
                    "HTML/CSS", "Figma", "UI/UX", "Git", "Docker", "DevOps", "Marketing",
                    "Sales", "Communication", "English", "Quản lý dự án", "Kế toán", "Nhân sự"
                ]

            lower_text = text_content.lower()
            for s in known_skills:
                if s.lower() in lower_text:
                    matched_skills.append(s)
            matched_skills = matched_skills[:10]

        # Match Career
        career_id = None
        if text_content or parsed.get("title"):
            search_title = (parsed.get("title") or "").lower()
            careers = Career.objects.all()
            for c in careers:
                if c.name and (c.name.lower() in search_title or (c.name.lower() in text_content.lower())):
                    career_id = c.id
                    break

        # Match City
        city_id = None
        if parsed.get("address"):
            addr_lower = parsed["address"].lower()
            cities = City.objects.all()
            for ct in cities:
                if ct.name and ct.name.lower() in addr_lower:
                    city_id = ct.id
                    break

        return Response({
            "fullName": parsed.get("fullName") or "",
            "desiredJobTitle": parsed.get("title") or "",
            "phone": parsed.get("phone") or "",
            "email": parsed.get("email") or "",
            "address": parsed.get("address") or "",
            "gender": parsed.get("gender") or "",
            "careerId": career_id,
            "cityId": city_id,
            "skills": matched_skills,
            "fileId": file_obj.id,
            "fileName": get_file_display_name(file_obj),
            "fileUrl": file_obj.get_full_url()
        }, status=status.HTTP_200_OK)


class TaxLookupView(APIView):
    """
    Lookup company details by Tax Code (MST) and detect duplicate registrations.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tax_code = (request.query_params.get("tax_code") or "").strip()
        if not tax_code:
            return Response({"message": "Vui lòng cung cấp mã số thuế"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check if company already exists in InfoHR
        existing_company = Company.objects.filter(tax_code=tax_code).first()
        if existing_company:
            logo_url = existing_company.logo.get_full_url() if existing_company.logo else ""
            admin_email = ""
            if existing_company.user and existing_company.user.email:
                parts = existing_company.user.email.split("@")
                if len(parts) == 2:
                    name_part = parts[0]
                    masked = name_part[:2] + "***" if len(name_part) > 2 else "***"
                    admin_email = f"{masked}@{parts[1]}"

            return Response({
                "exists": True,
                "company": {
                    "id": existing_company.id,
                    "companyName": existing_company.company_name,
                    "logoUrl": logo_url,
                    "address": existing_company.location.address if existing_company.location else "",
                    "adminEmailMasked": admin_email,
                }
            }, status=status.HTTP_200_OK)

        # 2. Try looking up from VietQR open public API
        lookup_data = None
        try:
            import urllib.request
            import json
            req = urllib.request.Request(
                f"https://api.vietqr.io/v2/business/{tax_code}",
                headers={"User-Agent": "InfoHR/1.0"}
            )
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                if resp.status == 200:
                    res_json = json.loads(resp.read().decode("utf-8"))
                    if res_json.get("code") == "00" and res_json.get("data"):
                        b_data = res_json["data"]
                        lookup_data = {
                            "companyName": b_data.get("name") or b_data.get("shortName") or "",
                            "address": b_data.get("address") or "",
                            "taxCode": tax_code,
                        }
        except Exception as ex:
            logger.info(f"VietQR lookup skipped or timed out for {tax_code}: {ex}")

        return Response({
            "exists": False,
            "company": lookup_data
        }, status=status.HTTP_200_OK)


class CompanyJoinRequestView(APIView):
    """
    Submit a join request to an existing company when duplicate tax code is detected.
    """
    permission_classes = [IsEmployerUser]

    @transaction.atomic
    def post(self, request):
        user = request.user
        company_id = request.data.get("companyId")
        if not company_id:
            return Response({"message": "Thiếu mã doanh nghiệp"}, status=status.HTTP_400_BAD_REQUEST)

        company = Company.objects.filter(id=company_id).first()
        if not company:
            return Response({"message": "Không tìm thấy doanh nghiệp"}, status=status.HTTP_404_NOT_FOUND)

        # Check existing membership
        existing = CompanyMember.objects.filter(company=company, user=user).first()
        if not existing:
            CompanyMember.objects.create(
                company=company,
                user=user,
                status=CompanyMember.STATUS_INVITED,
                is_active=True
            )

        # Mark user as having requested join
        user.has_company = True
        user.is_onboarded = True
        user.onboarding_step = 4
        user.save(update_fields=['has_company', 'is_onboarded', 'onboarding_step', 'update_at'])

        serializer = UserSerializer(user, context={'request': request})
        return Response({
            "message": f"Đã gửi yêu cầu tham gia vào {company.company_name}. Vui lòng chờ quản trị viên phê duyệt.",
            "companyId": company.id,
            "companyName": company.company_name,
            "user": serializer.data
        }, status=status.HTTP_200_OK)


class SkipOnboardingView(APIView):
    """
    Allow users to skip onboarding temporarily (Progressive Onboarding).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_onboarded = True
        if user.onboarding_step == 0:
            user.onboarding_step = -1
        user.save(update_fields=['is_onboarded', 'onboarding_step', 'update_at'])

        serializer = UserSerializer(user, context={'request': request})
        return Response({
            "message": "Đã ghi nhận bỏ qua onboarding",
            "user": serializer.data
        }, status=status.HTTP_200_OK)

