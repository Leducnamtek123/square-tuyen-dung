import random
import os
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.locations.models import City, District, Location
from apps.files.models import File
from common.models import Career
from apps.profiles.models import Company, JobSeekerProfile, Resume
from apps.jobs.models import JobPost, JobPostActivity
from apps.interviews.models import Question, QuestionGroup, InterviewSession
from shared.configs import variable_system as var_sys
from django.db import transaction
from oauth2_provider.models import Application


def required_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required before creating OAuth2 application seed data.")
    return value


class Command(BaseCommand):
    help = 'Seed initial data for development - Construction & Design Industry'

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            self.stdout.write('Starting Seeding Construction & Design Industry Data...')
            
            # 1. Cities & Districts
            city_hcm, _ = City.objects.get_or_create(name='Hồ Chí Minh')
            city_hn, _ = City.objects.get_or_create(name='Hà Nội')
            District.objects.get_or_create(name='Quận 1', city=city_hcm)
            district_q7, _ = District.objects.get_or_create(name='Quận 7', city=city_hcm)
            District.objects.get_or_create(name='Cầu Giấy', city=city_hn)
            
            location_hcm, _ = Location.objects.get_or_create(
                city=city_hcm,
                district=district_q7,
                address='Số 1 Võ Văn Ngân, Thủ Đức, TP.HCM',
                lat=10.8507,
                lng=106.7719
            )

            # 2. Careers
            construction_career, _ = Career.objects.get_or_create(name='Xây dựng')
            design_career, _ = Career.objects.get_or_create(name='Thiết kế / Kiến trúc')
            Career.objects.get_or_create(name='Điện / Điện tử')
            Career.objects.get_or_create(name='Cơ khí')

            # 2.5. OAuth Application
            client_id = required_env('CLIENT_ID')
            client_secret = required_env('CLIENT_SECRET')

            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.create_superuser(
                    email='admin@Project.com',
                    full_name='System Admin',
                    password='Abc@1234'
                )

            app, created = Application.objects.get_or_create(
                client_id=client_id,
                defaults={
                    'client_type': Application.CLIENT_CONFIDENTIAL,
                    'authorization_grant_type': Application.GRANT_PASSWORD,
                    'name': 'Project Web App',
                    'user': admin_user
                }
            )
            app.client_secret = client_secret
            app.user = admin_user
            app.save()

            # Create Main Employer
            employer_user, created = User.objects.get_or_create(
                email='employer@square.com',
                defaults={
                    'full_name': 'Square Construction Group',
                    'is_active': True,
                    'is_verify_email': True,
                    'role_name': var_sys.EMPLOYER
                }
            )
            employer_user.role_name = var_sys.EMPLOYER
            employer_user.set_password('Abc@1234')
            employer_user.save()
            
            company, _ = Company.objects.get_or_create(
                user=employer_user,
                defaults={
                    'company_name': 'Square Group Construction & Design',
                    'company_email': 'hr@squaregroup.vn',
                    'company_phone': '02812345678',
                    'tax_code': '0312456789',
                    'location': location_hcm,
                    'employee_size': 4, # 500-1000
                    'field_operation': 'Construction, Interior Design, Architecture'
                }
            )

            # Data for 10 seeds with role-specific questions
            seeds_data = [
                {
                    "role": "Kiến trúc sư", 
                    "name": "Nguyên Văn An", 
                    "email": "kts.an@gmail.com", 
                    "career": design_career,
                    "questions": [
                        "Quy trình triển khai BIM trong thiết kế kiến trúc như thế nào?",
                        "Bạn phối hợp với kỹ sư kết cấu và M&E như thế nào trong giai đoạn thiết kế cơ sở?",
                        "Cách bạn xử lý mâu thuẫn giữa ý tưởng thẩm mĩ và công năng sử dụng?",
                        "Nêu các tiêu chuẩn Việt Nam (TCVN) về thoát nạn và PCCC trong chung cư cao tầng?"
                    ]
                },
                {
                    "role": "Kỹ sư xây dựng", 
                    "name": "Lê Quang Vinh", 
                    "email": "vinh.le@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Quy trình kiểm soát chất lượng vật liệu đầu vào tại công trường?",
                        "Cách xử lý khi kết quả thí nghiệm nén mẫu bê tông không đạt yêu cầu?",
                        "Trình bày biện pháp thi công tầng hầm bằng phương pháp Semi Top-down?",
                        "Sử dụng phần mềm nào để quản lý tiến độ và chi phí thi công?"
                    ]
                },
                {
                    "role": "Kỹ sư điện M&E", 
                    "name": "Trần Thanh Sơn", 
                    "email": "son.me@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Các bước nghiệm thu hệ thống tăng áp cầu thang và hút khói hành lang?",
                        "Cách tính toán chọn tiết diện cáp và thiết bị bảo vệ cho hệ thống chiller?",
                        "Sơ đồ nguyên lý hệ thống điện nhẹ (ELV) trong tòa nhà thông minh?",
                        "Quy trình xử lý sự cố mất điện lưới và khởi động máy phát điện dự phòng?"
                    ]
                },
                {
                    "role": "Chỉ huy trưởng", 
                    "name": "Phạm Minh Đức", 
                    "email": "duc.site@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Kinh nghiệm điều phối nhiều nhà thầu phụ cùng thi công trên một mặt bằng hẹp?",
                        "Cách quản lý và tối ưu hóa chi phí nhân công và máy thi công tại công trường?",
                        "Kỹ năng xử lý các vấn đề pháp lý và thanh tra xây dựng tại địa phương?",
                        "Làm thế nào để duy trì kỷ luật và ý thức an toàn của công nhân?"
                    ]
                },
                {
                    "role": "Kỹ sư dự toán (QS)", 
                    "name": "Hoàng Thị Lan", 
                    "email": "lan.qs@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Các bước lập hồ sơ thanh quyết toán với chủ đầu tư và nhà thầu phụ?",
                        "Cách bóc tách khối lượng thép và bê tông từ bản vẽ shop-drawing?",
                        "Xử lý các phát sinh ngoài hợp đồng (VO) như thế nào để đảm bảo quyền lợi công ty?",
                        "Tìm hiểu và cập nhật đơn giá vật liệu thị trường bằng cách nào?"
                    ]
                },
                {
                    "role": "Thiết kế nội thất", 
                    "name": "Vũ Hải Đăng", 
                    "email": "dang.interior@gmail.com", 
                    "career": design_career,
                    "questions": [
                        "Sự khác biệt trong việc chọn vật liệu hoàn thiện cho căn hộ cao cấp và văn phòng?",
                        "Kỹ năng sử dụng phần mềm 3dsMax, Corona hoặc Enscape để diễn họa?",
                        "Cách tối ưu hóa không gian cho các căn hộ diện tích nhỏ (Studio)?",
                        "Nắm bắt các xu hướng nội thất bền vững (Sustainable Design) hiện nay?"
                    ]
                },
                {
                    "role": "Cán bộ an toàn", 
                    "name": "Đặng Ngọc Thạch", 
                    "email": "thach.safety@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Quy trình cấp phép và giám sát các công việc nguy hiểm (làm việc trên cao, hàn cắt)?",
                        "Nội dung huấn luyện an toàn định kỳ cho công nhân mới vào công trường?",
                        "Cách thiết lập hệ thống cảnh báo và lưới an toàn cho nhà cao tầng?",
                        "Quy trình sơ cứu và báo cáo tai nạn lao động theo quy định?"
                    ]
                },
                {
                    "role": "Kỹ sư kết cấu", 
                    "name": "Bùi Xuân Hòa", 
                    "email": "hoa.structural@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Nguyên lý tính toán và kiểm tra độ võng, vết nứt cho dầm sàn nhịp lớn?",
                        "Cách thiết lập mô hình tính toán tải trọng gió và động đất trong Etabs?",
                        "Kỹ năng triển khai bản vẽ chi tiết thép (Shop-drawing) đạt độ chính xác cao?",
                        "Sự khác biệt giữa thiết kế kết cấu bê tông cốt thép và kết cấu thép tiền chế?"
                    ]
                },
                {
                    "role": "Giám sát công trình", 
                    "name": "Ngô Quốc Bảo", 
                    "email": "bao.sup@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Các bước kiểm tra nghiệm thu cốt thép và ván khuôn trước khi đổ bê tông?",
                        "Ghi nhật ký công trình như thế nào để làm bằng chứng pháp lý khi có tranh chấp?",
                        "Cách kiểm soát việc sai lệch cao độ và vị trí trục tim trên mặt bằng thi công?",
                        "Quy trình giám sát lắp đặt hệ thống thoát nước ngầm hố ga?"
                    ]
                },
                {
                    "role": "Quản lý dự án", 
                    "name": "Đỗ Hoàng Long", 
                    "email": "long.pm@gmail.com", 
                    "career": construction_career,
                    "questions": [
                        "Các chỉ số KPI chính để đánh giá hiệu quả của một dự án xây dựng?",
                        "Phương pháp quản lý rủi ro về tiến độ và dòng tiền của dự án?",
                        "Cách báo cáo và thuyết phục chủ đầu tư về các thay đổi kỹ thuật làm tăng chi phí?",
                        "Quy trình đóng dự án và bàn giao đưa vào sử dụng (Handover)?"
                    ]
                },
            ]

            self.stdout.write(f'Generated {len(seeds_data)} profiles...')

            for i, seed in enumerate(seeds_data):
                user, created = User.objects.get_or_create(
                    email=seed['email'],
                    defaults={
                        'full_name': seed['name'],
                        'is_active': True,
                        'is_verify_email': True,
                        'role_name': var_sys.JOB_SEEKER
                    }
                )
                user.role_name = var_sys.JOB_SEEKER
                user.set_password('Abc@1234')
                user.save()

                profile, _ = JobSeekerProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'phone': f'090{random.randint(1000000, 9999999)}',
                        'location': location_hcm,
                        'gender': random.choice(['M', 'F']),
                        'birthday': date(1990 + random.randint(0, 10), random.randint(1, 12), random.randint(1, 28))
                    }
                )

                # Job Post for each role
                job_post, _ = JobPost.objects.get_or_create(
                    job_name=f"Tuyển {seed['role']} chuyên nghiệp",
                    company=company,
                    user=employer_user,
                    defaults={
                        'deadline': date.today() + timedelta(days=30),
                        'quantity': 2,
                        'job_description': f'<p>Chúng tôi cần tuyển {seed["role"]} có kinh nghiệm...</p>',
                        'position': 5, # Chuyên viên
                        'type_of_workplace': 1,
                        'experience': random.randint(3, 10),
                        'academic_level': 2,
                        'job_type': 1,
                        'salary_min': 15000000 + (random.randint(0, 5) * 1000000),
                        'salary_max': 25000000 + (random.randint(0, 5) * 1000000),
                        'career': seed['career'],
                        'location': location_hcm,
                        'contact_person_name': 'HR Dept',
                        'contact_person_email': 'hr@squaregroup.vn',
                        'contact_person_phone': '02812345678',
                        'status': 3
                    }
                )

                resume, _ = Resume.objects.get_or_create(
                    user=user,
                    job_seeker_profile=profile,
                    defaults={
                        'title': f"CV {seed['role']} - {seed['name']}",
                        'salary_min': 15000000,
                        'salary_max': 30000000,
                        'position': 5,
                        'experience': 5,
                        'academic_level': 2,
                        'type_of_workplace': 1,
                        'city': city_hcm,
                        'career': seed['career'],
                        'is_active': True
                    }
                )

                # Job Application
                JobPostActivity.objects.get_or_create(
                    job_post=job_post,
                    user=user,
                    defaults={
                        'resume': resume,
                        'full_name': user.full_name,
                        'email': user.email,
                        'phone': profile.phone,
                        'status': 1
                    }
                )

                # Questions for this interview (Role Specific)
                q_list = []
                for q_text in seed['questions']:
                    q, _ = Question.objects.get_or_create(
                        text=q_text,
                        author=employer_user
                    )
                    q_list.append(q)

                group, _ = QuestionGroup.objects.get_or_create(
                    name=f"Bộ đề phỏng vấn {seed['role']}",
                    author=employer_user
                )
                group.questions.set(q_list)

                interview, _ = InterviewSession.objects.get_or_create(
                    candidate=user,
                    job_post=job_post,
                    defaults={
                        'status': 'scheduled',
                        'type': 'technical',
                        'scheduled_at': timezone.now() + timedelta(days=random.randint(1, 7)),
                        'created_by': employer_user,
                        'question_group': group
                    }
                )
                interview.questions.set(q_list)

            self.stdout.write(self.style.SUCCESS('Successfully seeded 10 specialized construction & design profiles with dedicated question sets!'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error seeding data: {str(e)}'))
            import traceback
            self.stderr.write(traceback.format_exc())


