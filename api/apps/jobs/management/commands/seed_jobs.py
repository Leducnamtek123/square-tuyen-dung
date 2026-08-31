from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.jobs.models import JobPost
from apps.locations.models import City, Location
from apps.profiles.models import Company
from apps.common.models import Career
from shared.configs import variable_system as var_sys


SQUARE_PROJECT_JOBS = [
    {
        "name": "Chuyên viên Thu mua Dự án (Procurement Specialist)",
        "qty": 1,
        "career_name": "Xây dựng",
        "city_keyword": "Hồ Chí Minh",
        "description": "<p>Phụ trách thu mua vật tư, thiết bị, vật liệu phục vụ cho các dự án xây dựng & nội thất công trình.</p>",
        "requirement": "<p>- Tốt nghiệp ĐH/CĐ chuyên ngành Kinh tế, Xây dựng, Thương mại.<br>- Có kinh nghiệm từ 1-3 năm thu mua vật tư công trình.<br>- Kỹ năng đàm phán giá và làm việc với nhà cung cấp tốt.</p>",
        "benefits": "<p>- Lương cạnh tranh: 12 - 18 triệu.<br>- Thưởng dự án + BHXH đầy đủ.<br>- Cơ hội thăng tiến rõ ràng.</p>",
        "salary_min": 12000000,
        "salary_max": 18000000,
        "position": 5,  # Staff
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Kỹ sư Giám sát công trình (GS XD - Site Supervisor)",
        "qty": 2,  # Target 1.5 ratio (Tuyển 2 nhận việc -> Giữ 1 sau 6 tháng)
        "career_name": "Xây dựng",
        "city_keyword": "Hà Nội",
        "description": "<p>Quản lý và giám sát thi công phần thô, kết cấu xây dựng tại site công trình theo phân công.</p>",
        "requirement": "<p>- Tốt nghiệp Kỹ sư Xây dựng dân dụng & công nghiệp.<br>- 2-5 năm kinh nghiệm giám sát site công trình.<br>- Đọc hiểu bản vẽ kỹ thuật, kiểm soát tiến độ và an toàn thi công.</p>",
        "benefits": "<p>- Lương 15 - 22 triệu + Thưởng dự án.<br>- Phụ cấp công tác phí tại site.<br>- Bảo hiểm sức khỏe cao cấp.</p>",
        "salary_min": 15000000,
        "salary_max": 22000000,
        "position": 3,  # Supervisor
        "is_hot": True,
        "is_urgent": True,
    },
    {
        "name": "Giám sát Nội thất (GS ID - Interior Site Supervisor)",
        "qty": 3,  # Target 1.5 ratio (Tuyển 3 nhận việc -> Giữ 2 sau 6 tháng)
        "career_name": "Thiết kế / Kiến trúc",
        "city_keyword": "Hồ Chí Minh",
        "description": "<p>Quản lý và giám sát trực tiếp công tác thi công hoàn thiện nội thất (ID) tại site công trình.</p>",
        "requirement": "<p>- Tốt nghiệp chuyên ngành Kiến trúc, Nội thất, Xây dựng.<br>- Có từ 2 năm kinh nghiệm giám sát hoàn thiện nội thất dự án cao cấp, văn phòng, biệt thự.<br>- Tỉ mỉ, kiểm soát chất lượng thẩm mỹ và chi tiết thi công.</p>",
        "benefits": "<p>- Lương 15 - 25 triệu + Phụ cấp dự án.<br>- Thưởng hiệu quả công trình.<br>- BHXH + Du lịch hàng năm.</p>",
        "salary_min": 15000000,
        "salary_max": 25000000,
        "position": 3,  # Supervisor
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Giám sát Cơ điện (GS MEP - MEP Site Supervisor)",
        "qty": 2,  # Target 1.5 ratio (Tuyển 2 nhận việc -> Giữ 1 sau 6 tháng)
        "career_name": "Điện / Điện tử",
        "city_keyword": "Hà Nội",
        "description": "<p>Giám sát thi công hệ thống Cơ Điện (MEP: Điện, Nước, HVAC, PCCC) tại site công trình.</p>",
        "requirement": "<p>- Tốt nghiệp Kỹ sư Điện, Cơ điện, Nhiệt lạnh.<br>- Trên 2 năm kinh nghiệm giám sát MEP công trình.<br>- Am hiểu tiêu chuẩn kỹ thuật PCCC và hệ thống điện nhẹ/điện động lực.</p>",
        "benefits": "<p>- Lương 15 - 22 triệu + Thưởng công trình.<br>- Phụ cấp xăng xe, điện thoại, ăn trưa site.<br>- Đầy đủ chế độ phúc lợi.</p>",
        "salary_min": 15000000,
        "salary_max": 22000000,
        "position": 3,  # Supervisor
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Kỹ sư QA/QC Công trình (Quality Assurance / Quality Control)",
        "qty": 3,  # Target 1.5 ratio (Tuyển 3 nhận việc -> Giữ 2 sau 6 tháng)
        "career_name": "Xây dựng",
        "city_keyword": "Hồ Chí Minh",
        "description": "<p>Kiểm soát chất lượng thi công, vật liệu đầu vào, lập hồ sơ nghiệm thu và quy trình QA/QC tại dự án.</p>",
        "requirement": "<p>- Tốt nghiệp Kỹ sư Xây dựng/Cơ điện.<br>- 2-4 năm kinh nghiệm làm QA/QC tại các nhà thầu/chủ đầu tư lớn.<br>- Nắm vững tiêu chuẩn xây dựng Việt Nam và hồ sơ pháp lý công trình.</p>",
        "benefits": "<p>- Lương 16 - 24 triệu.<br>- Thưởng theo tiến độ dự án.<br>- Chế độ bảo hiểm và đào tạo nâng cao.</p>",
        "salary_min": 16000000,
        "salary_max": 24000000,
        "position": 4,  # Specialist
        "is_hot": True,
        "is_urgent": True,
    },
    {
        "name": "Chỉ huy trưởng Công trình (Site Manager / CHT)",
        "qty": 2,
        "career_name": "Xây dựng",
        "city_keyword": "Hà Nội",
        "description": "<p>Quản lý điều hành toàn bộ hoạt động thi công, tiến độ, chất lượng và an toàn tại site dự án.</p>",
        "requirement": "<p>- Tốt nghiệp Đại học chuyên ngành Xây dựng Dân dụng.<br>- Có chứng chỉ Chỉ huy trưởng công trình hạng I/II.<br>- Tối thiểu 5 năm kinh nghiệm quản lý thi công công trình lớn.</p>",
        "benefits": "<p>- Lương 25 - 40 triệu + Thưởng hoàn thành dự án lớn.<br>- Phụ cấp trách nhiệm & công tác phí.<br>- Chế độ đãi ngộ cấp quản lý.</p>",
        "salary_min": 25000000,
        "salary_max": 40000000,
        "position": 2,  # Middle Management
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Project Manager (PM - Quản lý Dự án Công trình)",
        "qty": 1,
        "career_name": "Xây dựng",
        "city_keyword": "Hồ Chí Minh",
        "description": "<p>Quản lý tổng thể dự án công trình, phối hợp nội bộ các phòng ban và làm việc trực tiếp với Chủ đầu tư / Khách hàng.</p>",
        "requirement": "<p>- Tốt nghiệp Đại học Xây dựng/Kiến trúc/Quản lý dự án.<br>- Trên 5 năm kinh nghiệm quản lý dự án thi công nội thất & xây dựng.<br>- Kỹ năng giao tiếp, đàm phán, giải quyết vấn đề và ngoại ngữ tốt.</p>",
        "benefits": "<p>- Lương 35 - 50 triệu + Thưởng hiệu quả dự án.<br>- Xe đưa đón + Chế độ bảo hiểm cao cấp.<br>- Thưởng năm theo doanh số dự án.</p>",
        "salary_min": 35000000,
        "salary_max": 50000000,
        "position": 1,  # Senior Management
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Kỹ sư QS (Quantity Surveyor - Bóc tách khối lượng & Chi phí)",
        "qty": 1,
        "career_name": "Xây dựng",
        "city_keyword": "Hà Nội",
        "description": "<p>Bóc tách khối lượng bản vẽ, kiểm soát chi phí dự án, lập và kiểm tra hồ sơ thanh quyết toán nhà thầu.</p>",
        "requirement": "<p>- Tốt nghiệp Kỹ sư Kinh tế xây dựng / Xây dựng dân dụng.<br>- 3 năm kinh nghiệm làm QS dự án.<br>- Thành thạo AutoCAD, phần mềm bóc tách khối lượng và lập dự toán.</p>",
        "benefits": "<p>- Lương 15 - 25 triệu.<br>- Thưởng dự án + Đào tạo nâng cao.<br>- Môi trường làm việc chuyên nghiệp.</p>",
        "salary_min": 15000000,
        "salary_max": 25000000,
        "position": 4,  # Specialist
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Sales Admin (Chuyên viên Hồ sơ Đấu thầu / Tender Admin)",
        "qty": 1,
        "career_name": "Xây dựng",
        "city_keyword": "Hồ Chí Minh",
        "description": "<p>Phụ trách chuẩn bị, hoàn thiện và theo dõi hồ sơ năng lực, hồ sơ đấu thầu dự án cho công ty.</p>",
        "requirement": "<p>- Tốt nghiệp Đại học/Cao đẳng các ngành Kinh tế, Xây dựng, Ngoại thương.<br>- 1-3 năm kinh nghiệm làm hồ sơ đấu thầu dự án xây dựng/nội thất.<br>- Cẩn thận, chỉn chu trong văn bản giấy tờ, làm việc áp lực cao.</p>",
        "benefits": "<p>- Lương 10 - 16 triệu + Thưởng trúng thầu dự án.<br>- BHXH + Chế độ thưởng lễ tết.<br>- Làm việc giờ hành chính tại văn phòng.</p>",
        "salary_min": 10000000,
        "salary_max": 16000000,
        "position": 5,  # Staff
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Diễn họa 2D / Kỹ sư Thiết kế Kỹ thuật (2D Drafter)",
        "qty": 2,
        "career_name": "Thiết kế / Kiến trúc",
        "city_keyword": "Hà Nội",
        "description": "<p>Triển khai bản vẽ 2D kỹ thuật thi công nội thất/kiến trúc và bản vẽ hoàn công (As-built) cho dự án.</p>",
        "requirement": "<p>- Tốt nghiệp Họa viên kiến trúc, CĐ/ĐH Kiến trúc, Xây dựng.<br>- Thành thạo AutoCAD, Revit, Photoshop và đọc bản vẽ thi công mượt mà.<br>- Có từ 1-2 năm kinh nghiệm triển khai bản vẽ thi công thực tế.</p>",
        "benefits": "<p>- Lương 12 - 18 triệu + Thưởng dự án.<br>- Môi trường sáng tạo, năng động.<br>- Cơ hội học hỏi thêm về thiết kế 3D/BIM.</p>",
        "salary_min": 12000000,
        "salary_max": 18000000,
        "position": 4,  # Specialist
        "is_hot": False,
        "is_urgent": False,
    },
    {
        "name": "Admin C&C & Điều phối Dự án (Project Coordinator)",
        "qty": 2,
        "career_name": "Xây dựng",
        "city_keyword": "Hồ Chí Minh",
        "description": "<p>Hỗ trợ quản lý hồ sơ công văn dự án C&C, điều phối công việc và theo dõi tiến độ thi công của các đội nhóm/nhà thầu.</p>",
        "requirement": "<p>- Tốt nghiệp ĐH/CĐ chuyên ngành Quản trị, Xây dựng, Ngoại ngữ.<br>- Có kỹ năng sắp xếp công việc, giao tiếp và quản lý tiến độ tốt.<br>- Sử dụng tốt Excel, MS Project, Word.</p>",
        "benefits": "<p>- Lương 10 - 15 triệu.<br>- Thưởng theo tiến độ hoàn thành dự án.<br>- Đầy đủ chế độ bảo hiểm và phúc lợi.</p>",
        "salary_min": 10000000,
        "salary_max": 15000000,
        "position": 5,  # Staff
        "is_hot": False,
        "is_urgent": False,
    },
]


class Command(BaseCommand):
    help = "Clean existing jobs and seed 11 project-focused job posts for Square company (HOT for GS and QA/QC only)"

    def handle(self, *args, **options):
        company = Company.objects.filter(company_name__icontains="Square").order_by("id").first()
        if not company:
            company = Company.objects.first()

        if not company:
            self.stderr.write(self.style.ERROR("Không tìm thấy Công ty nào trong database."))
            return

        company.is_verified = True
        company.save(update_fields=["is_verified"])

        deadline = timezone.now().date() + timedelta(days=90)

        # Xóa tất cả các bài đăng cũ của công ty Square
        deleted_count, _ = JobPost.objects.filter(company=company).delete()
        self.stdout.write(self.style.WARNING(f"Đã xóa {deleted_count} bài đăng cũ của công ty {company.company_name}."))

        self.stdout.write(f"\nBắt đầu khởi tạo {len(SQUARE_PROJECT_JOBS)} bài đăng tuyển dụng mới...")

        # Cache location objects per city
        city_hanoi = City.objects.filter(name__icontains="Hà Nội").first() or City.objects.filter(id=1).first()
        city_hcm = City.objects.filter(name__icontains="Hồ Chí Minh").first() or City.objects.filter(id=50).first()

        loc_hanoi = Location.objects.filter(city=city_hanoi).first() if city_hanoi else Location.objects.first()
        if not loc_hanoi and city_hanoi:
            loc_hanoi = Location.objects.create(city=city_hanoi, address="Quận Cầu Giấy, Thành phố Hà Nội")

        loc_hcm = Location.objects.filter(city=city_hcm).first() if city_hcm else Location.objects.first()
        if not loc_hcm and city_hcm:
            loc_hcm = Location.objects.create(city=city_hcm, address="Quận 1, Thành phố Hồ Chí Minh")

        created_jobs = []
        for idx, item in enumerate(SQUARE_PROJECT_JOBS, 1):
            career = Career.objects.filter(name__icontains=item["career_name"]).first()
            if not career:
                career = Career.objects.first()

            location = loc_hanoi if item.get("city_keyword") == "Hà Nội" else loc_hcm

            is_hot = item.get("is_hot", False)
            is_urgent = item.get("is_urgent", False)
            job_title = f"[TUYỂN GẤP] {item['name']}" if is_urgent else item["name"]

            job = JobPost.objects.create(
                job_name=job_title,
                quantity=item["qty"],
                deadline=deadline,
                job_description=item["description"],
                job_requirement=item["requirement"],
                benefits_enjoyed=item["benefits"],
                position=item["position"],
                type_of_workplace=1,  # Office-based / Site-based
                experience=4,         # 2 years
                academic_level=2,     # University / College
                job_type=1,           # Full-time Permanent
                salary_min=item["salary_min"],
                salary_max=item["salary_max"],
                is_hot=is_hot,
                is_urgent=is_urgent,
                status=var_sys.JobPostStatus.APPROVED,
                contact_person_name="Bộ phận Tuyển dụng Square Group",
                contact_person_phone="0901234567",
                contact_person_email="tuyendung@square.vn",
                career=career,
                location=location,
                user=company.user,
                company=company,
                is_auto_sourcing_enabled=True,
                auto_sourcing_limit=10,
                auto_interview_enabled=True,
                min_screening_score=70,
            )
            created_jobs.append(job)
            hot_label = "🔥 HOT / Tuyển Gấp" if is_urgent else "📄 Tin Thường"
            self.stdout.write(self.style.SUCCESS(f"  [{idx}/{len(SQUARE_PROJECT_JOBS)}] {hot_label}: {job.job_name} (Khu vực: {location.city.name if location and location.city else 'N/A'}, Số lượng: {job.quantity})"))

        self.stdout.write(self.style.SUCCESS(f"\nHoàn tất! Đã đăng thành công {len(created_jobs)} bài tuyển dụng mới trên hệ thống Square."))
