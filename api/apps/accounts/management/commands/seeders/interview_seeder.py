import requests
from bs4 import BeautifulSoup
from apps.interviews.models import Question, QuestionGroup
from apps.accounts.models import User
import random

def seed_interviews():
    """
    Crawl AI Interview question sets from TopCV and seed them
    """
    url = "https://www.topcv.vn/bo-cau-hoi-phong-van-xin-viec"
    print(f"Bắt đầu crawl bộ câu hỏi từ: {url}")
    
    # 1. Lấy user admin/employer để gán author
    author = User.objects.filter(role_name='EMPLOYER').first()
    if not author:
        author = User.objects.filter(is_superuser=True).first()

    try:
        response = requests.get(url, timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Tìm các mục câu hỏi (Cấu trúc giả định dựa trên TopCV blog)
        # Vì đây là crawl bài blog, chúng ta sẽ lấy các thẻ h3 làm tên bộ đề và các li làm câu hỏi
        sections = soup.find_all(['h2', 'h3'])
        
        group_count = 0
        current_group = None
        questions_in_group = []

        for tag in sections:
            name = tag.text.strip()
            if "câu hỏi" in name.lower():
                # Lưu nhóm trước đó nếu có
                if current_group and questions_in_group:
                    current_group.questions.set(questions_in_group)
                    group_count += 1

                # Tạo nhóm mới
                current_group, _ = QuestionGroup.objects.get_or_create(
                    name=name[:100],
                    author=author
                )
                questions_in_group = []
                
                # Tìm danh sách câu hỏi ngay bên dưới tag này
                sibling = tag.find_next_sibling(['ul', 'ol', 'p'])
                if sibling and sibling.name in ['ul', 'ol']:
                    lis = sibling.find_all('li')
                    for li in lis:
                        q_text = li.text.strip()
                        if q_text and len(q_text) > 10:
                            q, _ = Question.objects.get_or_create(
                                text=q_text,
                                author=author
                            )
                            questions_in_group.append(q)

        # Lưu nhóm cuối cùng
        if current_group and questions_in_group:
            current_group.questions.set(questions_in_group)
            group_count += 1

        # Nếu crawl không ra gì (do cấu trúc web đổi), nạp bộ câu hỏi fallback
        if group_count == 0:
            print("Crawl không tìm thấy data, đang nạp bộ câu hỏi dự phòng...")
            fallback_questions = [
                "Giới thiệu bản thân và kinh nghiệm làm việc của bạn?",
                "Tại sao bạn lại ứng tuyển vào vị trí này tại Square Group?",
                "Điểm mạnh và điểm yếu lớn nhất của bạn là gì?",
                "Bạn xử lý như thế nào khi gặp xung đột với đồng nghiệp?",
                "Mục tiêu nghề nghiệp của bạn trong 3-5 năm tới là gì?"
            ]
            group, _ = QuestionGroup.objects.get_or_create(
                name="Bộ câu hỏi phỏng vấn cơ bản",
                author=author
            )
            qs = []
            for q_t in fallback_questions:
                q, _ = Question.objects.get_or_create(text=q_t, author=author)
                qs.append(q)
            group.questions.set(qs)
            group_count = 1

        print(f"Thành công! Đã nạp {group_count} bộ câu hỏi phỏng vấn AI.")
        
    except Exception as e:
        print(f"Lỗi khi crawl câu hỏi: {str(e)}")
