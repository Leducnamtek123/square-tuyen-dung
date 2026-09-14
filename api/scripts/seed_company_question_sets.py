"""
Seed script: Populate realistic Company Question Sets (Question Groups)
associated with real enterprises and careers for candidates to practice with AI.
"""

import os
import sys
import django

sys.path.insert(0, '/app')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.interviews.models import Question, QuestionGroup
from apps.profiles.models import Company
from apps.common.models import Career

def run():
    print("--- Seeding Company Question Sets ---")

    # 1. Ensure Careers
    career_xd, _ = Career.objects.get_or_create(name="Xây dựng - Kiến trúc")
    career_nt, _ = Career.objects.get_or_create(name="Thiết kế nội thất")
    career_it, _ = Career.objects.get_or_create(name="Công nghệ thông tin")
    career_kd, _ = Career.objects.get_or_create(name="Kinh doanh - Bán hàng")
    career_ns, _ = Career.objects.get_or_create(name="Hành chính - Nhân sự")

    # 2. Ensure Companies
    company_xd = Company.objects.filter(id=1).first()
    if not company_xd:
        company_xd = Company.objects.create(
            company_name="Square Construction & Design",
            slug="square-construction-design",
            field_operation="Xây dựng và Quản lý Dự án Công trình",
            employee_size="100-500",
            is_verified=True,
        )

    # All Question Sets are tied to the single flagship company: Square Construction & Design
    # (Square Group encompasses Architecture, Interior, Engineering, Technology, and Business divisions)


    # 3. Create Questions & Group 1: Xây dựng & Giám sát (Square Construction)
    q1_data = [
        {
            "text": "Khi chủ đầu tư yêu cầu thay đổi thiết kế thi công sát ngày bàn giao, bạn xử lý tình huống thế nào?",
            "category": "situational",
            "career": career_xd,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá kỹ năng quản lý rủi ro dự án, năng lực đàm phán và tính kỷ luật về hồ sơ kỹ thuật.",
            "answer_structure": {
                "start": "Lắng nghe kỹ yêu cầu từ chủ đầu tư nhưng giữ vững nguyên tắc an toàn kết cấu và hợp đồng.",
                "steps": [
                    {"step": 1, "title": "Đánh giá ngay mức độ ảnh hưởng đến kết cấu, an toàn lao động và thời gian hoàn thiện."},
                    {"step": 2, "title": "Lập 2 phương án khả thi kèm bảng dự toán phát sinh và tiến độ điều chỉnh."},
                    {"step": 3, "title": "Làm việc trực tiếp với đại diện chủ đầu tư để chốt phương án và ký biên bản hiện trường."}
                ],
                "end": "Yêu cầu văn bản phê duyệt chính thức trước khi chỉ đạo đội thi công triển khai thực địa."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Nhấn mạnh biên bản nghiệm thu thay đổi thiết kế để bảo vệ nhà thầu về mặt pháp lý."},
                {"priority": "MEDIUM", "text": "Thể hiện khả năng dung hòa giữa quyền lợi chủ đầu tư và giới hạn kỹ thuật."}
            ]
        },
        {
            "text": "Trình bày quy trình kiểm tra và nghiệm thu bê tông thương phẩm tại công trường trước khi đổ sàn.",
            "category": "technical",
            "career": career_xd,
            "company": company_xd,
            "default_duration_seconds": 150,
            "interviewer_intent": "Kiểm tra kiến thức quy chuẩn thi công, độ sụt và quy trình đúc mẫu thử nghiệm.",
            "answer_structure": {
                "start": "Nêu rõ tiêu chuẩn nghiệm thu bê tông hiện hành và kiểm tra niêm phong xe bồn.",
                "steps": [
                    {"step": 1, "title": "Kiểm tra phiếu xuất xưởng: mác bê tông, thời gian rời trạm và phụ gia sử dụng."},
                    {"step": 2, "title": "Thực hiện thí nghiệm đo độ sụt ngay tại hiện trường theo quy chuẩn."},
                    {"step": 3, "title": "Tiến hành đúc mẫu lưu bảo dưỡng đúng quy cách để nén mẫu 7 ngày và 28 ngày."}
                ],
                "end": "Chỉ ký lệnh cho phép đổ bê tông khi toàn bộ thông số đạt chuẩn kỹ thuật."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Tuyệt đối không cho phép thêm nước vào bồn bê tông tại công trường."},
                {"priority": "MEDIUM", "text": "Chú ý yếu tố thời gian kể từ lúc trộn tại trạm đến khi đổ vào cốp pha."}
            ]
        },
        {
            "text": "Nếu phát hiện nhà thầu phụ sử dụng vật liệu sai quy cách kỹ thuật, bạn sẽ xử lý ra sao?",
            "category": "situational",
            "career": career_xd,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá tính kiên quyết, đạo đức nghề nghiệp và kỹ năng giải quyết mâu thuẫn công trường.",
            "answer_structure": {
                "start": "Khẳng định lập trường ưu tiên chất lượng công trình và an toàn là trên hết.",
                "steps": [
                    {"step": 1, "title": "Lập biên bản đình chỉ thi công hạng mục liên quan ngay lập tức."},
                    {"step": 2, "title": "Yêu cầu chỉ huy trưởng thầu phụ giải trình và di dời vật tư không đạt ra khỏi công trường."},
                    {"step": 3, "title": "Báo cáo giám đốc dự án và giám sát việc thay thế vật tư đạt chuẩn phê duyệt."}
                ],
                "end": "Ghi nhận sự việc vào nhật ký công trình và đánh giá lại uy tín nhà thầu phụ."
            }
        },
        {
            "text": "Bạn quản lý tiến độ thi công và kiểm soát ngân sách của các gói thầu bằng công cụ hoặc phương pháp nào?",
            "category": "technical",
            "career": career_xd,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá năng lực quản lý dự án hiện đại, áp dụng phần mềm và sơ đồ tiến độ."
        },
        {
            "text": "Hãy chia sẻ một sự cố thi công bất ngờ bạn từng gặp và cách bạn cùng đội ngũ vượt qua khó khăn đó.",
            "category": "behavioral",
            "career": career_xd,
            "company": company_xd,
            "default_duration_seconds": 150,
            "interviewer_intent": "Đánh giá khả năng bình tĩnh, ứng biến và tinh thần trách nhiệm của người kỹ sư."
        },
        {
            "text": "Theo bạn, văn hóa an toàn lao động tại công trường cần được xây dựng và duy trì như thế nào?",
            "category": "culture_fit",
            "career": career_xd,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá nhận thức về bảo hộ lao động và tinh thần bảo vệ tính mạng con người."
        }
    ]

    q_xd_objs = []
    for q_data in q1_data:
        if "title" not in q_data:
            q_data["title"] = q_data["text"][:60]
        obj, _ = Question.objects.get_or_create(
            text=q_data["text"],
            defaults=q_data
        )
        q_xd_objs.append(obj)

    g1, _ = QuestionGroup.objects.get_or_create(
        name="Bộ câu hỏi Tuyển dụng Kỹ sư Giám sát Xây dựng & Kết cấu",
        defaults={
            "description": "Bộ tiêu chuẩn đánh giá năng lực giám sát hiện trường, kỹ thuật bê tông cốt thép, kiểm soát tiến độ và an toàn công trường chuẩn doanh nghiệp.",
            "company": company_xd,
        }
    )
    g1.questions.set(q_xd_objs)
    g1.save()

    # 4. Create Group 2: Lập trình viên Full-stack & Cloud (Square AI Technology)
    q2_data = [
        {
            "text": "Bạn thiết kế kiến trúc hệ thống như thế nào để đảm bảo khả năng chịu tải hàng trăm nghìn người dùng đồng thời?",
            "category": "technical",
            "career": career_it,
            "company": company_xd,
            "default_duration_seconds": 150,
            "interviewer_intent": "Đánh giá tư duy thiết kế hệ thống, microservices, caching đa tầng và cân bằng tải.",
            "answer_structure": {
                "start": "Nêu rõ nguyên tắc phân tách trách nhiệm giữa stateless application và stateful database.",
                "steps": [
                    {"step": 1, "title": "Tối ưu tầng cổng truy cập: CDN, API Gateway, Load Balancer phân luồng lưu lượng."},
                    {"step": 2, "title": "Chiến lược caching: In-memory cache với Redis, tối ưu query và cơ chế cache-aside."},
                    {"step": 3, "title": "Xử lý bất đồng bộ: Hàng đợi thông điệp Kafka hoặc RabbitMQ cho các tác vụ nặng."}
                ],
                "end": "Giám sát hiệu năng liên tục qua hệ thống APM, tracing và cảnh báo tự động."
            }
        },
        {
            "text": "Khi hệ thống gặp lỗi nghiêm trọng trên môi trường Production, quy trình xử lý sự cố của bạn gồm những bước nào?",
            "category": "situational",
            "career": career_it,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá quy trình phản ứng nhanh, kỹ năng khoanh vùng lỗi và tư duy phục hồi dịch vụ.",
            "answer_structure": {
                "start": "Ưu tiên hàng đầu là khôi phục dịch vụ cho người dùng trước khi tiến hành điều tra sâu.",
                "steps": [
                    {"step": 1, "title": "Kích hoạt cờ tính năng để tắt module lỗi hoặc rollback bản build ổn định trước đó."},
                    {"step": 2, "title": "Thu thập log, metric và tái hiện nguyên nhân gốc rễ trên môi trường Staging."},
                    {"step": 3, "title": "Phát hành bản vá khẩn cấp kèm kiểm thử hồi quy nghiêm ngặt."}
                ],
                "end": "Tổ chức buổi họp tổng kết sự cố nhằm cải tiến quy trình và ngăn ngừa lỗi tương tự."
            }
        },
        {
            "text": "Hãy giải thích sự khác biệt giữa SQL và NoSQL, và trường hợp thực tế nào bạn quyết định chọn mỗi loại?",
            "category": "technical",
            "career": career_it,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá nền tảng cơ sở dữ liệu, hiểu biết về tính toàn vẹn dữ liệu ACID và khả năng mở rộng."
        },
        {
            "text": "Bạn xử lý thế nào khi có bất đồng kỹ thuật sâu sắc với Tech Lead hoặc đồng nghiệp về một giải pháp kiến trúc?",
            "category": "behavioral",
            "career": career_it,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá tinh thần cộng tác, lắng nghe và khả năng thuyết phục bằng dữ liệu thực tế."
        },
        {
            "text": "Bạn làm thế nào để đảm bảo chất lượng code và bảo mật ứng dụng trước khi đưa lên môi trường thử nghiệm?",
            "category": "technical",
            "career": career_it,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Kiểm tra quy trình CI CD, Unit Testing, Code Review và quét lỗ hổng bảo mật tự động."
        },
        {
            "text": "Động lực nào thôi thúc bạn liên tục học hỏi các công nghệ mới và ứng dụng trí tuệ nhân tạo vào công việc?",
            "category": "culture_fit",
            "career": career_it,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá tinh thần cầu tiến, đam mê công nghệ và sự phù hợp với văn hóa đổi mới sáng tạo."
        }
    ]

    q_it_objs = []
    for q_data in q2_data:
        if "title" not in q_data:
            q_data["title"] = q_data["text"][:60]
        obj, _ = Question.objects.get_or_create(
            text=q_data["text"],
            defaults=q_data
        )
        q_it_objs.append(obj)

    g2, _ = QuestionGroup.objects.get_or_create(
        name="Bộ câu hỏi Tuyển dụng Kỹ sư Lập trình Full-stack & Cloud System",
        defaults={
            "description": "Bộ câu hỏi chuẩn kiểm tra tư duy kiến trúc phân tán, khả năng xử lý sự cố Production, tối ưu database và phong cách làm việc nhóm Agile.",
            "company": company_xd,
        }
    )
    g2.questions.set(q_it_objs)
    g2.save()

    # 5. Create Group 3: Thiết kế Kiến trúc & Nội thất (Square Studio)
    q3_data = [
        {
            "text": "Trình bày quy trình triển khai ý tưởng từ bản phác thảo concept ban đầu đến hồ sơ thiết kế kỹ thuật thi công.",
            "category": "technical",
            "career": career_nt,
            "company": company_xd,
            "default_duration_seconds": 150,
            "interviewer_intent": "Đánh giá tư duy không gian, quy trình sáng tạo và khả năng biến ý tưởng thành hồ sơ thi công thực tế."
        },
        {
            "text": "Khi khách hàng khăng khăng đưa ra yêu cầu thẩm mỹ không hợp lý hoặc lỗi thời, bạn tư vấn và thuyết phục như thế nào?",
            "category": "situational",
            "career": career_nt,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá sự khéo léo trong giao tiếp, thẩm mỹ chuyên nghiệp và khả năng bảo vệ ngôn ngữ thiết kế."
        },
        {
            "text": "Bạn cập nhật xu hướng vật liệu mới và các giải pháp tiết kiệm năng lượng xanh vào đồ án thiết kế ra sao?",
            "category": "technical",
            "career": career_nt,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá vốn hiểu biết về vật liệu kiến trúc, tính bền vững và sự am hiểu thị trường cao cấp."
        },
        {
            "text": "Kể về một dự án thiết kế khiến bạn tự hào nhất và những thách thức kỹ thuật lớn nhất bạn đã giải quyết.",
            "category": "behavioral",
            "career": career_nt,
            "company": company_xd,
            "default_duration_seconds": 150,
            "interviewer_intent": "Khám phá phong cách cá nhân, đam mê nghề nghiệp và kinh nghiệm thực chiến."
        },
        {
            "text": "Bạn phối hợp như thế nào với kỹ sư kết cấu và đội ngũ thi công nội thất để đảm bảo sản phẩm thực tế đúng bản vẽ?",
            "category": "situational",
            "career": career_nt,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá khả năng bám sát công trường và tinh thần hợp tác liên ngành."
        }
    ]

    q_studio_objs = []
    for q_data in q3_data:
        if "title" not in q_data:
            q_data["title"] = q_data["text"][:60]
        obj, _ = Question.objects.get_or_create(
            text=q_data["text"],
            defaults=q_data
        )
        q_studio_objs.append(obj)

    g3, _ = QuestionGroup.objects.get_or_create(
        name="Bộ câu hỏi Tuyển dụng Kiến trúc sư Thiết kế & Diễn họa Không gian",
        defaults={
            "description": "Đánh giá chuyên sâu tư duy thẩm mỹ, năng lực triển khai concept thành hiện thực, am hiểu vật liệu cao cấp và kỹ năng tư vấn khách hàng.",
            "company": company_xd,
        }
    )
    g3.questions.set(q_studio_objs)
    g3.save()

    # 6. Create Group 4: Kinh doanh B2B & Dự án (Square Global Corporation)
    q4_data = [
        {
            "text": "Hãy chia sẻ chiến lược tiếp cận và phát triển mối quan hệ với các khách hàng doanh nghiệp lớn trong giai đoạn đầu.",
            "category": "technical",
            "career": career_kd,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá tư duy phân tích thị trường, kỹ năng thấu hiểu chân dung khách hàng và phương pháp mở rộng mạng lưới B2B."
        },
        {
            "text": "Khi khách hàng doanh nghiệp so sánh giá của công ty bạn đắt hơn đối thủ cạnh tranh 20 phần trăm, bạn đàm phán thế nào?",
            "category": "situational",
            "career": career_kd,
            "company": company_xd,
            "default_duration_seconds": 150,
            "interviewer_intent": "Đánh giá năng lực làm nổi bật giá trị cốt lõi, dịch vụ hậu mãi và nghệ thuật thương lượng giá trị thay vì giá cả."
        },
        {
            "text": "Bạn xây dựng kế hoạch quản lý chỉ tiêu doanh số cá nhân và dự báo kết quả kinh doanh quý như thế nào?",
            "category": "technical",
            "career": career_kd,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá kỹ năng lập kế hoạch, kỷ luật mục tiêu và khả năng quản trị phễu bán hàng."
        },
        {
            "text": "Chia sẻ về một hợp đồng dự án bạn đã kiên trì theo đuổi và thuyết phục thành công sau nhiều lần bị từ chối.",
            "category": "behavioral",
            "career": career_kd,
            "company": company_xd,
            "default_duration_seconds": 150,
            "interviewer_intent": "Đánh giá sự bền bỉ, tính kiên trì và tư duy vượt qua trở ngại trong kinh doanh."
        },
        {
            "text": "Theo bạn, điều gì tạo nên uy tín lâu dài của một chuyên viên phát triển dự án chuyên nghiệp đối với khách hàng?",
            "category": "culture_fit",
            "career": career_kd,
            "company": company_xd,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá tính chính trực, tinh thần đồng hành cùng khách hàng và đạo đức nghề nghiệp."
        }
    ]

    q_corp_objs = []
    for q_data in q4_data:
        if "title" not in q_data:
            q_data["title"] = q_data["text"][:60]
        obj, _ = Question.objects.get_or_create(
            text=q_data["text"],
            defaults=q_data
        )
        q_corp_objs.append(obj)

    g4, _ = QuestionGroup.objects.get_or_create(
        name="Bộ câu hỏi Phỏng vấn Chuyên viên Kinh doanh B2B & Phát triển Dự án",
        defaults={
            "description": "Đánh giá kỹ năng thương thảo hợp đồng dự án, nghệ thuật làm nổi bật giá trị giải pháp, xử lý từ chối và xây dựng mối quan hệ khách hàng bền vững.",
            "company": company_xd,
        }
    )
    g4.questions.set(q_corp_objs)
    g4.save()

    # 7. Update the legacy architecture group to have professional title and full company link
    g_arch = QuestionGroup.objects.filter(id=16).first()
    if g_arch:
        g_arch.name = "Bộ câu hỏi Đánh giá Năng lực Kiến trúc sư Chủ trì Dự án"
        g_arch.description = "Khảo sát năng lực điều phối thiết kế tổng mặt bằng, bảo vệ phương án trước hội đồng và phối hợp thi công thực địa."
        g_arch.company = company_xd
        g_arch.save()

    print("Successfully seeded all Company Question Sets!")

if __name__ == "__main__":
    run()
