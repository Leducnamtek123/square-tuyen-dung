import os
import django
from django.utils import timezone
from datetime import timedelta

# Lấy các dependencies Model
from apps.accounts.models import User
from apps.profiles.models import Company
from common.models import Career
from apps.locations.models import Location
from apps.jobs.models import JobPost
from shared.configs import variable_system as var_sys

def get_default_choices():
    user = User.objects.filter(role_id=var_sys.Role.EMPLOYER).first()
    if not user:
        user = User.objects.filter(is_superuser=True).first()
        
    company = Company.objects.filter(user=user).first() if user else Company.objects.first()
    career = Career.objects.first()
    location = Location.objects.first()
    
    return user, company, career, location

def seed_jobs():
    user, company, career, location = get_default_choices()
    
    if not user or not company:
        print("Lỗi: Không tìm thấy User hoặc Company trong database để đăng bài.")
        return

    # Thông tin mô tả công việc chung
    job_description = """
    <p>Để chuẩn bị cho các dự án năm 2026, công ty cần bổ sung một số vị trí nhằm tăng cường năng lực triển khai và đấu thầu.</p>
    <p>Nhờ Anh Chị trong team tận dụng mạng lưới quan hệ cá nhân, bạn bè, đồng nghiệp cũ để giới thiệu ứng viên phù hợp. Ứng viên có thể làm cơ hữu hoặc theo job/dự án.</p>
    <strong>Thông tin Kế hoạch dự án 2026:</strong>
    <ul>
      <li><strong>Công trình lớn (1-2 dự án):</strong> Thời gian 6-8 tháng. (1 job bắt đầu tháng 3-4; 1 job tháng 10-11). Các dự án khác đang tiếp tục đấu thầu.</li>
      <li><strong>Công trình trung bình (3-5 dự án):</strong> Thời gian 2-3 tháng. (1 job tháng 3-4; 1 job tháng 7).</li>
      <li><strong>Công trình nhỏ (~10 dự án):</strong> Thời gian 15 ngày - 1.5 tháng. (2 job tháng 3; 1 job tháng 4; 1 job tháng 7).</li>
    </ul>
    """

    job_requirement = """
    <ul>
      <li>Ứng viên có chuyên môn, kinh nghiệm phù hợp với các vị trí ứng tuyển ở trên.</li>
      <li>Sẵn sàng đi công tác hoặc gắn bó tại site công trình (đối với các vị trí Giám sát, CHT, PM).</li>
      <li>Có tinh thần trách nhiệm cao, chịu khó và chủ động trong công việc.</li>
    </ul>
    """

    benefits_enjoyed = """
    <p><strong>Thông tin liên hệ giới thiệu ứng viên:</strong></p>
    <ul>
      <li><strong>Phụ trách:</strong> Phòng HCNS – Ms. Ngọc</li>
      <li><strong>Email:</strong> tuyendung@square.vn</li>
      <li><strong>Điện thoại:</strong> 0989 242 042</li>
    </ul>
    """

    jobs_to_create = [
        {"name": "Thu mua (Chuyên viên)", "qty": 1, "desc": "Phục vụ cho dự án."},
        {"name": "Giám sát (GS)", "qty": 4, "desc": "Quản lý theo phân công tại site."},
        {"name": "Chỉ huy trưởng (CHT)", "qty": 2, "desc": "Quản lý toàn bộ hoạt động tại site."},
        {"name": "Project Manager (PM)", "qty": 1, "desc": "Quản lý tổng thể site, phối hợp nội bộ và làm việc với khách hàng."},
        {"name": "QS (Quantity Surveyor)", "qty": 1, "desc": "Bóc tách khối lượng, kiểm soát chi phí dự án."},
        {"name": "Sales Admin", "qty": 1, "desc": "Phụ trách hồ sơ đấu thầu."},
        {"name": "Diễn họa 2D / Thiết kế kỹ thuật", "qty": 2, "desc": "Phục vụ triển khai dự án."},
        {"name": "Admin C&C", "qty": 1, "desc": "Hỗ trợ hồ sơ dự án."},
        {"name": "Điều phối dự án", "qty": 1, "desc": "Điều phối công việc và tiến độ dự án."}
    ]

    print(f"Bắt đầu tạo {len(jobs_to_create)} tin tuyển dụng cho công ty {company.company_name}...")

    deadline = timezone.now().date() + timedelta(days=60)

    for item in jobs_to_create:
        job = JobPost.objects.create(
            job_name=f"[TUYỂN GẤP DỰ ÁN 2026] {item['name']}",
            quantity=item['qty'],
            deadline=deadline,
            job_description=f"<p><strong>Vị trí: </strong>{item['name']}</p><p><strong>Nhiệm vụ chính: </strong>{item['desc']}</p><br/>{job_description}",
            job_requirement=job_requirement,
            benefits_enjoyed=benefits_enjoyed,
            position=var_sys.Position.EMPLOYEE,
            type_of_workplace=var_sys.TypeOfWorkplace.ON_SITE,
            experience=var_sys.Experience.ONE_YEAR,
            academic_level=var_sys.AcademicLevel.COLLEGE,
            job_type=var_sys.JobType.FULL_TIME,
            salary_min=10000000,
            salary_max=30000000,
            status=var_sys.JobPostStatus.PUBLISHED,
            contact_person_name="Ngọc",
            contact_person_phone="0989242042",
            contact_person_email="tuyendung@square.vn",
            career=career,
            location=location,
            user=user,
            company=company
        )
        print(f"- Đã đăng thành công: {job.job_name}")

    print("Hoàn tất!")

if __name__ == '__main__':
    seed_jobs()
