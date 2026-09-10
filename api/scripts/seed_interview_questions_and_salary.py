"""
Seed script: Populate realistic Interview Questions (with answer structure & tips)
and 2026 Market Salary Benchmarks.
"""

import os
import sys
import django

sys.path.insert(0, '/app')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.interviews.models import Question, SalaryBenchmark
from apps.common.models import Career

def seed_data():
    print("--- Seeding Interview Questions and Salary Benchmarks ---")

    # Get or create common careers
    careers = {}
    career_names = [
        ("Xây dựng - Kiến trúc", "xay-dung-kien-truc"),
        ("Thiết kế nội thất", "thiet-ke-noi-that"),
        ("Công nghệ thông tin", "cong-nghe-thong-tin"),
        ("Hành chính - Nhân sự", "hanh-chinh-nhan-su"),
        ("Kinh doanh - Bán hàng", "kinh-doanh-ban-hang"),
        ("Chăm sóc khách hàng", "cham-soc-khach-hang"),
        ("Tài chính - Kế toán", "tai-chinh-ke-toan"),
    ]

    for name, code in career_names:
        c, _ = Career.objects.get_or_create(name=name)
        careers[code] = c

    # 1. SEED QUESTIONS
    questions_data = [
        {
            "text": "Trong 1-2 năm tới, bạn hình dung mục tiêu nghề nghiệp của mình sẽ phát triển như thế nào và vị trí này phù hợp với định hướng đó ra sao?",
            "category": "behavioral",
            "difficulty": 2,
            "career": careers["cham-soc-khach-hang"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Nhà tuyển dụng muốn đánh giá tầm nhìn ngắn hạn, sự cam kết gắn bó và mức độ chủ động phát triển chuyên môn của ứng viên trong môi trường làm việc.",
            "answer_structure": {
                "start": "Bắt đầu bằng việc thể hiện sự hào hứng với vị trí và tầm nhìn của doanh nghiệp.",
                "steps": [
                    {"step": 1, "title": "Nêu rõ mục tiêu nghề nghiệp ngắn hạn (1-2 năm), tập trung vào việc làm chủ kỹ năng chuyên môn và hiểu sâu quy trình nghiệp vụ."},
                    {"step": 2, "title": "Giải thích lý do vị trí này tại công ty là bệ phóng lý tưởng, liên kết mục tiêu cá nhân với giá trị và dịch vụ của doanh nghiệp."},
                    {"step": 3, "title": "Thể hiện tinh thần sẵn sàng học hỏi, đóng góp năng suất và tham gia giải quyết bài toán thực tế của team."}
                ],
                "end": "Tái khẳng định sự quan tâm, cam kết gắn bó và đóng góp lâu dài cho sự thành công chung.",
                "time_guidance": "Phân bổ thời gian hợp lý cho mỗi phần, đảm bảo nói đủ ý trong 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Tránh câu trả lời quá chung chung như 'muốn học hỏi thật nhiều' mà hãy cụ thể kỹ năng bạn muốn nâng tầm."},
                {"priority": "HIGH", "text": "Nghiên cứu kỹ về lĩnh vực hoạt động của công ty để liên kết định hướng phát triển phù hợp."},
                {"priority": "MEDIUM", "text": "Nhấn mạnh tinh thần chủ động thích ứng và khả năng chịu áp lực trong công việc."}
            ],
            "follow_up_questions": [
                "Nếu kế hoạch của bạn gặp trở ngại lớn hoặc dự án bị thay đổi, bạn sẽ điều chỉnh như thế nào?",
                "Bạn đánh giá thế nào về sự cân bằng giữa phát triển chuyên môn cá nhân và mục tiêu kinh doanh của công ty?"
            ]
        },
        {
            "text": "Mức lương kỳ vọng của bạn là bao nhiêu và bạn dựa trên cơ sở nào để đưa ra con số này?",
            "category": "general",
            "difficulty": 2,
            "career": None,
            "default_duration_seconds": 90,
            "interviewer_intent": "Nhà tuyển dụng muốn biết liệu kỳ vọng tài chính của bạn có nằm trong khung ngân sách vị trí hay không, đồng thời đánh giá sự tự tin và hiểu biết về giá trị bản thân trên thị trường.",
            "answer_structure": {
                "start": "Bắt đầu bằng việc thể hiện sự hào hứng và ưu tiên hàng đầu là sự phù hợp công việc và giá trị mang lại.",
                "steps": [
                    {"step": 1, "title": "Đưa ra một khoảng lương kỳ vọng (range) thay vì một con số cứng nhắc, dựa trên nghiên cứu thị trường."},
                    {"step": 2, "title": "Giải thích ngắn gọn cơ sở: kỹ năng, kinh nghiệm thực tế, trách nhiệm đảm nhiệm và giá trị đóng góp."},
                    {"step": 3, "title": "Nhấn mạnh bạn hoàn toàn cởi mở và linh hoạt để trao đổi dựa trên tổng gói đãi ngộ (thưởng, phúc lợi, lộ trình thăng tiến)."}
                ],
                "end": "Khẳng định mong muốn tìm được tiếng nói chung cùng có lợi (win-win).",
                "time_guidance": "Trình bày tự tin, gãy gọn trong khoảng 60 - 90 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Nghiên cứu trước dải lương thị trường của vị trí theo năm 2026 để đưa ra khoảng giá hợp lý."},
                {"priority": "HIGH", "text": "Xác định khoảng lương có dải co giãn 15-20% để giữ thế chủ động khi đàm phán."},
                {"priority": "MEDIUM", "text": "Nhấn mạnh vào tổng thu nhập (Total Compensation) thay vì chỉ nhìn vào lương cứng."}
            ],
            "follow_up_questions": [
                "Nếu công ty đưa ra mức lương cứng thấp hơn 10% nhưng thưởng dự án hấp dẫn, bạn có sẵn sàng cân nhắc không?",
                "Mức lương gần đây nhất của bạn là bao nhiêu?"
            ]
        },
        {
            "text": "Khi chủ đầu tư hoặc khách hàng yêu cầu thay đổi thiết kế / hồ sơ thi công sát ngày bàn giao, bạn xử lý tình huống thế nào?",
            "category": "situational",
            "difficulty": 3,
            "career": careers["xay-dung-kien-truc"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá kỹ năng quản lý rủi ro dự án, năng lực đàm phán, tính kỷ luật về hồ sơ kỹ thuật và khả năng giữ bình tĩnh dưới áp lực tiến độ công trình.",
            "answer_structure": {
                "start": "Thể hiện thái độ lắng nghe, tôn trọng yêu cầu của khách hàng nhưng luôn bám sát an toàn và hợp đồng.",
                "steps": [
                    {"step": 1, "title": "Đánh giá nhanh mức độ ảnh hưởng (Impact Assessment): Kết cấu, tiến độ thi công, ngân sách phát sinh và an toàn công trình."},
                    {"step": 2, "title": "Tổ chức họp khẩn với Chỉ huy trưởng / các bộ môn liên quan (MEP, Kiến trúc, Dự toán) để lên 2 phương án khả thi kèm thời gian và chi phí."},
                    {"step": 3, "title": "Trình bày rõ ràng cho khách hàng: Phân tích đánh đổi giữa phương án A (làm ngay có phát sinh) và B (giữ nguyên bàn giao đợt 1 rồi cải tạo)."}
                ],
                "end": "Ký biên bản xác nhận hiện trường / phụ lục thay đổi trước khi triển khai thực địa để đảm bảo tính pháp lý.",
                "time_guidance": "Trả lời mạch lạc theo mô hình STAR (Situation - Task - Action - Result) trong 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Luôn nhấn mạnh tính pháp lý và hồ sơ biên bản thay đổi thiết kế (RFI / Change Order)."},
                {"priority": "HIGH", "text": "Thể hiện năng lực phối hợp đa bộ môn giữa Kiến trúc - Kết cấu - MEP."},
                {"priority": "MEDIUM", "text": "Đưa ra ví dụ thực tế về một công trình bạn đã từng xử lý thành công."}
            ],
            "follow_up_questions": [
                "Nếu khách hàng kiên quyết không chịu trả chi phí phát sinh thì bạn sẽ giải quyết ra sao?",
                "Bạn sử dụng phần mềm nào để kiểm soát xung đột bản vẽ (BIM / Revit / Navisworks)?"
            ]
        },
        {
            "text": "Hãy mô tả một dự án thi công nội thất phức tạp nhất mà bạn từng chủ trì hoặc tham gia, bài học rút ra là gì?",
            "category": "technical",
            "difficulty": 2,
            "career": careers["thiet-ke-noi-that"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Kiểm tra kinh nghiệm thực chiến từ bản vẽ thiết kế đến lắp đặt hoàn thiện tại xưởng và công trình, khả năng xử lý sai số vật liệu và quản lý nhà thầu phụ.",
            "answer_structure": {
                "start": "Giới thiệu ngắn gọn quy mô công trình (Căn hộ cao cấp, Villa hay Văn phòng), vai trò của bạn và ngân sách.",
                "steps": [
                    {"step": 1, "title": "Nêu thách thức lớn nhất của dự án (ví dụ: vật liệu đặc thù, trần uốn cong, ánh sáng gián tiếp hoặc tiến độ gấp)."},
                    {"step": 2, "title": "Trình bày giải pháp kỹ thuật bạn đã áp dụng: Khảo sát thực tế đo đạc 3D, bóc tách chi tiết bản vẽ shop-drawing, nghiệm thu mẫu mock-up tại xưởng."},
                    {"step": 3, "title": "Kết quả đạt được: Bàn giao đúng tiến độ, tỷ lệ lỗi dưới 2%, khách hàng hài lòng."}
                ],
                "end": "Rút ra bài học kinh nghiệm: 'Chính xác tại khâu chuẩn bị và mock-up là chìa khóa tiết kiệm 80% chi phí xử lý sai số tại công trường'.",
                "time_guidance": "Gói gọn trong 120 giây, làm nổi bật kỹ năng quản lý chất lượng."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Nêu rõ các vật liệu cao cấp bạn đã làm việc (Gỗ óc chó, đá nhân tạo Solid Surface, kim loại mạ PVD, Acrylic)."},
                {"priority": "MEDIUM", "text": "Nêu con số cụ thể về tiến độ hoặc chi phí để tăng sức thuyết phục."}
            ],
            "follow_up_questions": [
                "Bạn kiểm soát hao hụt vật tư nội thất bằng công cụ nào?",
                "Khi xưởng sản xuất sai kích thước so với bản vẽ hiện trạng, bạn quy trách nhiệm và khắc phục thế nào?"
            ]
        },
        {
            "text": "Khi gặp một lỗi hệ thống nghiêm trọng (Critical Bug / Outage) trên môi trường Production, quy trình ứng phó của bạn gồm những bước nào?",
            "category": "technical",
            "difficulty": 3,
            "career": careers["cong-nghe-thong-tin"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá tư duy phản ứng nhanh với sự cố (Incident Management), khả năng giữ bình tĩnh, quy trình rollback/hotfix và tinh thần trách nhiệm đối với SLA dịch vụ.",
            "answer_structure": {
                "start": "Khẳng định ưu tiên số 1 là 'Hạn chế tối đa gián đoạn dịch vụ và bảo vệ dữ liệu người dùng' trước khi đi tìm nguyên nhân sâu xa.",
                "steps": [
                    {"step": 1, "title": "Phân loại và cô lập sự cố: Kiểm tra log/monitoring (Datadog, Sentry, Grafana), kích hoạt kênh War Room thông báo cho các bên liên quan."},
                    {"step": 2, "title": "Khắc phục khẩn cấp: Rollback bản release gần nhất hoặc kích hoạt Circuit Breaker / trang bảo trì tạm thời để ngăn lỗi lan rộng."},
                    {"step": 3, "title": "Điều tra nguyên nhân gốc rễ (Root Cause Analysis - RCA) trên môi trường Staging/Dev, viết bài test bổ sung và chuẩn bị Hotfix theo quy trình CI/CD."}
                ],
                "end": "Tổ chức họp Post-mortem sau sự cố: Rút kinh nghiệm, cập nhật tài liệu Runbook và bổ sung monitoring cảnh báo sớm.",
                "time_guidance": "Trình bày theo các pha: Triage -> Mitigate -> Resolve -> Post-mortem trong 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Tuyệt đối không debug trực tiếp trên database production mà không có backup."},
                {"priority": "HIGH", "text": "Nhấn mạnh tầm quan trọng của việc giao tiếp minh bạch với khách hàng và cấp trên trong suốt sự cố."}
            ],
            "follow_up_questions": [
                "Bạn đã từng phải tự tay ra quyết định rollback một bản cập nhật lớn chưa?",
                "Làm sao để đảm bảo dữ liệu không bị thất thoát trong quá trình rollback DB?"
            ]
        }
    ]

    for q_data in questions_data:
        q, created = Question.objects.update_or_create(
            text=q_data["text"],
            defaults=q_data
        )
        print(f"  {'Created' if created else 'Updated'} Question: {q.text[:60]}...")

    # 2. SEED SALARY BENCHMARKS 2026
    salary_data = [
        # Xây dựng & Kiến trúc
        {"career": careers["xay-dung-kien-truc"], "position_title": "Kiến trúc sư chủ trì", "experience_level": "senior", "salary_min": 25000000, "salary_max": 50000000, "salary_avg": 35000000, "is_hot": True},
        {"career": careers["xay-dung-kien-truc"], "position_title": "Kiến trúc sư công trình", "experience_level": "mid", "salary_min": 14000000, "salary_max": 25000000, "salary_avg": 18000000, "is_hot": True},
        {"career": careers["xay-dung-kien-truc"], "position_title": "Kỹ sư kết cấu", "experience_level": "mid", "salary_min": 13000000, "salary_max": 24000000, "salary_avg": 17500000, "is_hot": False},
        {"career": careers["xay-dung-kien-truc"], "position_title": "Kỹ sư cơ điện (MEP)", "experience_level": "mid", "salary_min": 13500000, "salary_max": 26000000, "salary_avg": 18500000, "is_hot": True},
        {"career": careers["xay-dung-kien-truc"], "position_title": "Chỉ huy trưởng công trình", "experience_level": "lead", "salary_min": 35000000, "salary_max": 70000000, "salary_avg": 48000000, "is_hot": True},
        {"career": careers["xay-dung-kien-truc"], "position_title": "Kỹ sư giám sát thi công", "experience_level": "junior", "salary_min": 10000000, "salary_max": 18000000, "salary_avg": 13500000, "is_hot": False},
        {"career": careers["xay-dung-kien-truc"], "position_title": "Chuyên viên Dự toán (QS)", "experience_level": "mid", "salary_min": 12000000, "salary_max": 22000000, "salary_avg": 16000000, "is_hot": False},

        # Thiết kế nội thất
        {"career": careers["thiet-ke-noi-that"], "position_title": "Nhà thiết kế nội thất 3D", "experience_level": "mid", "salary_min": 12000000, "salary_max": 25000000, "salary_avg": 17000000, "is_hot": True},
        {"career": careers["thiet-ke-noi-that"], "position_title": "Giám sát hoàn thiện nội thất", "experience_level": "junior", "salary_min": 11000000, "salary_max": 18000000, "salary_avg": 14000000, "is_hot": False},
        {"career": careers["thiet-ke-noi-that"], "position_title": "Trưởng phòng thiết kế nội thất", "experience_level": "lead", "salary_min": 30000000, "salary_max": 60000000, "salary_avg": 42000000, "is_hot": True},

        # Công nghệ thông tin
        {"career": careers["cong-nghe-thong-tin"], "position_title": "Lập trình viên Frontend (React/Next)", "experience_level": "mid", "salary_min": 16000000, "salary_max": 35000000, "salary_avg": 24000000, "is_hot": True},
        {"career": careers["cong-nghe-thong-tin"], "position_title": "Lập trình viên Backend (Python/Django)", "experience_level": "mid", "salary_min": 18000000, "salary_max": 38000000, "salary_avg": 26000000, "is_hot": True},
        {"career": careers["cong-nghe-thong-tin"], "position_title": "Kỹ sư DevOps / Cloud", "experience_level": "senior", "salary_min": 25000000, "salary_max": 55000000, "salary_avg": 38000000, "is_hot": True},
        {"career": careers["cong-nghe-thong-tin"], "position_title": "Kỹ sư Trí tuệ nhân tạo (AI/LLM)", "experience_level": "senior", "salary_min": 30000000, "salary_max": 70000000, "salary_avg": 48000000, "is_hot": True},
        {"career": careers["cong-nghe-thong-tin"], "position_title": "Chuyên viên phân tích nghiệp vụ (BA)", "experience_level": "mid", "salary_min": 14000000, "salary_max": 30000000, "salary_avg": 20000000, "is_hot": False},

        # Hành chính - Nhân sự
        {"career": careers["hanh-chinh-nhan-su"], "position_title": "Chuyên viên Tuyển dụng (Recruiter)", "experience_level": "junior", "salary_min": 9000000, "salary_max": 16000000, "salary_avg": 12000000, "is_hot": False},
        {"career": careers["hanh-chinh-nhan-su"], "position_title": "Chuyên viên Tiền lương & Phúc lợi (C&B)", "experience_level": "mid", "salary_min": 14000000, "salary_max": 24000000, "salary_avg": 18000000, "is_hot": True},
        {"career": careers["hanh-chinh-nhan-su"], "position_title": "Trưởng phòng Nhân sự (HR Manager)", "experience_level": "lead", "salary_min": 25000000, "salary_max": 50000000, "salary_avg": 35000000, "is_hot": True},

        # Chăm sóc khách hàng & Kinh doanh
        {"career": careers["cham-soc-khach-hang"], "position_title": "Chuyên viên Chăm sóc khách hàng", "experience_level": "junior", "salary_min": 8000000, "salary_max": 14000000, "salary_avg": 10500000, "is_hot": False},
        {"career": careers["cham-soc-khach-hang"], "position_title": "Trưởng nhóm CSKH / Call Center", "experience_level": "mid", "salary_min": 15000000, "salary_max": 25000000, "salary_avg": 19000000, "is_hot": True},
        {"career": careers["kinh-doanh-ban-hang"], "position_title": "Chuyên viên Kinh doanh Dự án B2B", "experience_level": "mid", "salary_min": 12000000, "salary_max": 35000000, "salary_avg": 20000000, "is_hot": True},
    ]

    for s_data in salary_data:
        s, created = SalaryBenchmark.objects.update_or_create(
            position_title=s_data["position_title"],
            experience_level=s_data["experience_level"],
            year=2026,
            defaults=s_data
        )
        print(f"  {'Created' if created else 'Updated'} Salary Benchmark: {s.position_title} ({s.experience_level}): {s.salary_min:,} - {s.salary_max:,} VND")

    print("--- Seeding Completed Successfully! ---")

if __name__ == '__main__':
    seed_data()
