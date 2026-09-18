import os
import sys
from pathlib import Path
from datetime import timedelta

import django
from django.utils import timezone

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.jobs.models import JobPost
from apps.locations.models import Location
from apps.profiles.models import Company
from apps.common.models import Career
from shared.configs import variable_system as var_sys


JOBS_DATA = [
    {
        "career": "Xây dựng",
        "name": "[TUYỂN GẤP] Kỹ sư Giám sát công trình (GS XD / GS ID / GS MEP)",
        "qty": 6,
        "is_urgent": True,
        "is_hot": True,
        "desc": "<p><strong>Mô tả công việc:</strong></p><ul><li>Quản lý, giám sát thi công tại site theo phân công (GS XD: 1, GS ID: 2, GS MEP: 1).</li><li>Kiểm soát chất lượng, tiến độ và an toàn lao động tại công trình.</li><li>Phối hợp với Chỉ huy trưởng và Ban Quản lý dự án.</li></ul>",
        "req": "<p>Tối thiểu 2-3 năm kinh nghiệm giám sát công trình thi công / nội thất / MEP.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "[TUYỂN GẤP] Kỹ sư QA / QC (Quality Assurance & Control)",
        "qty": 3,
        "is_urgent": True,
        "is_hot": True,
        "desc": "<p><strong>Mô tả công việc:</strong></p><ul><li>Kiểm soát quy trình chất lượng vật tư, vật liệu và thi công tại dự án.</li><li>Lập biên bản kiểm tra, nghiệm thu và khắc phục lỗi chất lượng.</li></ul>",
        "req": "<p>Tốt nghiệp chuyên ngành Xây dựng / Kiến trúc / Kỹ thuật. Có kinh nghiệm làm QA/QC dự án.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "Chuyên viên Thu mua Dự án (Procurement Specialist)",
        "qty": 1,
        "is_urgent": False,
        "is_hot": False,
        "desc": "<p><strong>Mô tả công việc:</strong> Phụ trách tìm kiếm nhà cung cấp, đàm phán giá và cung ứng vật tư phục vụ thi công dự án.</p>",
        "req": "<p>Kinh nghiệm thu mua vật liệu xây dựng / trang thiết bị nội thất từ 2 năm trở lên.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "Chỉ huy trưởng công trình (CHT / Site Manager)",
        "qty": 2,
        "is_urgent": False,
        "is_hot": True,
        "desc": "<p><strong>Mô tả công việc:</strong> Quản lý toàn bộ hoạt động thi công, nhân sự, an toàn và tiến độ tại site công trình.</p>",
        "req": "<p>Có chứng chỉ hành chỉ huy trưởng, trên 5 năm kinh nghiệm quản lý thi công công trình lớn.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "Project Manager (PM - Quản lý dự án)",
        "qty": 1,
        "is_urgent": False,
        "is_hot": True,
        "desc": "<p><strong>Mô tả công việc:</strong> Quản lý tổng thể dự án, điều phối nội bộ và làm việc trực tiếp với khách hàng/chủ đầu tư.</p>",
        "req": "<p>Kinh nghiệm PM các dự án xây dựng & hoàn thiện nội thất từ 5 năm trở lên.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "Kỹ sư QS (Quantity Surveyor - Bóc tách khối lượng)",
        "qty": 1,
        "is_urgent": False,
        "is_hot": False,
        "desc": "<p><strong>Mô tả công việc:</strong> Bóc tách khối lượng, lập dự toán và kiểm soát chi phí dự án.</p>",
        "req": "<p>Tốt nghiệp chuyên ngành Kỹ thuật / Dự toán. Sử dụng thành thạo phần mềm dự toán.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "Chuyên viên Sales Admin (Hồ sơ đấu thầu)",
        "qty": 1,
        "is_urgent": False,
        "is_hot": False,
        "desc": "<p><strong>Mô tả công việc:</strong> Phụ trách soạn thảo, hoàn thiện và quản lý hồ sơ năng lực, hồ sơ đấu thầu dự án.</p>",
        "req": "<p>Có kinh nghiệm làm hồ sơ thầu ngành xây dựng / kiến trúc / nội thất.</p>",
    },
    {
        "career": "Kiến trúc",
        "name": "Chuyên viên Diễn họa 2D / Thiết kế kỹ thuật",
        "qty": 2,
        "is_urgent": False,
        "is_hot": False,
        "desc": "<p><strong>Mô tả công việc:</strong> Triển khai bản vẽ kỹ thuật 2D, hồ sơ thi công phục vụ các dự án của Square Group.</p>",
        "req": "<p>Thành thạo AutoCAD, Photoshop, Revit. Am hiểu cấu tạo kiến trúc & nội thất.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "Chuyên viên Admin C&C (Hỗ trợ hồ sơ dự án)",
        "qty": 1,
        "is_urgent": False,
        "is_hot": False,
        "desc": "<p><strong>Mô tả công việc:</strong> Hỗ trợ quản lý, lưu trữ và luân chuyển hồ sơ văn bản pháp lý dự án C&C.</p>",
        "req": "<p>Tốt nghiệp Cao đẳng/Đại học. Cẩn thận, chỉn chu trong công tác quản lý hồ sơ.</p>",
    },
    {
        "career": "Xây dựng",
        "name": "Chuyên viên Điều phối dự án (Project Coordinator)",
        "qty": 1,
        "is_urgent": False,
        "is_hot": False,
        "desc": "<p><strong>Mô tả công việc:</strong> Điều phối tiến độ, luân chuyển thông tin và công việc giữa các phòng ban và site công trình.</p>",
        "req": "<p>Kỹ năng giao tiếp, tổ chức công việc và giải quyết vấn đề tốt.</p>",
    },
]


company = Company.objects.filter(company_name__icontains="Square").order_by("id").first()
if not company:
    raise SystemExit("Không tìm thấy Square company. Hãy chạy seed_users trước.")

location = company.location or Location.objects.first()
deadline = timezone.now().date() + timedelta(days=60)

# Clean up previous posts and insert the 10 official Square positions
JobPost.objects.all().delete()

for item in JOBS_DATA:
    career, _ = Career.objects.get_or_create(name=item["career"])

    JobPost.objects.create(
        job_name=item["name"],
        quantity=item["qty"],
        deadline=deadline,
        job_description=item["desc"],
        job_requirement=item["req"],
        benefits_enjoyed="<p>Chế độ đãi ngộ hấp dẫn, BHXH đầy đủ, thưởng dự án theo hiệu suất từ Square Group.</p>",
        position=5,
        type_of_workplace=1,
        experience=3,
        academic_level=3,
        job_type=1,
        salary_min=12000000,
        salary_max=35000000,
        is_urgent=item["is_urgent"],
        is_hot=item["is_hot"],
        status=var_sys.JobPostStatus.APPROVED,
        contact_person_name="Ban Tuyển Dụng Square Group",
        contact_person_phone="0901234567",
        contact_person_email="tuyendung@square.vn",
        career=career,
        location=location,
        user=company.user,
        company=company,
    )

print(f"Hoàn tất nạp {len(JOBS_DATA)} vị trí tuyển dụng chuẩn cho Square Group!")
