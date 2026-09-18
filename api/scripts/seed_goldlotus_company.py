import os
import io
import sys
import requests
from datetime import date, timedelta
from PIL import Image
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


def upload_remote_image(url: str, folder: str, public_id: str, file_type: str = File.OTHER_TYPE, max_width: int = None):
    try:
        print(f"Downloading {url}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        res = requests.get(url, headers=headers, timeout=20)
        if res.status_code != 200:
            print(f"Failed to download {url}: HTTP {res.status_code}")
            return None
        
        content = res.content
        ext = url.split('.')[-1].split('?')[0].lower()
        if ext not in ['png', 'jpg', 'jpeg', 'webp', 'svg']:
            ext = 'jpg'

        if max_width:
            try:
                img = Image.open(io.BytesIO(content))
                if img.width > max_width:
                    ratio = max_width / float(img.width)
                    new_height = int(float(img.height) * float(ratio))
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                    out_io = io.BytesIO()
                    img_format = 'PNG' if ext == 'png' else 'JPEG'
                    img.save(out_io, format=img_format, quality=85)
                    content = out_io.getvalue()
                    print(f"Resized {public_id} to {max_width}x{new_height}, size: {len(content)} bytes")
            except Exception as resize_err:
                print(f"Warning during image resize: {resize_err}")

        file_obj = io.BytesIO(content)
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
    print("=== START SEEDING GOLD LOTUS TRAVEL COMPANY ===")

    # 1. Location setup: 492 Thuy Khue, Phuong Buoi, Quan Tay Ho, Ha Noi
    city = City.objects.filter(name__icontains='Hà Nội').first()
    if not city:
        city = City.objects.first()
    
    district = District.objects.filter(city=city, name__icontains='Tây Hồ').first()
    if not district:
        district = District.objects.filter(city=city).first()

    ward = Ward.objects.filter(district=district, name__icontains='Bưởi').first()
    if not ward:
        ward = Ward.objects.filter(district=district).first()

    location, _ = Location.objects.get_or_create(
        city=city,
        district=district,
        ward=ward,
        address='492 Thụy Khuê, Phường Bưởi, Quận Tây Hồ',
        defaults={
            'lat': 21.045672,
            'lng': 105.808721,
        }
    )
    print(f"Location configured: {location.address}, Lat: {location.lat}, Lng: {location.lng}")

    # 2. Upload Logo and Cover image
    # Note: Strip &ctp=s40x40 from user FB URL to get full 672x672 crisp resolution
    fb_logo_url = 'https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-1/481261113_122094742694799059_2811647343398521057_n.jpg?stp=c686.574.672.672a_cp0_dst-jpg_tt6&cstp=mx672x672&_nc_cat=106&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=yFGgctx0yoQQ7kNvwGAuf2j&_nc_oc=AdpvxzwpT23CXwIwx-vcs1cwW5pkgBAl75YfpnmKreZb_JJnFTZts0NtEP6AI9aGdYc&_nc_zt=24&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=2LvslO4arzAU2IRSn3mexQ&_nc_ss=7b2a8&oh=00_AQJlQRrFCocG2ooBOyamqoTkcxtmaYEkj-lNoqtdxEFL1g&oe=6AAD4018'
    
    logo_file = upload_remote_image(
        fb_logo_url,
        folder='goldlotustravel/logo',
        public_id='logo_main',
        file_type=File.LOGO_TYPE
    )
    if not logo_file:
        web_logo_url = 'https://goldlotustravel.com/images/logo.png'
        logo_file = upload_remote_image(
            web_logo_url,
            folder='goldlotustravel/logo',
            public_id='logo_main',
            file_type=File.LOGO_TYPE
        )

    cover_url = 'https://goldlotustravel.com/images/hero.jpg'
    cover_file = upload_remote_image(
        cover_url,
        folder='goldlotustravel/cover',
        public_id='cover_main',
        file_type=File.COVER_IMAGE_TYPE,
        max_width=1920
    )

    # 3. Create or Update Employer User
    user_email = 'info@goldlotustravel.com'
    user, user_created = User.objects.get_or_create(
        email=user_email,
        defaults={
            'full_name': 'Gold Lotus Travel',
            'phone_number': '0866550402',
            'role_name': 'EMPLOYER',
            'is_active': True,
            'is_verify_email': True,
            'is_verify_phone': True,
            'is_onboarded': True,
        }
    )
    user.set_password('GoldLotusTravel@2026!')
    user.save()
    print(f"Employer User: {user.email} - ID: {user.id}, Created: {user_created}")

    # 4. Create or Update Company
    company_name = 'Gold Lotus Travel'
    description_html = """<h3>1. Tổng quan về Gold Lotus Travel</h3>
<p>Công ty Trách nhiệm Hữu hạn Dịch vụ và Du lịch Gold Lotus - tên thương hiệu quốc tế GOLD LOTUS TRAVEL AND SERVICES COMPANY LIMITED, được thành lập vào ngày 09/09/2022. Gold Lotus Travel là đơn vị lữ hành uy tín hàng đầu tại Việt Nam, chuyên cung cấp các dịch vụ tour du lịch trọn gói trong nước và quốc tế, hệ thống khách sạn nghỉ dưỡng cao cấp, vé máy bay và tổ chức sự kiện chuyên nghiệp.</p>

<h3>2. Ý nghĩa thương hiệu: Vàng son mỗi chuyến đi, đẳng cấp mỗi hành trình</h3>
<ul>
  <li><strong>Gold - Giá trị và sự trân quý:</strong> Tượng trưng cho chất lượng dịch vụ cao cấp, nỗ lực kiến tạo những điều tốt đẹp và giá trị bền vững cho du khách. Mỗi hành trình được chăm chút như một kho báu tinh thần vô giá.</li>
  <li><strong>Lotus - Thanh khiết và tử tế:</strong> Hoa sen là biểu tượng của sự bền bỉ, lòng trắc ẩn và niềm tin vào hành trình phụng sự tận tâm. Gold Lotus Travel làm du lịch bằng trái tim, giữ trọn vẻ đẹp tinh khôi trong từng trải nghiệm.</li>
</ul>

<h3>3. Tầm nhìn và Sứ mệnh</h3>
<p><strong>Tầm nhìn:</strong> Trở thành đơn vị lữ hành tiêu biểu hàng đầu Việt Nam, mang đến những chuyến đi đáng nhớ, an toàn và trọn vẹn, đồng thời xây dựng mối quan hệ hợp tác chiến lược bền vững với các đối tác khách sạn, hàng không toàn cầu.</p>
<p><strong>Sứ mệnh:</strong> Chăm chút từng chi tiết nhỏ nhất trong suốt hành trình, biến mỗi điểm đến thành kỷ niệm thăng hoa và xứng tầm đẳng cấp.</p>

<h3>4. Giá trị cốt lõi</h3>
<ul>
  <li><strong>Thấu cảm:</strong> Đồng cảm sâu sắc và thấu hiểu nhu cầu, cảm xúc của từng du khách.</li>
  <li><strong>Chân thực:</strong> Mang lại những trải nghiệm gần gũi, đáng tin cậy và minh bạch.</li>
  <li><strong>Bền bỉ:</strong> Kiên định vượt qua mọi thách thức để giữ vững tiêu chuẩn dịch vụ tốt nhất.</li>
  <li><strong>Vượt trội:</strong> Không ngừng nâng tầm chất lượng, tạo dấu ấn khác biệt trên từng lộ trình.</li>
  <li><strong>Thăng hoa:</strong> Biến mỗi chuyến đi thành kỷ niệm trọn vẹn và cảm xúc dạt dào.</li>
</ul>

<h3>5. Các lĩnh vực dịch vụ trọng tâm</h3>
<ul>
  <li><strong>Tour du lịch trong nước:</strong> Khai thác các tuyến điểm nổi tiếng trải dài từ Bắc vào Nam như Sapa, Mộc Châu, Tam Đảo, Tà Xùa, Hạ Long, Huế, Đà Nẵng, Quy Nhơn, Nha Trang, Đà Lạt, Phú Quốc, Vũng Tàu.</li>
  <li><strong>Tour du lịch quốc tế:</strong> Các hành trình đặc sắc khám phá Trung Quốc, Thái Lan, Singapore, Malaysia, Hàn Quốc, Nhật Bản, Dubai, Ai Cập.</li>
  <li><strong>Dịch vụ lưu trú cao cấp:</strong> Đối tác chiến lược của các tập đoàn khách sạn và khu nghỉ dưỡng hàng đầu như Marriott International, IHG Hotels & Resorts, Accor, Sun Group, Vingroup, Meliá, Mường Thanh.</li>
  <li><strong>Vé máy bay và Combo du lịch:</strong> Cung cấp vé máy bay nội địa, quốc tế giá ưu đãi và các gói combo nghỉ dưỡng linh hoạt.</li>
  <li><strong>Teambuilding và Sự kiện doanh nghiệp:</strong> Thiết kế chương trình gắn kết đoàn thể, ngày hội văn hóa doanh nghiệp và tour du lịch theo đoàn riêng.</li>
</ul>

<h3>6. Bảo chứng uy tín và Thành tựu</h3>
<p>Gold Lotus Travel tự hào là thành viên của Câu lạc bộ Lữ hành UNESCO Hà Nội, gắn kết chặt chẽ cùng cộng đồng lữ hành chuyên nghiệp và cam kết phát triển du lịch bền vững. Doanh nghiệp vinh dự được trao tặng danh hiệu Top 10 Thương hiệu Vàng - Chất lượng Quốc tế năm 2025.</p>

<h3>7. Môi trường làm việc và Văn hóa doanh nghiệp</h3>
<p>Chúng tôi xây dựng môi trường làm việc trẻ trung, năng động, nơi mọi nhân viên được trao quyền sáng tạo, phát huy tối đa năng lực tư vấn và điều hành. Đội ngũ cán bộ nhân viên được hưởng chế độ đãi ngộ hấp dẫn, hoa hồng doanh số không giới hạn, lộ trình đào tạo bài bản và cơ hội tham gia các chuyến khảo sát, trải nghiệm dịch vụ khách sạn 4 đến 5 sao tại nhiều vùng đất mới.</p>"""

    evaluation_weights = {
        "technical": 25,
        "communication": 30,
        "situational": 25,
        "culture_fit": 10,
        "attitude": 10,
    }

    company, company_created = Company.objects.get_or_create(
        company_name=company_name,
        defaults={
            'user': user,
            'company_email': user_email,
            'company_phone': '0866550402',
            'website_url': 'https://goldlotustravel.com',
            'facebook_url': 'https://www.facebook.com/goldlotustravel',
            'youtube_url': 'https://tiktok.com/@goldlotustravel',
            'linkedin_url': 'https://instagram.com/goldlotustravel',
            'tax_code': '0110113006',
            'since': date(2022, 9, 9),
            'field_operation': 'Dịch vụ lữ hành, Tour du lịch trọn gói trong nước và quốc tế, Đại lý vé máy bay, Khách sạn và khu nghỉ dưỡng, Teambuilding & Sự kiện',
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
        company.company_phone = '0866550402'
        company.website_url = 'https://goldlotustravel.com'
        company.facebook_url = 'https://www.facebook.com/goldlotustravel'
        company.youtube_url = 'https://tiktok.com/@goldlotustravel'
        company.linkedin_url = 'https://instagram.com/goldlotustravel'
        company.tax_code = '0110113006'
        company.since = date(2022, 9, 9)
        company.field_operation = 'Dịch vụ lữ hành, Tour du lịch trọn gói trong nước và quốc tế, Đại lý vé máy bay, Khách sạn và khu nghỉ dưỡng, Teambuilding & Sự kiện'
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

    print(f"Company: {company.company_name} - ID: {company.id}, Slug: {company.slug}, Created: {company_created}")

    # 5. Add Gallery Images
    gallery_sources = [
        ('https://goldlotustravel.com/images/about-hero.jpg', 'about_hero', 1920),
        ('https://goldlotustravel.com/images/award-1.jpg', 'founder_award', 1200),
        ('https://goldlotustravel.com/images/logo.png', 'brand_logo', 1200),
    ]
    for idx, (img_url, p_id, max_w) in enumerate(gallery_sources):
        g_file = upload_remote_image(
            img_url,
            folder='goldlotustravel/gallery',
            public_id=p_id,
            file_type=File.COMPANY_IMAGE_TYPE,
            max_width=max_w
        )
        if g_file:
            CompanyImage.objects.get_or_create(
                company=company,
                image=g_file
            )
            print(f"Linked Gallery Image {idx + 1}")

    # 6. Setup Careers
    tourism_career, _ = Career.objects.get_or_create(
        name='Du lịch - Khách sạn',
        defaults={'is_hot': True}
    )
    sales_career = Career.objects.filter(name__icontains='Kinh doanh').first()
    if not sales_career:
        sales_career = tourism_career
    cs_career = Career.objects.filter(name__icontains='Chăm sóc khách hàng').first()
    if not cs_career:
        cs_career = tourism_career

    # 7. Create 3 strategic Job Posts
    job1_name = "Chuyên viên Điều hành Tour Du lịch Nội địa và Quốc tế"
    job1_desc = """<p>Gold Lotus Travel tìm kiếm Chuyên viên Điều hành Tour chuyên nghiệp phụ trách thiết kế, tổ chức và điều phối các chương trình du lịch nội địa và quốc tế đạt chuẩn chất lượng cao cấp.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Lên lịch trình chi tiết, dự toán chi phí và xây dựng sản phẩm tour du lịch mới.</li>
  <li>Làm việc và đàm phán giá dịch vụ với các nhà cung cấp: khách sạn, nhà xe, nhà hàng, hãng hàng không, đối tác lữ hành địa phương.</li>
  <li>Phối hợp cùng bộ phận kinh doanh để giải đáp thắc mắc và tư vấn lịch trình chuyên sâu cho du khách.</li>
  <li>Giám sát chất lượng dịch vụ trong suốt thời gian đoàn đi tour, kịp thời xử lý các tình huống phát sinh linh hoạt.</li>
  <li>Tổng kết chi phí và thanh quyết toán dịch vụ sau mỗi chương trình tour.</li>
</ul>"""
    job1_req = """<ul>
  <li>Tốt nghiệp Cao đẳng hoặc Đại học chuyên ngành Du lịch, Lữ hành, Quản trị Khách sạn hoặc các khối ngành kinh tế liên quan.</li>
  <li>Có ít nhất 1 năm kinh nghiệm tại vị trí điều hành tour nội địa hoặc tour quốc tế.</li>
  <li>Có mối quan hệ tốt với hệ thống đối tác dịch vụ du lịch trên toàn quốc.</li>
  <li>Kỹ năng giao tiếp, đàm phán và giải quyết tình huống nhanh nhẹn, chu đáo.</li>
  <li>Sử dụng thành thạo tin học văn phòng và có khả năng giao tiếp tiếng Anh cơ bản.</li>
</ul>"""
    job1_benefit = """<ul>
  <li>Thu nhập thỏa thuận từ 12.000.000 đến 22.000.000 đồng mỗi tháng tùy kinh nghiệm.</li>
  <li>Thưởng điều hành theo từng đoàn khách và thưởng kinh doanh hàng quý.</li>
  <li>Được tham gia các chuyến khảo sát tuyến điểm du lịch mới trong và ngoài nước.</li>
  <li>Đóng bảo hiểm xã hội đầy đủ theo quy định pháp luật.</li>
  <li>Môi trường làm việc năng động, tôn trọng năng lực cá nhân và nhiều cơ hội phát triển.</li>
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
            'academic_level': 3,
            'job_type': 1,
            'salary_min': 12000000,
            'salary_max': 22000000,
            'is_hot': True,
            'is_urgent': True,
            'status': var_sys.JobPostStatus.APPROVED,
            'contact_person_name': 'Phòng Tuyển Dụng Gold Lotus Travel',
            'contact_person_phone': '0866550402',
            'contact_person_email': 'info@goldlotustravel.com',
            'career': tourism_career,
            'location': location,
        }
    )
    print(f"Job 1: {job1.job_name} - Created: {job1_created}, Status: {job1.status}")

    job2_name = "Chuyên viên Tư vấn & Kinh doanh Tour Du lịch - Travel Consultant"
    job2_desc = """<p>Gold Lotus Travel mở rộng đội ngũ Chuyên viên Tư vấn và Kinh doanh Tour Du lịch phụ trách tư vấn sản phẩm lữ hành cao cấp cho khách hàng cá nhân và doanh nghiệp.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Tìm kiếm, tiếp cận và phát triển mạng lưới khách hàng có nhu cầu đi du lịch, nghỉ dưỡng, teambuilding hoặc sự kiện.</li>
  <li>Tư vấn lịch trình, dịch vụ khách sạn, vé máy bay và báo giá phù hợp với ngân sách của du khách.</li>
  <li>Đàm phán và tiến hành ký kết hợp đồng du lịch với khách hàng.</li>
  <li>Chăm sóc khách hàng chu đáo trước, trong và sau mỗi chuyến đi để xây dựng mối quan hệ dài lâu.</li>
  <li>Phối hợp cùng bộ phận Marketing để triển khai các chương trình kích cầu du lịch mùa cao điểm.</li>
</ul>"""
    job2_req = """<ul>
  <li>Đam mê lĩnh vực du lịch, ưu tiên ứng viên có kinh nghiệm sales tour, bán phòng khách sạn hoặc vé máy bay từ 6 tháng trở lên.</li>
  <li>Kỹ năng giao tiếp hoạt bát, giọng nói truyền cảm và khả năng thuyết phục khách hàng tốt.</li>
  <li>Tác phong làm việc chuyên nghiệp, kiên trì và định hướng kết quả cao.</li>
  <li>Chủ động, năng động và có tinh thần trách nhiệm với công việc.</li>
</ul>"""
    job2_benefit = """<ul>
  <li>Thu nhập hấp dẫn từ 15.000.000 đến 30.000.000 đồng mỗi tháng bao gồm lương cứng và hoa hồng doanh số không giới hạn.</li>
  <li>Chính sách thưởng nóng hàng tuần, hàng tháng cho cá nhân đạt thành tích xuất sắc.</li>
  <li>Cơ hội trải nghiệm dịch vụ nghỉ dưỡng tại các khách sạn, resort 4 đến 5 sao sang trọng hoàn toàn miễn phí.</li>
  <li>Được đào tạo kỹ năng bán hàng chuyên sâu và nghiệp vụ du lịch bài bản.</li>
  <li>Môi trường văn hóa trẻ trung, tôn vinh nỗ lực của từng cá nhân.</li>
</ul>"""

    job2, job2_created = JobPost.objects.get_or_create(
        company=company,
        job_name=job2_name,
        defaults={
            'user': user,
            'deadline': date.today() + timedelta(days=45),
            'quantity': 5,
            'job_description': job2_desc,
            'job_requirement': job2_req,
            'benefits_enjoyed': job2_benefit,
            'position': 1,
            'type_of_workplace': 1,
            'experience': 1,
            'academic_level': 3,
            'job_type': 1,
            'salary_min': 15000000,
            'salary_max': 30000000,
            'is_hot': False,
            'is_urgent': True,
            'status': var_sys.JobPostStatus.APPROVED,
            'contact_person_name': 'Phòng Tuyển Dụng Gold Lotus Travel',
            'contact_person_phone': '0866550402',
            'contact_person_email': 'info@goldlotustravel.com',
            'career': sales_career,
            'location': location,
        }
    )
    print(f"Job 2: {job2.job_name} - Created: {job2_created}, Status: {job2.status}")

    job3_name = "Hướng dẫn viên Du lịch Quốc tế & Nội địa"
    job3_desc = """<p>Gold Lotus Travel tuyển dụng Hướng dẫn viên Du lịch dẫn đoàn tham quan các tuyến điểm du lịch văn hóa, danh lam thắng cảnh trong nước và quốc tế.</p>
<h4>Trách nhiệm công việc:</h4>
<ul>
  <li>Đại diện cho công ty trực tiếp đón tiếp, đồng hành và hướng dẫn đoàn khách trong suốt chuyến hành trình.</li>
  <li>Thuyết minh giới thiệu về lịch sử, văn hóa, phong tục tập quán và nét đặc sắc tại các điểm tham quan.</li>
  <li>Tổ chức các hoạt động hoạt náo, kết nối các thành viên trong đoàn tạo không khí vui tươi, gắn kết.</li>
  <li>Quan tâm chu đáo đến sức khỏe, an toàn và hỗ trợ kịp thời mọi yêu cầu của du khách.</li>
  <li>Phối hợp cùng điều hành tour để bảo đảm dịch vụ ăn nghỉ, di chuyển diễn ra đúng kế hoạch.</li>
</ul>"""
    job3_req = """<ul>
  <li>Có thẻ Hướng dẫn viên du lịch nội địa hoặc quốc tế còn hiệu lực.</li>
  <li>Ngoại hình sáng, giao tiếp tự tin, giọng nói chuẩn và khả năng truyền cảm hứng tốt.</li>
  <li>Thành thạo kỹ năng hoạt náo và xử lý tình huống linh hoạt, bình tĩnh.</li>
  <li>Sức khỏe tốt, sẵn sàng đi công tác dài ngày theo lịch trình đoàn khách.</li>
  <li>Ưu tiên ứng viên có khả năng giao tiếp tốt bằng tiếng Anh, tiếng Trung hoặc tiếng Hàn.</li>
</ul>"""
    job3_benefit = """<ul>
  <li>Mức thù lao hấp dẫn từ 18.000.000 đến 35.000.000 đồng mỗi tháng tùy số lượng ngày tour cùng tiền tip và thưởng đoàn.</li>
  <li>Cơ hội khám phá các danh lam thắng cảnh tươi đẹp trên khắp Việt Nam và nhiều quốc gia trên thế giới.</li>
  <li>Được cấp đồng phục, thẻ công tác và chế độ bảo hiểm du lịch chuyên biệt.</li>
  <li>Lịch trình dẫn tour linh hoạt, phù hợp với nguyện vọng cá nhân.</li>
</ul>"""

    job3, job3_created = JobPost.objects.get_or_create(
        company=company,
        job_name=job3_name,
        defaults={
            'user': user,
            'deadline': date.today() + timedelta(days=45),
            'quantity': 4,
            'job_description': job3_desc,
            'job_requirement': job3_req,
            'benefits_enjoyed': job3_benefit,
            'position': 1,
            'type_of_workplace': 1,
            'experience': 2,
            'academic_level': 3,
            'job_type': 1,
            'salary_min': 18000000,
            'salary_max': 35000000,
            'is_hot': True,
            'is_urgent': False,
            'status': var_sys.JobPostStatus.APPROVED,
            'contact_person_name': 'Phòng Tuyển Dụng Gold Lotus Travel',
            'contact_person_phone': '0866550402',
            'contact_person_email': 'info@goldlotustravel.com',
            'career': cs_career,
            'location': location,
        }
    )
    print(f"Job 3: {job3.job_name} - Created: {job3_created}, Status: {job3.status}")

    print("=== SEEDING COMPLETED SUCCESSFULLY ===")


if __name__ == '__main__':
    run_seed()
