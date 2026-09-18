import os
import io
import sys
import requests
from datetime import date, timedelta
from django.utils import timezone
from django.utils.text import slugify

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, '/app')
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.profiles.models import Company, CompanyImage
from apps.locations.models import City, District, Ward, Location
from apps.files.models import File
from apps.jobs.models import JobPost, Career
from shared.helpers.cloudinary_service import CloudinaryService
from shared.configs import variable_system as var_sys


def upload_remote_image(url: str, folder: str, public_id: str, file_type: str = File.OTHER_TYPE):
    try:
        print(f"Downloading {url}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code != 200:
            print(f"Failed to download {url}: HTTP {res.status_code}")
            return None
        
        file_obj = io.BytesIO(res.content)
        ext = url.split('.')[-1].split('?')[0].lower()
        if ext not in ['png', 'jpg', 'jpeg', 'webp', 'svg']:
            ext = 'png'
        file_obj.name = f"{public_id}.{ext}"

        upload_result = CloudinaryService.upload_image(
            file_obj,
            folder=folder,
            public_id=public_id
        )
        if upload_result:
            file_record = File.update_or_create_file_with_minio(None, upload_result, file_type=file_type)
            print(f"Uploaded to MinIO: {file_record.public_id} -> File ID {file_record.id}")
            return file_record
        else:
            print(f"MinIO upload failed for {url}")
            return None
    except Exception as e:
        print(f"Error processing image {url}: {e}")
        return None


def run_seed():
    print("=== START SEEDING VI SMART TECH COMPANY ===")

    # 1. Location setup
    city = City.objects.filter(name__icontains='Hồ Chí Minh').first()
    if not city:
        city = City.objects.first()
    
    district = District.objects.filter(city=city, name__icontains='5').first()
    if not district:
        district = District.objects.filter(city=city).first()

    ward = Ward.objects.filter(district=district, name__icontains='14').first()
    if not ward:
        ward = Ward.objects.filter(district=district).first()

    location, _ = Location.objects.get_or_create(
        city=city,
        district=district,
        ward=ward,
        address='55 Trần Chánh Chiếu, Phường 14, Quận 5',
        defaults={
            'lat': 10.752118,
            'lng': 106.649489,
        }
    )
    print(f"Location configured: {location.address}, Lat: {location.lat}, Lng: {location.lng}")

    # 2. Upload Logo and Cover image
    logo_url = 'https://vismarttech.com/logo.png'
    logo_file = upload_remote_image(
        logo_url,
        folder='vismarttech/logo',
        public_id='logo_main',
        file_type=File.LOGO_TYPE
    )

    cover_url = 'https://vismarttech.com/storage/settings/KImzwDznJkHCBuZkAA2AEe9r4Cvt734qFmfvOl0i.png'
    cover_file = upload_remote_image(
        cover_url,
        folder='vismarttech/cover',
        public_id='cover_main',
        file_type=File.COVER_IMAGE_TYPE
    )

    # 3. Create or Update Employer User
    user_email = 'support@vismarttech.com'
    user, user_created = User.objects.get_or_create(
        email=user_email,
        defaults={
            'full_name': 'Vi Smart Tech',
            'phone_number': '0797776900',
            'role_name': 'EMPLOYER',
            'is_active': True,
            'is_verify_email': True,
            'is_verify_phone': True,
            'is_onboarded': True,
        }
    )
    user.set_password('ViSmartTech@2026!')
    user.save()
    print(f"Employer User: {user.email} (ID: {user.id}, Created: {user_created})")

    # 4. Create or Update Company
    company_name = 'Vi Smart Tech'
    description_html = """<h3>1. Tổng quan về Vi Smart Tech</h3>
<p>Vi Smart Tech là đơn vị tiên phong chuyên tư vấn và cung cấp các giải pháp công nghệ thông tin thế hệ mới, số hóa quy trình và tích hợp trí tuệ nhân tạo toàn diện cho doanh nghiệp. Chúng tôi đồng hành cùng các tổ chức trong hành trình nâng cao năng suất vận hành, tối ưu hóa chi phí và thiết lập lợi thế cạnh tranh bền vững trong kỷ nguyên chuyển đổi số.</p>

<h3>2. Sứ mệnh và Triết lý hoạt động</h3>
<p>Chúng tôi cam kết mang đến những giải pháp công nghệ hiện đại, không chỉ giúp doanh nghiệp tinh gọn bộ máy và nâng cao hiệu quả làm việc, mà còn thúc đẩy phát triển bền vững, tạo dựng nền tảng vững chắc trước những biến động của thị trường kinh doanh.</p>

<h3>3. Các lĩnh vực và Dịch vụ trọng tâm</h3>
<ul>
  <li><strong>Tư vấn giải pháp AI:</strong> Xây dựng chiến lược ứng dụng trí tuệ nhân tạo phù hợp với đặc thù vận hành của từng mô hình kinh doanh.</li>
  <li><strong>Chatbot AI và Trợ lý ảo thông minh:</strong> Tự động hóa hoạt động chăm sóc khách hàng đa kênh 24/7 và phản hồi nghiệp vụ nội bộ tức thì.</li>
  <li><strong>AI Agent doanh nghiệp:</strong> Phát triển nhân sự số thông minh có khả năng tự động thực hiện các tác vụ phức tạp theo kịch bản chuyên sâu.</li>
  <li><strong>Số hóa và tự động hóa quy trình:</strong> Tinh gọn quy trình làm việc liên phòng ban, loại bỏ thao tác thủ công lặp lại và gia tăng tốc độ xử lý công việc.</li>
  <li><strong>Thiết kế website và phát triển phần mềm theo yêu cầu:</strong> Xây dựng các nền tảng web, ứng dụng di động và hệ thống quản trị chuyên biệt đạt tiêu chuẩn cao về bảo mật và trải nghiệm người dùng.</li>
</ul>

<h3>4. Năng lực và Dấu ấn phát triển</h3>
<p>Với đội ngũ hơn 150 chuyên gia tư vấn công nghệ giàu kinh nghiệm, Vi Smart Tech đã đồng hành và hoàn thành hơn 400 dự án lớn nhỏ cho các khách hàng doanh nghiệp trong nước và quốc tế, đạt tỷ lệ hài lòng vượt trội 5 sao.</p>

<h3>5. Môi trường làm việc và Cơ hội phát triển</h3>
<p>Tại Vi Smart Tech, chúng tôi coi trọng tinh thần đổi mới sáng tạo, tư duy giải quyết vấn đề và sự phát triển cá nhân của từng thành viên. Đội ngũ nhân sự được làm việc trực tiếp với những công nghệ AI tiên tiến nhất, tham gia các dự án chuyển đổi số quy mô lớn và thụ hưởng chế độ đãi ngộ cạnh tranh cùng lộ trình thăng tiến rõ ràng.</p>"""

    evaluation_weights = {
        "technical": 35,
        "communication": 20,
        "situational": 20,
        "culture_fit": 15,
        "attitude": 10,
    }

    company, company_created = Company.objects.get_or_create(
        company_name=company_name,
        defaults={
            'user': user,
            'company_email': user_email,
            'company_phone': '0797776900',
            'website_url': 'https://vismarttech.com',
            'facebook_url': 'https://www.facebook.com/vismarttech',
            'youtube_url': 'https://www.youtube.com/vismarttech',
            'linkedin_url': 'https://www.linkedin.com/company/vismarttech',
            'tax_code': '0318777690',
            'since': date(2022, 1, 1),
            'field_operation': 'Giải pháp AI, Tự động hóa quy trình, Chuyển đổi số, Phát triển phần mềm & Website',
            'description': description_html,
            'employee_size': 2,
            'is_verified': True,
            'location': location,
            'logo': logo_file,
            'cover_image': cover_file,
            'evaluation_weights': evaluation_weights,
        }
    )

    if not company_created:
        company.user = user
        company.company_email = user_email
        company.company_phone = '0797776900'
        company.website_url = 'https://vismarttech.com'
        company.facebook_url = 'https://www.facebook.com/vismarttech'
        company.youtube_url = 'https://www.youtube.com/vismarttech'
        company.linkedin_url = 'https://www.linkedin.com/company/vismarttech'
        company.field_operation = 'Giải pháp AI, Tự động hóa quy trình, Chuyển đổi số, Phát triển phần mềm & Website'
        company.description = description_html
        company.employee_size = 2
        company.is_verified = True
        company.location = location
        if logo_file:
            company.logo = logo_file
        if cover_file:
            company.cover_image = cover_file
        company.evaluation_weights = evaluation_weights
        company.save()

    print(f"Company: {company.company_name} (ID: {company.id}, Slug: {company.slug}, Created: {company_created})")

    # 5. Add Gallery Images (Showcase photos)
    gallery_sources = [
        ('https://vismarttech.com/storage/settings/VOp1jtOvMrbr2lfNQ2NkYZjmxxOVcVLVi1wlxqu2.jpg', 'about_team'),
        ('https://vismarttech.com/storage/settings/ISpQ9UHfivMzeXMJ5f5FNGeY7GY3fOVC5d8brL0A.jpg', 'tech_solutions'),
    ]
    for idx, (img_url, p_id) in enumerate(gallery_sources):
        g_file = upload_remote_image(
            img_url,
            folder='vismarttech/gallery',
            public_id=p_id,
            file_type=File.COMPANY_IMAGE_TYPE
        )
        if g_file:
            CompanyImage.objects.get_or_create(
                company=company,
                image=g_file
            )
            print(f"Linked Gallery Image {idx + 1}")

    # 6. Create 2 recruitment Job Posts
    it_career = Career.objects.filter(name__icontains='Công nghệ thông tin').first()
    if not it_career:
        it_career = Career.objects.first()

    job1_name = "Kỹ sư Trí tuệ Nhân tạo - AI Agent & LLM Engineer"
    job1_desc = """<p>Vi Smart Tech tìm kiếm các Kỹ sư AI tài năng tham gia nghiên cứu, phát triển và tối ưu hóa hệ thống AI Agent và Trợ lý ảo cho các khách hàng doanh nghiệp.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Nghiên cứu, thử nghiệm và tích hợp các mô hình ngôn ngữ lớn LLM vào sản phẩm thực tế của công ty.</li>
  <li>Xây dựng kiến trúc AI Agent tự động hóa các chu trình nghiệp vụ phức tạp.</li>
  <li>Tối ưu hóa hiệu năng, độ trễ và độ chính xác của các pipeline xử lý dữ liệu ngôn ngữ tự nhiên.</li>
  <li>Phối hợp cùng đội ngũ kỹ sư phần mềm để triển khai giải pháp lên hạ tầng điện toán đám mây.</li>
</ul>"""
    job1_req = """<ul>
  <li>Tốt nghiệp Đại học chuyên ngành Khoa học Máy tính, Công nghệ Thông tin hoặc các ngành liên quan.</li>
  <li>Có từ 2 năm kinh nghiệm làm việc với Python và các framework trí tuệ nhân tạo.</li>
  <li>Am hiểu sâu về Prompt Engineering, kỹ thuật RAG và tinh chỉnh mô hình ngôn ngữ lớn.</li>
  <li>Tư duy logic xuất sắc, chủ động nghiên cứu và cập nhật các tiến bộ công nghệ mới.</li>
</ul>"""
    job1_benefit = """<ul>
  <li>Mức lương thỏa thuận cạnh tranh từ 25.000.000 đến 45.000.000 đồng mỗi tháng.</li>
  <li>Thưởng hiệu quả dự án và thưởng tháng 13 đầy đủ.</li>
  <li>Được cấp trang thiết bị làm việc hiện đại và ngân sách đào tạo công nghệ hàng năm.</li>
  <li>Chế độ bảo hiểm sức khỏe cao cấp và các hoạt động team building sôi nổi.</li>
</ul>"""

    job1, job1_created = JobPost.objects.get_or_create(
        company=company,
        job_name=job1_name,
        defaults={
            'user': user,
            'deadline': date.today() + timedelta(days=45),
            'quantity': 3,
            'job_description': job1_desc,
            'job_requirement': job1_req,
            'benefits_enjoyed': job1_benefit,
            'position': 1,
            'type_of_workplace': 1,
            'experience': 2,
            'academic_level': 4,
            'job_type': 1,
            'salary_min': 25000000,
            'salary_max': 45000000,
            'is_hot': True,
            'is_urgent': True,
            'status': var_sys.JobPostStatus.APPROVED,
            'contact_person_name': 'Phòng Tuyển Dụng Vi Smart Tech',
            'contact_person_phone': '0797776900',
            'contact_person_email': 'support@vismarttech.com',
            'career': it_career,
            'location': location,
        }
    )
    print(f"Job 1: {job1.job_name} (Created: {job1_created}, Status: {job1.status})")

    job2_name = "Chuyên viên Tư vấn Giải pháp Chuyển đổi số & Tự động hóa Quy trình"
    job2_desc = """<p>Vi Smart Tech cần tuyển Chuyên viên Tư vấn Giải pháp Chuyển đổi số phụ trách khảo sát, phân tích và đề xuất giải pháp công nghệ cho các doanh nghiệp đối tác.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Làm việc trực tiếp với ban lãnh đạo doanh nghiệp để khảo sát hiện trạng và nhu cầu số hóa.</li>
  <li>Phân tích quy trình nghiệp vụ và xây dựng tài liệu giải pháp kỹ thuật chi tiết.</li>
  <li>Trình bày, thuyết minh giải pháp và phối hợp triển khai cùng đội ngũ phát triển sản phẩm.</li>
  <li>Theo dõi tiến độ, đánh giá hiệu quả sau chuyển đổi số và hỗ trợ khách hàng liên tục.</li>
</ul>"""
    job2_req = """<ul>
  <li>Tốt nghiệp Đại học khối ngành Công nghệ Thông tin, Hệ thống Thông tin Quản lý hoặc Quản trị Kinh doanh.</li>
  <li>Có ít nhất 1 đến 2 năm kinh nghiệm tư vấn giải pháp phần mềm hoặc giải pháp chuyển đổi số.</li>
  <li>Khả năng giao tiếp, thuyết trình và thuyết phục khách hàng chuyên nghiệp.</li>
  <li>Khả năng nắm bắt công nghệ nhanh và tư duy phân tích hệ thống mạch lạc.</li>
</ul>"""
    job2_benefit = """<ul>
  <li>Thu nhập hấp dẫn từ 18.000.000 đến 32.000.000 đồng mỗi tháng tùy năng lực.</li>
  <li>Hoa hồng và thưởng theo từng dự án ký kết thành công.</li>
  <li>Lộ trình phát triển rõ ràng lên cấp Quản lý Tư vấn Giải pháp.</li>
  <li>Môi trường làm việc cởi mở, tôn trọng sáng kiến cá nhân và đầy đủ phúc lợi theo luật định.</li>
</ul>"""

    job2, job2_created = JobPost.objects.get_or_create(
        company=company,
        job_name=job2_name,
        defaults={
            'user': user,
            'deadline': date.today() + timedelta(days=45),
            'quantity': 2,
            'job_description': job2_desc,
            'job_requirement': job2_req,
            'benefits_enjoyed': job2_benefit,
            'position': 1,
            'type_of_workplace': 1,
            'experience': 1,
            'academic_level': 4,
            'job_type': 1,
            'salary_min': 18000000,
            'salary_max': 32000000,
            'is_hot': False,
            'is_urgent': True,
            'status': var_sys.JobPostStatus.APPROVED,
            'contact_person_name': 'Phòng Tuyển Dụng Vi Smart Tech',
            'contact_person_phone': '0797776900',
            'contact_person_email': 'support@vismarttech.com',
            'career': it_career,
            'location': location,
        }
    )
    print(f"Job 2: {job2.job_name} (Created: {job2_created}, Status: {job2.status})")

    print("=== SEEDING COMPLETED SUCCESSFULLY ===")


if __name__ == '__main__':
    run_seed()
