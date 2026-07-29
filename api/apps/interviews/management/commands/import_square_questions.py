import logging
from django.core.management.base import BaseCommand
from apps.interviews.models import Question, QuestionGroup
from apps.accounts.models import User
from apps.info.models import Company

logger = logging.getLogger(__name__)


SQUARE_QUESTION_GROUPS = [
    {
        "name": "[Square] Vòng 1 - Phỏng vấn Hòa nhập Văn hóa & DISC/MBTI (HCNS.QT.01.F06)",
        "description": "Bộ 15 câu hỏi trắc nghiệm tâm lý & hành vi chuẩn Square (DISC/MBTI). Thời gian tối đa 15 phút. BP. HCNS thực hiện. Thang điểm 100, Đạt >= 70 điểm.",
        "evaluation_rubric": {
            "max_duration_minutes": 15,
            "pass_score": 70,
            "max_score": 100,
            "disc_scoring": {
                "extroversion_vs_introversion": "Câu 1 - 5 (1-4 Y, 5 N)",
                "fast_vs_deliberate": "Câu 6 - 10 (6 Y, 7 N, 8 Y, 9 N, 10 Y)",
                "assertive_vs_gentle": "Câu 11 - 15 (11 Y, 12 N, 13 Y, 14 Y, 15 Y)"
            }
        },
        "questions": [
            {
                "text": "1. Trong đám đông bạn có muốn bạn là người nổi bật, tâm điểm không?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 1
            },
            {
                "text": "2. Bạn có kỹ năng giải quyết tình huống trong giao tiếp và va chạm xã hội?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 2
            },
            {
                "text": "3. Bạn có thích nơi công cộng, có nhiều sự kiện diễn ra? Hoạt động cộng đồng? Bạn thích mua sắm?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 3
            },
            {
                "text": "4. Gặp một người lạ bạn là người chủ động làm quen? Và bạn dễ dàng kết bạn mới?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 4
            },
            {
                "text": "5. Bạn thường không chia sẻ suy nghĩ, hay bày tỏ quan điểm cho người khác biết? Bạn ít tâm sự với người khác?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 5
            },
            {
                "text": "6. Bạn có kiểm soát được ham muốn bản thân, bạn luôn kìm chế được khi bạn thích cái gì đó?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 6
            },
            {
                "text": "7. Bạn giúp đỡ anh em, bạn bè trong gia đình bạn có khi nào cảm thấy bạn làm cho họ nhiều nhưng không ai quan tâm đến bạn?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 7
            },
            {
                "text": "8. Bạn có thường đặt câu hỏi 'tại sao?' trước khi làm hay quyết định một việc gì đó?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 8
            },
            {
                "text": "9. Bạn dễ bị cuốn theo số đông? Bạn không phân tích trước khi đưa ra quyết định và hay ảnh hưởng bởi người khác?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 9
            },
            {
                "text": "10. Bạn chấp nhận có xung đột để có thể giải quyết được công việc hay tình huống nào đó?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 10
            },
            {
                "text": "11. Bạn thường bắt đầu một công việc khi có kế hoạch rõ ràng không theo sở thích ngay lúc đó?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 11
            },
            {
                "text": "12. Bạn có xúc động khi gặp người bất hạnh hoặc một hình ảnh thương tâm?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 12
            },
            {
                "text": "13. Bạn thích làm nhiều việc, nhiều thứ cùng lúc, bạn không thể chịu nổi khi một việc xong mới tới việc khác?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 13
            },
            {
                "text": "14. Bạn có phong cách sống của bạn, bạn luôn bảo vệ và làm theo đó?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 14
            },
            {
                "text": "15. Đối với bạn, trách nhiệm của ai người đó phải chịu và bạn không ngại to tiếng khi cần thiết?",
                "category": "behavioral",
                "difficulty": 1,
                "sort_order": 15
            }
        ]
    },
    {
        "name": "[Square] Phù hợp Giá trị Cốt lõi & Cốt cách Con người Square",
        "description": "Dùng các câu hỏi tìm tính phù hợp Giá trị cốt lõi công ty và Cốt cách con người Square qua giao tiếp, kìm chế cảm xúc, chủ đề cuộc sống và gia đình.",
        "evaluation_rubric": {
            "pass_score": 70,
            "max_score": 100,
            "core_values": ["Giao tiếp minh bạch", "Làm chủ cảm xúc", "Trách nhiệm gia đình & xã hội"]
        },
        "questions": [
            {
                "text": "Chia sẻ góc nhìn của bạn về kỹ năng giao tiếp và kìm chế cảm xúc trong môi trường làm việc khi gặp áp lực công việc hoặc xung đột?",
                "category": "situational",
                "difficulty": 2,
                "sort_order": 1
            },
            {
                "text": "Cách bạn cân bằng giữa công việc và mối quan hệ gia đình, xã hội trong những giai đoạn công việc cao điểm?",
                "category": "situational",
                "difficulty": 2,
                "sort_order": 2
            },
            {
                "text": "Những giá trị cá nhân quan trọng nhất mà bạn luôn gìn giữ trong cuộc sống và công việc là gì?",
                "category": "situational",
                "difficulty": 2,
                "sort_order": 3
            }
        ]
    },
    {
        "name": "[Square] Vòng 2 - Phỏng vấn Chuyên môn & Áp lực Công việc (HCNS.QT.01.F06)",
        "description": "Max 40 phút dành cho Quản lý trực tiếp / Trưởng bộ phận chuyên môn. Đánh giá kỹ năng chuyên môn, quy trình công việc, ứng xử và khả năng chịu áp lực. Thang điểm 100, Đạt >= 70 điểm.",
        "evaluation_rubric": {
            "max_duration_minutes": 40,
            "pass_score": 70,
            "max_score": 100,
            "form_code": "HCNS.QT.01.F07 Part II.1"
        },
        "questions": [
            {
                "text": "Bạn nghĩ vì sao chúng tôi lại chọn bạn vào vị trí này? (Hãy nêu lý do chúng tôi nên chọn bạn)",
                "category": "technical",
                "difficulty": 2,
                "sort_order": 1
            },
            {
                "text": "Môi trường tại vị trí này rất khắc nghiệt và áp lực công việc rất lớn khi làm việc ở đây, có thể tăng ca, làm ngoài giờ. Bạn đã chuẩn bị tinh thần sẵn sàng chưa? Và bạn sẽ giải quyết như thế nào nếu gia đình bạn không muốn bạn tăng ca?",
                "category": "situational",
                "difficulty": 2,
                "sort_order": 2
            },
            {
                "text": "Bạn thích làm việc trong môi trường nào nhất? Môi trường như thế nào để bạn làm việc có hiệu quả cao?",
                "category": "situational",
                "difficulty": 1,
                "sort_order": 3
            },
            {
                "text": "Nêu quá trình, quy trình cần có cho vị trí bạn ứng tuyển, các bước diễn ra thế nào?",
                "category": "technical",
                "difficulty": 2,
                "sort_order": 4
            },
            {
                "text": "Trình bày quy trình triển khai từ phương án thiết kế/khái niệm ban đầu đến hoàn thiện sản phẩm/hồ sơ kỹ thuật thực tế?",
                "category": "technical",
                "difficulty": 3,
                "sort_order": 5
            },
            {
                "text": "Khi gặp xung đột ý kiến với khách hàng hoặc đối tác nội bộ về phương án kỹ thuật, bạn giải quyết như thế nào?",
                "category": "situational",
                "difficulty": 2,
                "sort_order": 6
            }
        ]
    },
    {
        "name": "[Square] Vòng 2 - Quyết định Chọn Nhân tài & Cam kết (HCNS.QT.01.F06)",
        "description": "Max 15 phút. Phỏng vấn tuyển chọn nhân tài phù hợp, tìm hiểu ước mơ, mục tiêu dài hạn, nhận xét đóng góp cho Square và thỏa thuận chính sách.",
        "evaluation_rubric": {
            "max_duration_minutes": 15,
            "pass_score": 70,
            "max_score": 100
        },
        "questions": [
            {
                "text": "1. Bạn muốn làm việc ở đây bao lâu nếu bạn được tuyển dụng? Và kế hoạch tiếp theo trong 3-5 năm tới của bạn là gì?",
                "category": "general",
                "difficulty": 2,
                "sort_order": 1
            },
            {
                "text": "2. Bạn có ước mơ cháy bỏng không? Một ước mơ từ nhỏ? Bạn có thể chia sẻ ước mơ đó?",
                "category": "general",
                "difficulty": 2,
                "sort_order": 2
            },
            {
                "text": "3. Hãy cho biết bạn muốn 'Con Bạn trong tương lai' sẽ là người như thế nào? (Về 3 khía cạnh: Học vấn – Công việc – Tính cách)",
                "category": "general",
                "difficulty": 3,
                "sort_order": 3
            },
            {
                "text": "4. Trong gia đình bạn có mấy anh chị em? Hãy nêu 3 tính cách ở anh chị em/người có ảnh hưởng lớn nhất đến bạn.",
                "category": "general",
                "difficulty": 2,
                "sort_order": 4
            },
            {
                "text": "5. Ngoài xin việc ở đây bạn còn đang nộp hồ sơ ở những công ty nào khác? Theo bạn những công ty đó có gì tốt hơn Square?",
                "category": "general",
                "difficulty": 2,
                "sort_order": 5
            },
            {
                "text": "6. Square có điểm nào chưa tốt? Hãy thành thật với chính bản thân bạn!",
                "category": "general",
                "difficulty": 3,
                "sort_order": 6
            },
            {
                "text": "7. Bạn có góp ý gì cho công ty Square ở khâu tuyển dụng để chúng tôi có thể làm tốt hơn?",
                "category": "general",
                "difficulty": 2,
                "sort_order": 7
            },
            {
                "text": "8. Đánh giá và phản hồi của bạn đối với các chính sách phúc lợi: Lương căn bản, KPI, đào tạo, thâm niên, thưởng và môi trường 2 tháng thử việc?",
                "category": "general",
                "difficulty": 2,
                "sort_order": 8
            }
        ]
    }
]


class Command(BaseCommand):
    help = "Nạp bộ câu hỏi phỏng vấn chuẩn Square (HCNS.QT.01.F06) vào CSDL"

    def handle(self, *args, **options):
        self.stdout.write("Bắt đầu nhập bộ câu hỏi phỏng vấn chuẩn Square (HCNS.QT.01.F06)...")

        # Get author user
        author = User.objects.filter(role_name='EMPLOYER').first()
        if not author:
            author = User.objects.filter(is_superuser=True).first()

        # Get company
        company = Company.objects.filter(name__icontains='Square').first()
        if not company:
            company = Company.objects.first()

        total_groups_created = 0
        total_questions_created = 0

        for group_data in SQUARE_QUESTION_GROUPS:
            group, created = QuestionGroup.objects.get_or_create(
                name=group_data["name"],
                defaults={
                    "description": group_data["description"],
                    "evaluation_rubric": group_data["evaluation_rubric"],
                    "author": author,
                    "company": company,
                }
            )
            if not created:
                group.description = group_data["description"]
                group.evaluation_rubric = group_data["evaluation_rubric"]
                group.company = company
                group.save()

            total_groups_created += 1

            questions_in_group = []
            for q_data in group_data["questions"]:
                question, q_created = Question.objects.get_or_create(
                    text=q_data["text"],
                    defaults={
                        "category": q_data["category"],
                        "difficulty": q_data["difficulty"],
                        "sort_order": q_data["sort_order"],
                        "author": author,
                        "company": company,
                    }
                )
                if not q_created:
                    question.category = q_data["category"]
                    question.difficulty = q_data["difficulty"]
                    question.sort_order = q_data["sort_order"]
                    question.company = company
                    question.save()

                questions_in_group.append(question)
                if q_created:
                    total_questions_created += 1

            group.questions.set(questions_in_group)
            self.stdout.write(self.style.SUCCESS(f"  ✓ Đã cập nhật nhóm '{group.name}' ({len(questions_in_group)} câu hỏi)"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nHOÀN THÀNH! Đã xử lý {total_groups_created} bộ câu hỏi chuẩn Square với tổng số {total_questions_created} câu hỏi mới."
            )
        )
