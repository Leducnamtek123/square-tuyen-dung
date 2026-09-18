"""
Seed script: Populate realistic Interview Questions (with answer structure & tips)
and 2026 Market Salary Benchmarks for all system careers.
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

    # Get or create common careers matching system database
    career_mappings = [
        ("Xây dựng - Kiến trúc", "xay-dung-kien-truc"),
        ("Thiết kế nội thất", "thiet-ke-noi-that"),
        ("Công nghệ thông tin", "cong-nghe-thong-tin"),
        ("Hành chính - Nhân sự", "hanh-chinh-nhan-su"),
        ("Kinh doanh - Bán hàng", "kinh-doanh-ban-hang"),
        ("Chăm sóc khách hàng", "cham-soc-khach-hang"),
        ("Tài chính - Kế toán", "tai-chinh-ke-toan"),
        ("Bất động sản", "bat-dong-san"),
    ]

    careers = {}
    for name, code in career_mappings:
        c, _ = Career.objects.get_or_create(name=name)
        careers[code] = c

    # 1. COMPREHENSIVE SEED QUESTIONS PER CAREER
    questions_data = [
        # ─── XÂY DỰNG - KIẾN TRÚC ──────────────────────────────────────────
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
                    {"step": 3, "title": "Trình bày rõ ràng cho khách hàng: Phân tích đánh đổi giữa phương án làm ngay (có phát sinh và gia hạn) hoặc hoàn thành đợt 1 rồi cải tạo bổ sung."}
                ],
                "end": "Ký biên bản xác nhận hiện trường / phụ lục thay đổi (Change Order) trước khi triển khai thực địa để đảm bảo tính pháp lý.",
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
            "text": "Bạn quản lý tiến độ và kiểm soát chất lượng hồ sơ bản vẽ thi công như thế nào để hạn chế sai sót khi ra hiện trường?",
            "category": "technical",
            "difficulty": 2,
            "career": careers["xay-dung-kien-truc"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Kiểm tra quy trình QA/QC hồ sơ thiết kế, tính cẩn trọng và kinh nghiệm thực chiến giám sát tác giả của kỹ sư/KTS.",
            "answer_structure": {
                "start": "Khẳng định chất lượng hồ sơ bản vẽ là yếu tố quyết định 70% tiến độ và chi phí công trình ngoài thực tế.",
                "steps": [
                    {"step": 1, "title": "Thiết lập quy trình Checklist kiểm soát chéo (Cross-check) giữa bản vẽ kiến trúc, kết cấu và hệ thống MEP trước khi phát hành."},
                    {"step": 2, "title": "Áp dụng mô hình thông tin công trình (BIM/Revit) để phát hiện và xử lý tự động các va chạm (Clash Detection)."},
                    {"step": 3, "title": "Tổ chức họp bàn giao hồ sơ thiết kế kỹ thuật cho ban chỉ huy công trường và lập nhật ký giám sát tác giả định kỳ."}
                ],
                "end": "Tổng kết kinh nghiệm giảm tỷ lệ sai sót bản vẽ xuống dưới 3% trong các dự án trước đây.",
                "time_guidance": "Trình bày cấu trúc rõ ràng trong 90 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Đề cập cụ thể các công cụ quản lý dự án hoặc phần mềm kiểm soát xung đột (Revit, Navisworks, BIM 360)."},
                {"priority": "MEDIUM", "text": "Nhấn mạnh vai trò của việc khảo sát thực địa hiện trạng trước khi chốt bản vẽ thi công."}
            ],
            "follow_up_questions": [
                "Khi thợ thi công phản ánh bản vẽ không thể lắp đặt được thì bạn xử lý tại hiện trường thế nào?",
                "Kinh nghiệm bóc tách khối lượng và kiểm tra sai lệch so với dự toán ban đầu của bạn ra sao?"
            ]
        },
        {
            "text": "Khi có sự bất đồng ý kiến giữa thiết kế ý tưởng của kiến trúc sư và tính khả thi kết cấu/MEP, bạn xử lý như thế nào?",
            "category": "situational",
            "difficulty": 2,
            "career": careers["xay-dung-kien-truc"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá kỹ năng làm việc nhóm liên phòng ban, tư duy cân bằng giữa thẩm mỹ kiến trúc và tính an toàn kỹ thuật.",
            "answer_structure": {
                "start": "Bất đồng chuyên môn là điều tất yếu và là cơ hội để tìm ra giải pháp tối ưu nhất cho công trình.",
                "steps": [
                    {"step": 1, "title": "Lắng nghe luận điểm kỹ thuật của kỹ sư kết cấu/MEP và làm rõ mục tiêu thẩm mỹ cốt lõi của phương án kiến trúc."},
                    {"step": 2, "title": "Cùng nhau Brainstorm tìm phương án kỹ thuật thay thế (ví dụ: thay đổi vị trí hộp kỹ thuật, sử dụng kết cấu thép phụ trợ hoặc dầm bẹt)."},
                    {"step": 3, "title": "Đánh giá chi phí phát sinh và tác động không gian của từng giải pháp để thống nhất phương án win-win."}
                ],
                "end": "Thống nhất ghi biên bản cuộc họp kỹ thuật nội bộ trước khi báo cáo lên Giám đốc dự án hoặc Chủ đầu tư.",
                "time_guidance": "Trình bày tự tin trong 90 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Tuyệt đối không đổ lỗi cho bộ môn khác mà nhấn mạnh tinh thần hợp tác tìm giải pháp."},
                {"priority": "MEDIUM", "text": "Luôn giữ nguyên tắc an toàn chịu lực công trình là ưu tiên số 1."}
            ],
            "follow_up_questions": [
                "Đã bao giờ bạn phải hy sinh hoàn toàn một ý tưởng tâm đắc vì lý do an toàn kết cấu chưa?"
            ]
        },

        # ─── THIẾT KẾ NỘI THẤT ──────────────────────────────────────────
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
            "text": "Quy trình làm việc của bạn với khách hàng từ khâu lên Moodboard, 3D Concept cho đến giai đoạn chốt vật liệu thực tế diễn ra như thế nào?",
            "category": "situational",
            "difficulty": 2,
            "career": careers["thiet-ke-noi-that"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá kỹ năng tư vấn tâm lý khách hàng, khả năng hiện thực hóa gu thẩm mỹ thành công năng và kiểm soát kỳ vọng ngân sách.",
            "answer_structure": {
                "start": "Khẳng định quy trình tư vấn bài bản giúp khách hàng hình dung rõ nét và giảm thiểu tối đa việc sửa đổi phương án 3D.",
                "steps": [
                    {"step": 1, "title": "Giai đoạn thấu hiểu: Khảo sát thói quen sinh hoạt, nhu cầu công năng, phong cách ưa thích và hạn mức tài chính."},
                    {"step": 2, "title": "Moodboard & Mặt bằng 2D: Thống nhất bố cục giao thông, ánh sáng và bảng màu chủ đạo trước khi dựng phối cảnh 3D."},
                    {"step": 3, "title": "Trình mẫu vật liệu thực tế (Material Board): Cùng khách hàng sờ và cảm nhận vân gỗ, mẫu đá, vải nỉ và phụ kiện ray trượt trước khi ký duyệt sản xuất."}
                ],
                "end": "Chốt hồ sơ thi công hoàn chỉnh kèm cam kết vật liệu trùng khớp 100% so với mẫu đã duyệt.",
                "time_guidance": "Trình bày mạch lạc trong 100 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Nhấn mạnh việc kiểm soát ngân sách ngay từ đầu để tránh phương án 3D quá đắt khách không đủ tiền làm."},
                {"priority": "MEDIUM", "text": "Nêu rõ nguyên tắc 'Duyệt mẫu thực tế trước khi bấm máy sản xuất xưởng'."}
            ],
            "follow_up_questions": [
                "Khi khách hàng thích mẫu 3D nhưng ngân sách không cho phép sử dụng vật liệu cao cấp, bạn tư vấn giải pháp thay thế ra sao?"
            ]
        },
        {
            "text": "Bạn thường phối hợp ánh sáng (Lighting Design) trong không gian nội thất như thế nào để tạo chiều sâu và nâng tầm cảm xúc căn nhà?",
            "category": "technical",
            "difficulty": 2,
            "career": careers["thiet-ke-noi-that"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Kiểm tra kiến thức chuyên sâu về thiết kế chiếu sáng: phân lớp ánh sáng, nhiệt độ màu, chỉ số CRI và tích hợp hệ thống Smarthome.",
            "answer_structure": {
                "start": "Ánh sáng là 'linh hồn' của nội thất, quyết định 50% cảm xúc và vẻ đẹp của vật liệu.",
                "steps": [
                    {"step": 1, "title": "Phân tầng ánh sáng 3 lớp chuẩn: Ánh sáng tổng thể (Ambient), Ánh sáng công năng (Task) và Ánh sáng điểm nhấn (Accent)."},
                    {"step": 2, "title": "Lựa chọn nhiệt độ màu (CCT) phù hợp từng không gian: 3000K ấm cúng cho phòng ngủ, 4000K tự nhiên cho phòng làm việc và bếp."},
                    {"step": 3, "title": "Ưu tiên chỉ số hoàn màu CRI > 90 cho khu vực trưng bày và sử dụng giải pháp đèn gián tiếp (Cove Light, nam châm từ tính) chống chói."}
                ],
                "end": "Tích hợp kịch bản chiếu sáng thông minh (Scenes) tạo trải nghiệm tiện nghi vượt trội cho gia chủ.",
                "time_guidance": "Trình bày chuyên nghiệp trong 90 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Sử dụng đúng thuật ngữ chuyên môn: CRI, Lumen, Lux, CCT, Anti-glare."},
                {"priority": "MEDIUM", "text": "Tránh lạm dụng đèn downlight rải đều trên trần nhà mà phải có sự tương phản sáng - tối có chủ đích."}
            ],
            "follow_up_questions": [
                "Làm thế nào để tính toán công suất chiếu sáng vừa đủ cho một căn phòng 30m2 mà không bị thừa sáng?"
            ]
        },

        # ─── CÔNG NGHỆ THÔNG TIN ──────────────────────────────────────────
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
        },
        {
            "text": "Làm thế nào để tối ưu hóa hiệu năng ứng dụng web (Next.js / React) đạt chuẩn Core Web Vitals (LCP, INP, CLS)?",
            "category": "technical",
            "difficulty": 3,
            "career": careers["cong-nghe-thong-tin"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá năng lực tối ưu frontend, kiến trúc Server/Client Component và hiểu biết sâu sắc về trải nghiệm người dùng.",
            "answer_structure": {
                "start": "Định nghĩa mục tiêu tối ưu theo 3 chỉ số cốt lõi của Google: LCP dưới 2.5s, INP dưới 200ms và CLS dưới 0.1.",
                "steps": [
                    {"step": 1, "title": "Tối ưu LCP: Ưu tiên Server-Side Rendering (SSR), preload critical images, loại bỏ Async Waterfall bằng Promise.all song song."},
                    {"step": 2, "title": "Tối ưu INP: Chia nhỏ Long Tasks trên Main Thread, dùng React Transitions (useTransition) và dynamic import cho các thư viện nặng."},
                    {"step": 3, "title": "Tối ưu CLS: Luôn set kích thước cố định (width/height hoặc aspect-ratio) cho ảnh/banner và font-display: optional."}
                ],
                "end": "Đo lường kiểm chứng bằng Chrome DevTools Lighthouse và thiết lập Real User Monitoring (RUM).",
                "time_guidance": "Trình bày cấu trúc khoa học trong 100 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Dẫn chứng các con số đo đạc thực tế trước và sau tối ưu trong dự án bạn từng làm."},
                {"priority": "MEDIUM", "text": "Nhắc đến các công cụ profiling: Performance Tab, Web Vitals Extension, bundle-analyzer."}
            ],
            "follow_up_questions": [
                "Bạn xử lý vấn đề hydration mismatch trong Next.js như thế nào?"
            ]
        },
        {
            "text": "Làm thế nào để thiết kế một hệ thống Backend có khả năng chịu tải cao (High Concurrency) và khả mở (Scalability)?",
            "category": "technical",
            "difficulty": 3,
            "career": careers["cong-nghe-thong-tin"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Kiểm tra tư duy kiến trúc hệ thống phân tán, caching strategy, message queue và database partitioning.",
            "answer_structure": {
                "start": "Xác định rõ ràng các chỉ số NFRs: QPS mong đợi, latency chấp nhận và tính sẵn sàng 99.99%.",
                "steps": [
                    {"step": 1, "title": "Thiết kế Stateless Backend: Cho phép Scale ngang (Horizontal Auto-scaling) đằng sau Load Balancer (Nginx / ALB)."},
                    {"step": 2, "title": "Chiến lược Caching đa tầng: Redis cache (Cache-Aside / Write-Through) kết hợp CDN cho nội dung tĩnh để giảm tải trực tiếp vào DB."},
                    {"step": 3, "title": "Bất đồng bộ hóa (Asynchronous Processing): Đẩy các tác vụ nặng vào Message Queue (RabbitMQ, Kafka, Celery) để xử lý nền."}
                ],
                "end": "Tối ưu database bằng Read/Write Replicas, indexing chuẩn xác và connection pooling.",
                "time_guidance": "Gói gọn trong 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Đề cập đến bài toán Cache Invalidation và phòng chống Cache Stampede / Thundering Herd."},
                {"priority": "MEDIUM", "text": "Nhấn mạnh giám sát APM và Circuit Breaker để bảo vệ hệ thống khi phụ thuộc bên ngoài bị chậm."}
            ],
            "follow_up_questions": [
                "Bạn xử lý Distributed Transaction giữa các microservice bằng cơ chế nào (Saga pattern hay 2PC)?"
            ]
        },

        # ─── HÀNH CHÍNH - NHÂN SỰ ──────────────────────────────────────────
        {
            "text": "Khi công ty cần tuyển dụng gấp các vị trí cấp cao hoặc vị trí kỹ thuật đặc thù có nguồn cung khan hiếm, bạn xây dựng chiến lược Sourcing ra sao?",
            "category": "technical",
            "difficulty": 2,
            "career": careers["hanh-chinh-nhan-su"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá năng lực Headhunting, tư duy đa kênh tuyển dụng, kỹ năng Talent Mapping và tạo nguồn ứng viên thụ động.",
            "answer_structure": {
                "start": "Tuyển dụng vị trí khó đòi hỏi chuyển từ thế bị động đăng tin sang chủ động tiếp cận (Direct Sourcing) và xây dựng mối quan hệ.",
                "steps": [
                    {"step": 1, "title": "Họp Alignment với Hiring Manager: Chốt rõ Profile ứng viên lý tưởng (Persona), phân biệt giữa 'Must-have' và 'Nice-to-have'."},
                    {"step": 2, "title": "Talent Mapping & Đa dạng kênh: Khai thác LinkedIn Recruiter, GitHub, các cộng đồng chuyên môn kín và chương trình nội bộ Employee Referral."},
                    {"step": 3, "title": "Xây dựng kịch bản Cold Outreach cá nhân hóa: Nhấn mạnh giá trị dự án, văn hóa cởi mở và gói đãi ngộ hấp dẫn thay vì gửi tin nhắn mẫu chung chung."}
                ],
                "end": "Duy trì Talent Pool tương tác định kỳ để rút ngắn thời gian lấp đầy vị trí (Time-to-fill) xuống 30%.",
                "time_guidance": "Trình bày tự tin trong 90 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Đưa ra tỷ lệ phản hồi (Response Rate) mà bạn từng đạt được khi tiếp cận ứng viên cao cấp."},
                {"priority": "MEDIUM", "text": "Nhấn mạnh vai trò của Employer Branding trong việc thu hút nhân tài."}
            ],
            "follow_up_questions": [
                "Nếu ứng viên từ chối Offer vào phút chót, bạn xử lý thế nào để không làm gián đoạn kế hoạch nhân sự?"
            ]
        },
        {
            "text": "Khi phát sinh xung đột căng thẳng giữa một nhân viên chủ chốt và người quản lý trực tiếp, vai trò HR Business Partner của bạn sẽ can thiệp thế nào?",
            "category": "situational",
            "difficulty": 2,
            "career": careers["hanh-chinh-nhan-su"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá sự khách quan, kỹ năng hòa giải xung đột (Mediation) và khả năng giữ chân nhân tài mà không phá vỡ nguyên tắc quản lý.",
            "answer_structure": {
                "start": "HR đóng vai trò là cầu nối trung lập, lắng nghe đa chiều để bảo vệ lợi ích công bằng và môi trường làm việc lành mạnh.",
                "steps": [
                    {"step": 1, "title": "Gặp riêng 1-on-1 với từng bên trong không gian bảo mật: Lắng nghe không phán xét để tách bạch giữa cảm xúc cá nhân và mâu thuẫn công việc."},
                    {"step": 2, "title": "Phân tích nguyên nhân gốc rễ: Do thiếu rõ ràng về mục tiêu KPI, phong cách giao tiếp hay phân bổ khối lượng công việc không cân đối."},
                    {"step": 3, "title": "Tổ chức buổi đối thoại 3 bên có điều hướng: Thống nhất các nguyên tắc phối hợp mới (Working Agreement) và cam kết bằng văn bản ngắn."}
                ],
                "end": "Theo dõi định kỳ sau 2 tuần và 1 tháng để đảm bảo mối quan hệ công việc được cải thiện bền vững.",
                "time_guidance": "Gói gọn trong 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Tuyệt đối không để cảm xúc cá nhân chi phối hoặc đứng về một phía."},
                {"priority": "MEDIUM", "text": "Luôn hướng các bên tập trung vào mục tiêu chung của tổ chức thay vì thắng - thua."}
            ],
            "follow_up_questions": [
                "Nếu xung đột không thể giải quyết thì giải pháp luân chuyển phòng ban được bạn cân nhắc trong điều kiện nào?"
            ]
        },

        # ─── KINH DOANH - BÁN HÀNG ──────────────────────────────────────────
        {
            "text": "Khi khách hàng doanh nghiệp (B2B) so sánh giá của công ty bạn đắt hơn 20% so với đối thủ và yêu cầu giảm giá, bạn đàm phán ra sao?",
            "category": "situational",
            "difficulty": 2,
            "career": careers["kinh-doanh-ban-hang"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá kỹ năng bán hàng dựa trên giá trị (Value-based Selling), năng lực đàm phán bảo vệ biên lợi nhuận và xử lý từ chối chuyên nghiệp.",
            "answer_structure": {
                "start": "Không vội vàng giảm giá ngay mà đồng cảm với sự quan tâm của khách hàng về chi phí đầu tư.",
                "steps": [
                    {"step": 1, "title": "Làm rõ phạm vi so sánh (Apple-to-Apple): Phân tích điểm khác biệt về chất lượng vật tư, tiến độ cam kết, chính sách bảo hành và rủi ro tiềm ẩn khi chọn giá rẻ."},
                    {"step": 2, "title": "Chứng minh tổng chi phí sở hữu (Total Cost of Ownership - TCO): Chỉ ra việc tiết kiệm 20% ban đầu có thể dẫn đến phát sinh chi phí sửa chữa gấp 2-3 lần sau này."},
                    {"step": 3, "title": "Đưa ra giải pháp linh hoạt: Nếu khách hàng thực sự hạn chế ngân sách, điều chỉnh phạm vi công việc (Scope) hoặc cơ cấu thanh toán thay vì hạ giá dịch vụ."}
                ],
                "end": "Chốt thỏa thuận đôi bên cùng có lợi và bảo vệ giá trị cốt lõi của công ty.",
                "time_guidance": "Trình bày mạch lạc, tự tin trong 90 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Tập trung vào 'Giá trị mang lại' (ROI) thay vì tranh cãi về giá bán."},
                {"priority": "MEDIUM", "text": "Chuẩn bị sẵn các Case Study khách hàng từng dùng giải pháp giá rẻ và quay lại lựa chọn công ty bạn."}
            ],
            "follow_up_questions": [
                "Nếu khách hàng nói đối thủ có cùng chất lượng 100% thì bạn chứng minh sự khác biệt thế nào?"
            ]
        },
        {
            "text": "Hãy chia sẻ quy trình xây dựng phễu bán hàng (Sales Pipeline) và cách bạn nuôi dưỡng khách hàng tiềm năng đến khi chốt hợp đồng?",
            "category": "technical",
            "difficulty": 2,
            "career": careers["kinh-doanh-ban-hang"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Kiểm tra tính kỷ luật trong quản lý dữ liệu bán hàng (CRM), năng lực sàng lọc Lead chất lượng và kỹ thuật Closing hợp đồng.",
            "answer_structure": {
                "start": "Một phễu bán hàng khoa học là chìa khóa duy trì doanh số ổn định và dự báo chính xác kết quả kinh doanh.",
                "steps": [
                    {"step": 1, "title": "Sàng lọc Lead (Qualification): Áp dụng tiêu chuẩn BANT (Budget, Authority, Need, Timeline) để phân loại khách hàng tiềm năng cao."},
                    {"step": 2, "title": "Khám phá & Đề xuất giải pháp (Discovery & Proposal): Thiết kế giải pháp may đo sát với 'nỗi đau' thực tế của khách hàng kèm bảng tính hiệu quả."},
                    {"step": 3, "title": "Theo dõi sát sao (Follow-up Cadence): Sử dụng CRM gửi tài liệu chuyên sâu, phản hồi thắc mắc trong vòng 2 giờ và kích hoạt các ưu đãi có thời hạn."}
                ],
                "end": "Chốt đơn hàng (Closing) và chuyển giao hồ sơ suôn sẻ sang bộ phận triển khai chăm sóc sau bán.",
                "time_guidance": "Trình bày mạch lạc trong 100 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Nêu rõ tỷ lệ chuyển đổi (Conversion Rate) ở từng giai đoạn của phễu."},
                {"priority": "MEDIUM", "text": "Nhấn mạnh sự kiên trì và kỷ luật cập nhật trạng thái trên phần mềm CRM."}
            ],
            "follow_up_questions": [
                "Làm thế nào để bạn nhận biết một thương vụ đã 'nguội' và quyết định ngừng theo đuổi để tối ưu thời gian?"
            ]
        },

        # ─── CHĂM SÓC KHÁCH HÀNG ──────────────────────────────────────────
        {
            "text": "Khi gặp một khách hàng đang vô cùng giận dữ và la mắng gay gắt vì sự cố dịch vụ, quy trình xử lý khủng hoảng của bạn ra sao?",
            "category": "situational",
            "difficulty": 2,
            "career": careers["cham-soc-khach-hang"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá chỉ số EQ, kỹ năng kiểm soát cảm xúc, năng lực lắng nghe tích cực và nghệ thuật xoa dịu khách hàng khó tính.",
            "answer_structure": {
                "start": "Nguyên tắc cốt lõi: 'Khách hàng giận dữ vì vấn đề họ gặp phải chứ không phải vì bản thân bạn. Bình tĩnh là chìa khóa kiểm soát tình hình'.",
                "steps": [
                    {"step": 1, "title": "Lắng nghe chủ động và đồng cảm (Empathy): Để khách hàng giải tỏa hết bức xúc mà không ngắt lời, dùng các câu thấu cảm chân thành."},
                    {"step": 2, "title": "Tách bạch vấn đề & Xác nhận lại thông tin: Ghi nhận sự cố cụ thể, gửi lời xin lỗi chân thành về trải nghiệm không tốt và không đổ lỗi cho các bộ phận khác."},
                    {"step": 3, "title": "Hành động khắc phục có hạn định (Action Plan): Đưa ra giải pháp xử lý ngay lập tức và cam kết thời gian hoàn thành cụ thể (trong vòng 30 phút - 2 giờ)."}
                ],
                "end": "Theo dõi sau sự cố (Follow-up): Gọi điện hỏi thăm khi vấn đề đã được khắc phục hoàn toàn và gửi quà tặng tri ân.",
                "time_guidance": "Trình bày theo mô hình LAST (Listen - Apologize - Solve - Thank) trong 100 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Tuyệt đối không dùng những câu máy móc như 'quy định của công ty là...'."},
                {"priority": "MEDIUM", "text": "Giữ tông giọng ấm áp, vững vàng và từ tốn để hạ nhiệt bầu không khí."}
            ],
            "follow_up_questions": [
                "Nếu lỗi thuộc về chính khách hàng nhưng họ vẫn đổ lỗi cho công ty thì bạn giải thích như thế nào?"
            ]
        },

        # ─── TÀI CHÍNH - KẾ TOÁN ──────────────────────────────────────────
        {
            "text": "Làm thế nào để bạn kiểm soát và đối soát số liệu sổ sách kế toán đảm bảo tuân thủ chuẩn mực và sẵn sàng cho kỳ quyết toán thuế?",
            "category": "technical",
            "difficulty": 3,
            "career": careers["tai-chinh-ke-toan"],
            "default_duration_seconds": 120,
            "interviewer_intent": "Kiểm tra tính chính xác, am hiểu luật thuế hiện hành, quy trình kiểm soát rủi ro chứng từ và lập báo cáo tài chính.",
            "answer_structure": {
                "start": "Tính trung thực và chuẩn xác của số liệu kế toán là nền tảng bảo vệ doanh nghiệp trước các rủi ro pháp lý và phạt thuế.",
                "steps": [
                    {"step": 1, "title": "Kiểm soát tính hợp lệ của hóa đơn, chứng từ đầu vào/đầu ra: Đối chiếu trên hệ thống hóa đơn điện tử của Tổng cục Thuế."},
                    {"step": 2, "title": "Khóa sổ và đối chiếu tài khoản định kỳ hàng tháng (Reconciliation): Số dư ngân hàng, công nợ phải thu/phải trả, hàng tồn kho và tài sản cố định."},
                    {"step": 3, "title": "Rà soát chi phí không được trừ khi tính thuế TNDN và chuẩn bị hồ sơ giải trình chi tiết kèm hợp đồng, biên bản nghiệm thu."}
                ],
                "end": "Lập Báo cáo tài chính hoàn chỉnh và thực hiện Pre-audit nội bộ trước kỳ kiểm toán chính thức.",
                "time_guidance": "Gãy gọn, chính xác trong 100 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Luôn cập nhật các thông tư, nghị định thuế mới nhất có hiệu lực."},
                {"priority": "MEDIUM", "text": "Nhấn mạnh thói quen lưu trữ hồ sơ chứng từ khoa học cả bản cứng lẫn dữ liệu số."}
            ],
            "follow_up_questions": [
                "Khi phát hiện sai sót số liệu từ các năm trước đã nộp báo cáo, bạn xử lý kê khai bổ sung ra sao?"
            ]
        },

        # ─── CÂU HỎI KỸ NĂNG MỀM & ĐỊNH HƯỚNG CHUNG (UNIVERSAL) ──────────
        {
            "text": "Hãy giới thiệu bản thân và nêu rõ lý do bạn quan tâm, ứng tuyển vào vị trí này tại công ty?",
            "category": "general",
            "difficulty": 1,
            "career": None,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá khả năng tổng hợp thông tin cá nhân, sự tự tin, mức độ tìm hiểu về doanh nghiệp và mức độ phù hợp văn hóa.",
            "answer_structure": {
                "start": "Chào hỏi lịch sự, giới thiệu họ tên, chuyên ngành đào tạo và số năm kinh nghiệm nổi bật.",
                "steps": [
                    {"step": 1, "title": "Điểm lại 2 thành tựu nghề nghiệp tiêu biểu nhất gắn liền với thế mạnh chuyên môn của bạn."},
                    {"step": 2, "title": "Nêu lý do công ty và vị trí này là điểm đến lý tưởng: Giá trị sản phẩm, văn hóa làm việc và cơ hội đóng góp."},
                    {"step": 3, "title": "Khẳng định giá trị bạn có thể đóng góp ngay lập tức vào hiệu suất của đội ngũ trong 90 ngày đầu tiên."}
                ],
                "end": "Bày tỏ sự hào hứng và sẵn sàng trao đổi chi tiết hơn trong buổi phỏng vấn.",
                "time_guidance": "Nói trôi chảy, súc tích trong 90 - 120 giây. Tránh đọc lại y nguyên CV."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Dành 30 giây đầu tạo ấn tượng tích cực về năng lượng và sự chuyên nghiệp."},
                {"priority": "MEDIUM", "text": "Cá nhân hóa lý do chọn công ty thay vì nói các lý do chung chung có thể áp dụng cho bất kỳ đâu."}
            ],
            "follow_up_questions": [
                "Điều gì khiến bạn nghĩ bạn nổi bật hơn các ứng viên khác cùng ứng tuyển?"
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
            "text": "Trong 1-2 năm tới, bạn hình dung mục tiêu nghề nghiệp của mình sẽ phát triển như thế nào và vị trí này phù hợp với định hướng đó ra sao?",
            "category": "behavioral",
            "difficulty": 2,
            "career": None,
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
                {"priority": "HIGH", "text": "Nghiên cứu kỹ về lĩnh vực hoạt động của công ty để liên kết định hướng phát triển phù hợp."}
            ],
            "follow_up_questions": [
                "Nếu kế hoạch của bạn gặp trở ngại lớn hoặc dự án bị thay đổi, bạn sẽ điều chỉnh như thế nào?"
            ]
        },
        {
            "text": "Khi nhận được phản hồi tiêu cực hoặc lời phê bình từ cấp trên về chất lượng công việc, bạn tiếp nhận và cải thiện như thế nào?",
            "category": "behavioral",
            "difficulty": 2,
            "career": None,
            "default_duration_seconds": 120,
            "interviewer_intent": "Đánh giá tư duy cầu tiến (Growth Mindset), khả năng kiểm soát cái tôi (Ego) và năng lực học hỏi từ sai lầm.",
            "answer_structure": {
                "start": "Phản hồi tiêu cực là món quà giá trị nhất giúp nhận ra điểm mù (Blind spot) trong công việc.",
                "steps": [
                    {"step": 1, "title": "Lắng nghe không phòng thủ (Non-defensive): Tiếp nhận với sự tôn trọng, ghi chép lại các điểm chưa đạt và đặt câu hỏi làm rõ kỳ vọng của cấp trên."},
                    {"step": 2, "title": "Chủ động phân tích và lập kế hoạch sửa đổi (Actionable Plan): Khắc phục sự cố ngay lập tức và cải tiến quy trình để không lặp lại lỗi cũ."},
                    {"step": 3, "title": "Chủ động cập nhật tiến độ (Follow-up): Sau 1-2 tuần, báo cáo lại kết quả cải thiện và cảm ơn cấp trên vì sự hướng dẫn kịp thời."}
                ],
                "end": "Biến lời phê bình thành động lực để nâng tầm tiêu chuẩn chất lượng của bản thân.",
                "time_guidance": "Trình bày theo cấu trúc STAR trong 100 - 120 giây."
            },
            "important_tips": [
                {"priority": "HIGH", "text": "Đưa ra một câu chuyện thực tế cụ thể bạn từng bị góp ý và cách bạn vượt qua xuất sắc."},
                {"priority": "MEDIUM", "text": "Thể hiện sự biết ơn người góp ý thay vì tỏ thái độ bực bội."}
            ],
            "follow_up_questions": [
                "Nếu bạn cho rằng lời phê bình của cấp trên là hiểu lầm hoặc không chính xác thì bạn đối thoại lại thế nào?"
            ]
        }
    ]

    for q_data in questions_data:
        q, created = Question.objects.update_or_create(
            text=q_data["text"],
            defaults=q_data
        )
        career_str = q.career.name if q.career else "Universal/Chung"
        print(f"  {'Created' if created else 'Updated'} Question [{career_str}]: {q.text[:55]}...")

    # Update legacy questions 90-95 in DB to link to proper career
    try:
        Question.objects.filter(text__icontains="công cụ phần mềm nào (AutoCAD").update(
            career=careers["xay-dung-kien-truc"],
            category="technical",
            default_duration_seconds=120
        )
        Question.objects.filter(text__icontains="đồ án kiến trúc/nội thất").update(
            career=careers["thiet-ke-noi-that"],
            category="technical",
            default_duration_seconds=120
        )
        Question.objects.filter(text__icontains="quy trình triển khai concept kiến trúc").update(
            career=careers["xay-dung-kien-truc"],
            category="technical",
            default_duration_seconds=120
        )
        Question.objects.filter(text__icontains="vượt dự toán").update(
            career=careers["xay-dung-kien-truc"],
            category="situational",
            default_duration_seconds=120
        )
    except Exception as ex:
        print("Legacy question update error:", ex)

    # 2. SALARY BENCHMARKS 2026
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
