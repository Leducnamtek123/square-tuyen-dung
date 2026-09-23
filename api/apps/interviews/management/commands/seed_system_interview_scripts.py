# -*- coding: utf-8 -*-
"""
Django Management Command: seed_system_interview_scripts
Khởi tạo 5 Kịch bản phỏng vấn mẫu hệ thống (System Presets) chuẩn nghiệp vụ HR:
1. Kỹ thuật Chuyên môn (Technical Deep-dive)
2. Hành vi & Văn hóa (STAR Behavioral)
3. Kinh doanh B2B & CSKH (Sales & Customer Engagement)
4. Tuyển dụng Fresher / Thực tập sinh (Fresher / Intern Potential)
5. Lãnh đạo & Quản lý cấp trung (Leadership & Team Management)
"""

import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.interviews.models import InterviewScript, Question

logger = logging.getLogger(__name__)

SYSTEM_PRESET_SCRIPTS = [
    {
        "name": "Kỹ thuật Chuyên môn (Technical Deep-dive)",
        "slug": "ky-thuat-chuyen-mon-technical-deep-dive",
        "scenario_type": "technical",
        "hr_persona": "challenger",
        "description": "Kịch bản phỏng vấn chuyên sâu kỹ thuật, thử thách kiến trúc hệ thống, thuật toán, khả năng mở rộng và giải quyết sự cố sản xuất.",
        "system_prompt": "Bạn là Phỏng vấn viên Kỹ thuật (Technical Interviewer) cấp cao tại {company_name}, đang phỏng vấn ứng viên {candidate_name} cho vị trí {job_title}. Hãy sử dụng phong thái challenger: trực diện, sắc bén, yêu cầu đào sâu vào kiến trúc hệ thống, các trade-off kỹ thuật, khả năng chịu tải, và tư duy xử lý sự cố. Khi ứng viên trả lời chung chung, hãy đặt câu hỏi phụ (follow-up) để kiểm tra kinh nghiệm thực chiến.",
        "greeting_message": "Xin chào {candidate_name}! Tôi là {interviewer_name}, người sẽ đồng hành cùng bạn trong buổi phỏng vấn kỹ thuật chuyên sâu hôm nay cho vị trí {job_title} tại {company_name}. Chúng ta sẽ đi sâu vào các bài toán kỹ thuật thực tế và tư duy giải quyết vấn đề. Bạn đã sẵn sàng chưa?",
        "closing_message": "Cảm ơn {candidate_name} đã hoàn thành buổi phỏng vấn kỹ thuật! Các câu trả lời chi tiết và tư duy kỹ thuật của bạn đã được ghi nhận đầy đủ. Bộ phận tuyển dụng {company_name} sẽ liên hệ lại với bạn sớm. Chúc bạn một ngày tốt lành!",
        "time_limit_per_question": 150,
        "allow_ai_followup": True,
        "max_followup_questions": 2,
        "character_id": "minh_tri",
        "voice_name": "Mạnh Dũng",
        "voice_speed": 1.00,
        "evaluation_rubric": {
            "criteria": [
                {"name": "Kiến thức Chuyên môn & Nền tảng", "weight": 35, "description": "Nắm vững lý thuyết cơ bản, ngôn ngữ, công nghệ lõi và best practices."},
                {"name": "Tư duy Kiến trúc & Thiết kế Hệ thống", "weight": 30, "description": "Khả năng phân tích trade-off, mở rộng hệ thống (scalability), độ tin cậy và bảo mật."},
                {"name": "Kỹ năng Xử lý Sự cố & Tối ưu hóa", "weight": 20, "description": "Tư duy debug, tracing, tối ưu hiệu năng và xử lý sự cố môi trường production."},
                {"name": "Trình bày & Giao tiếp Kỹ thuật", "weight": 15, "description": "Diễn đạt mạch lạc, giải thích vấn đề phức tạp một cách rõ ràng, súc tích."}
            ],
            "pass_score": 75
        },
        "sample_questions": [
            {
                "title": "Thiết kế kiến trúc chịu tải cao và cache invalidation",
                "text": "Khi thiết kế một hệ thống backend phục vụ hàng triệu người dùng đồng thời, bạn xử lý bài toán cache invalidation và phân tải cơ sở dữ liệu như thế nào?",
                "category": "technical",
                "difficulty": 3,
                "interviewer_intent": "Đánh giá hiểu biết sâu về hệ thống phân tán, caching pattern (Cache-Aside, Write-Through) và bài toán database sharding/replication."
            },
            {
                "title": "Kinh nghiệm điều tra và khắc phục sự cố nghiêm trọng (Incident Handling)",
                "text": "Hãy chia sẻ về sự cố kỹ thuật nghiêm trọng nhất mà bạn từng gặp phải trên production. Bạn đã phân tích root cause, áp dụng giải pháp tạm thời và giải pháp dài hạn ra sao?",
                "category": "problem_solving",
                "difficulty": 3,
                "interviewer_intent": "Đánh giá bản lĩnh xử lý sự cố, tư duy điều tra nhật ký (log/trace) và bài học cải tiến hệ thống."
            },
            {
                "title": "Cân nhắc đánh đổi giữa tốc độ phát triển và chất lượng mã nguồn",
                "text": "Trong trường hợp deadline gấp nhưng mã nguồn cần tái cấu trúc (refactoring) để đảm bảo tính mở rộng, bạn sẽ thuyết phục các bên liên quan và ra quyết định đánh đổi thế nào?",
                "category": "technical",
                "difficulty": 2,
                "interviewer_intent": "Đánh giá tư duy quản trị nợ kỹ thuật (technical debt) và kỹ năng giao tiếp trong dự án."
            }
        ]
    },
    {
        "name": "Hành vi & Văn hóa (STAR Behavioral)",
        "slug": "hanh-vi-van-hoa-star-behavioral",
        "scenario_type": "behavioral",
        "hr_persona": "professional",
        "description": "Kịch bản đánh giá văn hóa, kỹ năng mềm và hành vi quá khứ theo mô hình chuẩn STAR (Situation - Task - Action - Result).",
        "system_prompt": "Bạn là Chuyên gia Tuyển dụng Văn hóa & Nhân sự tại {company_name}, đang phỏng vấn ứng viên {candidate_name} cho vị trí {job_title}. Hãy áp dụng triệt để phương pháp STAR (Tình huống - Nhiệm vụ - Hành động - Kết quả). Giữ phong thái chuyên nghiệp, khách quan, lắng nghe và khai thác cách ứng viên làm việc nhóm, quản lý cảm xúc, và vượt qua xung đột hoặc áp lực.",
        "greeting_message": "Chào {candidate_name}, rất vui được gặp bạn! Tôi là {interviewer_name}, đại diện cho bộ phận Nhân sự của {company_name}. Hôm nay chúng ta sẽ trao đổi về những trải nghiệm làm việc thực tế, cách bạn phối hợp đội ngũ và xử lý các thử thách trong công việc. Hãy thoải mái chia sẻ những câu chuyện thật của mình nhé!",
        "closing_message": "Cảm ơn {candidate_name} vì những chia sẻ rất cởi mở và chân thành vừa rồi. Chúng tôi đánh giá rất cao tinh thần hợp tác của bạn. Kết quả đánh giá sẽ được gửi tới bạn trong thời gian sớm nhất. Tạm biệt bạn!",
        "time_limit_per_question": 120,
        "allow_ai_followup": True,
        "max_followup_questions": 2,
        "character_id": "ng_c_linh",
        "voice_name": "Trúc Ly",
        "voice_speed": 1.00,
        "evaluation_rubric": {
            "criteria": [
                {"name": "Mô hình STAR & Minh chứng Thực tế", "weight": 30, "description": "Câu trả lời nêu rõ bối cảnh, nhiệm vụ cá nhân, hành động cụ thể và kết quả đo lường được."},
                {"name": "Làm việc nhóm & Giao tiếp Hợp tác", "weight": 25, "description": "Khả năng phối hợp đồng đội, tôn trọng ý kiến khác biệt và tinh thần đồng hành."},
                {"name": "Giải quyết Xung đột & Chịu Áp lực", "weight": 25, "description": "Thái độ bình tĩnh, tư duy xây dựng và tìm giải pháp khi gặp khó khăn hoặc bất đồng."},
                {"name": "Phù hợp Giá trị & Văn hóa Doanh nghiệp", "weight": 20, "description": "Sự đồng điệu về đạo đức nghề nghiệp, tính chủ động và tinh thần trách nhiệm."}
            ],
            "pass_score": 70
        },
        "sample_questions": [
            {
                "title": "Xử lý xung đột quan điểm trong đội nhóm",
                "text": "Hãy kể lại một trường hợp bạn và đồng nghiệp bất đồng ý kiến sâu sắc về cách triển khai một dự án. Bạn đã lắng nghe, thảo luận và đạt được tiếng nói chung thế nào?",
                "category": "behavioral",
                "difficulty": 2,
                "interviewer_intent": "Đánh giá trí tuệ cảm xúc (EQ), sự tôn trọng và khả năng giải quyết bất đồng trên tinh thần xây dựng."
            },
            {
                "title": "Vượt qua áp lực công việc và deadline ngặt nghèo",
                "text": "Mô tả một tình huống bạn phải gánh vác khối lượng công việc lớn trong khoảng thời gian rất hạn hẹp. Bạn đã ưu tiên nhiệm vụ và duy trì chất lượng công việc ra sao?",
                "category": "behavioral",
                "difficulty": 2,
                "interviewer_intent": "Đánh giá kỹ năng quản trị thời gian, thiết lập thứ tự ưu tiên và sức bền tâm lý dưới áp lực."
            },
            {
                "title": "Chủ động đề xuất cải tiến quy trình làm việc",
                "text": "Bạn đã bao giờ chủ động nhận diện một điểm nghẽn trong công việc và đề xuất giải pháp cải tiến thành công chưa? Kết quả đạt được là gì?",
                "category": "culture_fit",
                "difficulty": 2,
                "interviewer_intent": "Đánh giá tính chủ động (proactiveness), tinh thần trách nhiệm và tư duy cải tiến liên tục."
            }
        ]
    },
    {
        "name": "Kinh doanh B2B & CSKH (Sales & Customer Engagement)",
        "slug": "kinh-doanh-b2b-cskh-sales-customer-engagement",
        "scenario_type": "sales",
        "hr_persona": "friendly",
        "description": "Kịch bản đánh giá kỹ năng thấu hiểu khách hàng, đàm phán, xử lý phản đối và chốt giao dịch trong môi trường B2B và dịch vụ khách hàng.",
        "system_prompt": "Bạn là Giám đốc Phát triển Kinh doanh tại {company_name}, đang phỏng vấn ứng viên {candidate_name} cho vị trí {job_title}. Phong thái thân thiện nhưng nhạy bén, kiểm tra tư duy lấy khách hàng làm trung tâm, kỹ năng đặt câu hỏi khai thác nhu cầu, kỹ năng xử lý từ chối và tư duy duy trì quan hệ đối tác bền vững.",
        "greeting_message": "Xin chào {candidate_name}! Chào mừng bạn đến với buổi phỏng vấn vị trí {job_title} tại {company_name}. Tôi là {interviewer_name}. Hôm nay chúng ta sẽ cùng khám phá niềm đam mê kinh doanh, cách bạn kết nối với khách hàng và chiến lược mở rộng thị trường của bạn.",
        "closing_message": "Rất ấn tượng với năng lượng tích cực và những chia sẻ của {candidate_name}! Buổi phỏng vấn hôm nay kết thúc tại đây. Chúc bạn luôn giữ vững ngọn lửa đam mê và hẹn gặp lại bạn trong vòng tiếp theo tại {company_name}.",
        "time_limit_per_question": 120,
        "allow_ai_followup": True,
        "max_followup_questions": 2,
        "character_id": "ng_c_linh",
        "voice_name": "Trúc Ly",
        "voice_speed": 1.05,
        "evaluation_rubric": {
            "criteria": [
                {"name": "Kỹ năng Khai thác Nhu cầu & Lắng nghe", "weight": 30, "description": "Biết đặt câu hỏi trúng nỗi đau khách hàng, lắng nghe chủ động và thấu cảm."},
                {"name": "Xử lý Phản đối & Thuyết phục", "weight": 30, "description": "Tư duy linh hoạt, thuyết phục dựa trên giá trị giải pháp thay vì ép giá hay tranh cãi."},
                {"name": "Tư duy Hướng đến Mục tiêu (Target-driven)", "weight": 20, "description": "Động lực hoàn thành KPI, tính kiên trì và bền bỉ trong quy trình bán hàng dài hơi."},
                {"name": "Kỹ năng Giao tiếp & Xây dựng Thiện cảm", "weight": 20, "description": "Giọng nói tự tin, năng lượng tích cực, phong thái chuyên nghiệp và đáng tin cậy."}
            ],
            "pass_score": 70
        },
        "sample_questions": [
            {
                "title": "Xử lý phản đối về giá cả từ khách hàng doanh nghiệp",
                "text": "Khi khách hàng doanh nghiệp tiềm năng phản hồi rằng giá giải pháp của bạn cao hơn đáng kể so với đối thủ cạnh tranh, bạn sẽ xử lý phản đối này như thế nào?",
                "category": "situational",
                "difficulty": 2,
                "interviewer_intent": "Đánh giá năng lực chứng minh giá trị ROI (Return on Investment), kỹ năng tư vấn giải pháp thay vì cạnh tranh bằng giá rẻ."
            },
            {
                "title": "Chiến lược khai thác và nuôi dưỡng khách hàng tiềm năng (Lead Nurturing)",
                "text": "Hãy chia sẻ phương pháp bạn xây dựng pipeline khách hàng B2B từ giai đoạn tiếp cận ban đầu đến khi chốt hợp đồng thành công.",
                "category": "soft_skills",
                "difficulty": 2,
                "interviewer_intent": "Đánh giá tính kỷ luật trong quản lý phễu bán hàng (pipeline), kỹ năng nuôi dưỡng quan hệ lâu dài."
            },
            {
                "title": "Xoa dịu khách hàng khi dịch vụ gặp trục trặc",
                "text": "Một khách hàng VIP đang vô cùng bức xúc vì dịch vụ bị gián đoạn gây tổn thất. Bạn sẽ mở đầu cuộc trò chuyện và đưa ra các cam kết xử lý ra sao?",
                "category": "situational",
                "difficulty": 2,
                "interviewer_intent": "Đánh giá sự thấu cảm, khả năng kiểm soát tình huống căng thẳng và giữ chân khách hàng."
            }
        ]
    },
    {
        "name": "Tuyển dụng Fresher / Thực tập sinh (Fresher / Intern Potential)",
        "slug": "tuyen-dung-fresher-thuc-tap-sinh-fresher-intern-potential",
        "scenario_type": "fresher",
        "hr_persona": "friendly",
        "description": "Kịch bản phỏng vấn nhẹ nhàng, tập trung khai phá tiềm năng, tinh thần tự học, thái độ tích cực và khả năng tiếp thu cái mới của các bạn trẻ.",
        "system_prompt": "Bạn là Mentor và Chuyên viên Tuyển dụng Trẻ tại {company_name}, phỏng vấn bạn {candidate_name} ứng tuyển vị trí {job_title}. Phong thái thân thiện, khích lệ, tạo môi trường thoải mái để ứng viên bộc lộ khả năng tự học hỏi, tư duy logic, sự đam mê và tính trách nhiệm, không đòi hỏi kinh nghiệm dày dặn.",
        "greeting_message": "Chào {candidate_name}! Đừng lo lắng hay áp lực nhé, tôi là {interviewer_name}, người sẽ cùng trò chuyện và lắng nghe câu chuyện học tập, định hướng nghề nghiệp của bạn tại {company_name}. Hãy cùng bắt đầu thật hào hứng nào!",
        "closing_message": "Cảm ơn {candidate_name} rất nhiều! Bạn đã làm rất tốt hôm nay. {company_name} luôn trân trọng những bạn trẻ nhiệt huyết, ham học hỏi và cầu tiến. Chúng tôi sẽ phản hồi kết quả sớm nhất nhé!",
        "time_limit_per_question": 90,
        "allow_ai_followup": True,
        "max_followup_questions": 1,
        "character_id": "ng_c_linh",
        "voice_name": "Trúc Ly",
        "voice_speed": 1.00,
        "evaluation_rubric": {
            "criteria": [
                {"name": "Tinh thần Tự học & Ham hiểu biết", "weight": 35, "description": "Khả năng chủ động nghiên cứu công nghệ mới, đọc tài liệu và tự nâng cấp bản thân."},
                {"name": "Tư duy Logic & Khả năng Tiếp thu", "weight": 30, "description": "Tư duy mạch lạc khi đối mặt vấn đề mới mẻ, khả năng tiếp nhận feedback tốt."},
                {"name": "Thái độ & Trách nhiệm với Công việc", "weight": 20, "description": "Sự cầu tiến, khiêm tốn, đúng giờ, tôn trọng cam kết và tận tâm hoàn thành bài tập/dự án."},
                {"name": "Định hướng Nghề nghiệp & Nhiệt huyết", "weight": 15, "description": "Mục tiêu rõ ràng, hiểu biết cơ bản về lĩnh vực ứng tuyển và sự hứng thú với công việc."}
            ],
            "pass_score": 65
        },
        "sample_questions": [
            {
                "title": "Quá trình tự học một công nghệ hoặc kỹ năng hoàn toàn mới",
                "text": "Hãy chia sẻ về một công nghệ hoặc kỹ năng mới mà bạn tự học gần đây nhất. Bạn đã gặp khó khăn gì và giải quyết ra sao?",
                "category": "soft_skills",
                "difficulty": 1,
                "interviewer_intent": "Đánh giá phương pháp tự học, khả năng tìm kiếm tài liệu và tính kiên trì."
            },
            {
                "title": "Dự án hoặc bài tập lớn tâm đắc nhất thời sinh viên",
                "text": "Kể về một đề tài hoặc bài tập lớn mà bạn cảm thấy tự hào nhất trong quá trình học tập. Đóng góp cụ thể của bạn là gì?",
                "category": "general",
                "difficulty": 1,
                "interviewer_intent": "Đánh giá niềm đam mê với ngành, khả năng chuyển giao kiến thức vào sản phẩm thực tế."
            },
            {
                "title": "Mục tiêu phát triển nghề nghiệp trong 1-2 năm tới",
                "text": "Bạn kỳ vọng học hỏi và đạt được những cột mốc phát triển nghề nghiệp nào trong 1 đến 2 năm đầu tiên đi làm?",
                "category": "culture_fit",
                "difficulty": 1,
                "interviewer_intent": "Đánh giá tính thực tế của mục tiêu cá nhân và sự gắn kết với lộ trình đào tạo của doanh nghiệp."
            }
        ]
    },
    {
        "name": "Lãnh đạo & Quản lý cấp trung (Leadership & Team Management)",
        "slug": "lanh-dao-quan-ly-cap-trung-leadership-team-management",
        "scenario_type": "leadership",
        "hr_persona": "professional",
        "description": "Kịch bản đánh giá năng lực lãnh đạo, quản trị mục tiêu OKR/KPI, phân công công việc, giải quyết xung đột và phát triển nhân tài.",
        "system_prompt": "Bạn là Thành viên Ban Lãnh đạo (C-Level Executive) tại {company_name}, đang phỏng vấn ứng viên {candidate_name} cho vị trí quản lý {job_title}. Phong thái chuyên nghiệp, điềm đạm nhưng sâu sắc. Tập trung đánh giá tư duy chiến lược, năng lực dẫn dắt đội ngũ, quản trị hiệu suất, kỹ năng huấn luyện (coaching) và khả năng ra quyết định dưới áp lực.",
        "greeting_message": "Kính chào {candidate_name}! Tôi là {interviewer_name}, rất hân hạnh được trao đổi cùng bạn hôm nay về vị trí quản lý {job_title} tại {company_name}. Chúng tôi rất mong đợi được lắng nghe về tầm nhìn, kinh nghiệm quản trị và phong cách lãnh đạo của bạn.",
        "closing_message": "Xin chân thành cảm ơn {candidate_name} vì cuộc trò chuyện sâu sắc và mang tính chiến lược vừa rồi. Những góc nhìn quản trị của bạn rất giá trị đối với chúng tôi. Ban Lãnh đạo {company_name} sẽ sớm thảo luận và gửi thông tin phản hồi tới bạn.",
        "time_limit_per_question": 180,
        "allow_ai_followup": True,
        "max_followup_questions": 2,
        "character_id": "minh_tri",
        "voice_name": "Mạnh Dũng",
        "voice_speed": 1.00,
        "evaluation_rubric": {
            "criteria": [
                {"name": "Năng lực Dẫn dắt & Phát triển Đội ngũ", "weight": 30, "description": "Khả năng truyền cảm hứng, ủy quyền hiệu quả, coaching và nâng tầm thành viên."},
                {"name": "Tư duy Chiến lược & Quản trị Mục tiêu", "weight": 30, "description": "Chuyển hóa chiến lược thành kế hoạch hành động cụ thể, quản lý KPI/OKR chặt chẽ."},
                {"name": "Kỹ năng Ra Quyết định & Quản trị Rủi ro", "weight": 20, "description": "Dám chịu trách nhiệm, cân nhắc dữ liệu và hành động dứt khoát trong tình huống không chắc chắn."},
                {"name": "Giao tiếp Thấu hiểu & Quản lý Xung đột", "weight": 20, "description": "Giải quyết xung đột nội bộ trên tinh thần xây dựng, kết nối các phòng ban hiệu quả."}
            ],
            "pass_score": 75
        },
        "sample_questions": [
            {
                "title": "Ủy quyền công việc và huấn luyện nhân viên cấp dưới",
                "text": "Bạn áp dụng phương pháp nào để ủy quyền công việc cho nhân viên mà vẫn kiểm soát được tiến độ và chất lượng đầu ra?",
                "category": "situational",
                "difficulty": 3,
                "interviewer_intent": "Đánh giá phong cách quản trị không vi mô (avoid micromanagement), kỹ năng phân quyền và bồi dưỡng nhân sự kế cận."
            },
            {
                "title": "Quản trị hiệu suất và xử lý thành viên suy giảm động lực",
                "text": "Khi một nhân sự chủ chốt trong đội có dấu hiệu sa sút phong độ và gây ảnh hưởng đến tinh thần toàn đội, bạn xử lý trường hợp này như thế nào?",
                "category": "behavioral",
                "difficulty": 3,
                "interviewer_intent": "Đánh giá khả năng 1-on-1 coaching, sự kiên nhẫn và biện pháp kỷ luật khi cần thiết."
            },
            {
                "title": "Ra quyết định chiến lược trong điều kiện thông tin không đầy đủ",
                "text": "Hãy chia sẻ về một quyết định quản lý quan trọng mà bạn phải đưa ra khi dữ liệu còn mơ hồ và rủi ro cao. Bạn đã chịu trách nhiệm về kết quả ra sao?",
                "category": "problem_solving",
                "difficulty": 3,
                "interviewer_intent": "Đánh giá bản lĩnh lãnh đạo, tư duy quản trị rủi ro và tinh thần dám làm dám chịu."
            }
        ]
    }
]


class Command(BaseCommand):
    help = "Khởi tạo 5 Kịch bản phỏng vấn mẫu hệ thống (System Presets) chuẩn nghiệp vụ HR"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("==> Đang khởi tạo 5 Kịch bản phỏng vấn mẫu hệ thống InfoHR..."))

        total_created = 0
        total_updated = 0

        with transaction.atomic():
            for script_data in SYSTEM_PRESET_SCRIPTS:
                questions_data = script_data.pop("sample_questions", [])
                name = script_data["name"]

                script, created = InterviewScript.objects.update_or_create(
                    name=name,
                    defaults={
                        "slug": script_data.get("slug", ""),
                        "scenario_type": script_data.get("scenario_type", "technical"),
                        "hr_persona": script_data.get("hr_persona", "professional"),
                        "description": script_data.get("description", ""),
                        "system_prompt": script_data.get("system_prompt", ""),
                        "greeting_message": script_data.get("greeting_message", ""),
                        "closing_message": script_data.get("closing_message", ""),
                        "time_limit_per_question": script_data.get("time_limit_per_question", 120),
                        "allow_ai_followup": script_data.get("allow_ai_followup", True),
                        "max_followup_questions": script_data.get("max_followup_questions", 2),
                        "character_id": script_data.get("character_id", "ng_c_linh"),
                        "voice_name": script_data.get("voice_name", "Trúc Ly"),
                        "voice_speed": script_data.get("voice_speed", 1.00),
                        "evaluation_rubric": script_data.get("evaluation_rubric"),
                        "is_system_preset": True,
                        "is_active": True,
                        "company": None,
                        "author": None,
                    }
                )

                if created:
                    total_created += 1
                    self.stdout.write(self.style.SUCCESS(f"  [+] Đã tạo mới: {name}"))
                else:
                    total_updated += 1
                    self.stdout.write(self.style.WARNING(f"  [*] Đã cập nhật: {name}"))

                # Seed sample questions for this preset
                linked_questions = []
                for q_item in questions_data:
                    q_obj, _ = Question.objects.get_or_create(
                        title=q_item["title"],
                        defaults={
                            "text": q_item["text"],
                            "category": q_item["category"],
                            "difficulty": q_item["difficulty"],
                            "interviewer_intent": q_item.get("interviewer_intent", ""),
                            "default_duration_seconds": script.time_limit_per_question,
                            "company": None,
                            "author": None,
                        }
                    )
                    linked_questions.append(q_obj)

                if linked_questions:
                    script.questions.set(linked_questions)

        self.stdout.write(
            self.style.SUCCESS(
                f"\n==> Hoàn tất nạp kịch bản mẫu: {total_created} tạo mới, {total_updated} cập nhật thành công!"
            )
        )
