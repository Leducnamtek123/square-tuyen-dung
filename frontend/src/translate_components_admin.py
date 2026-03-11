import os

def replace_in_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return

    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")
    else:
        print(f"No changes in: {filepath}")

# ChatWindow replacements
chatwindow_replacements = {
    'đã kết nối với bạn.': 'has connected with you.',
    'Bạn đã kết nối đến': 'You have connected to',
    'Bạn chưa chọn cuộc trò chuyện nào ...': 'You haven\'t selected any conversation...',
    'Nhập nội dung tại đây ...': 'Type your message here...',
    '>Gửi<': '>Send<'
}

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\components\chats\ChatWindow\index.jsx',
    chatwindow_replacements
)

# RightSidebar replacements
rightsidebar_replacements = {
    'Chi tiết ứng viên': 'Candidate Details',
    'Chưa cập nhật': 'Not updated',
    'Thông tin khác': 'Other Information',
    'Vị trí mong muốn': 'Desired Position',
    'Tỉnh/Thành phố': 'City/Province',
    'Kinh nghiệm': 'Experience',
    'Bạn chưa ứng tuyển vị trí nào': 'You haven\'t applied for any position',
    'Tải CV đính kèm': 'Download Attached Resume'
}

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\components\chats\RightSidebar\index.jsx',
    rightsidebar_replacements
)

# QuestionGroupTable replacements
questiongrouptable_replacements = {
    'Quản lý câu hỏi trong bộ:': 'Manage questions in group:',
    'Tìm kiếm câu hỏi...': 'Search questions...',
    'Thêm câu hỏi có sẵn': 'Add existing question',
    'Nội dung câu hỏi': 'Question content',
    'Ngày tạo': 'Created at',
    'Xóa khỏi bộ': 'Remove from group',
    'Chưa có câu hỏi nào trong bộ này.': 'No questions in this group yet.',
    'Chọn câu hỏi để thêm': 'Select questions to add',
    'Câu hỏi': 'Questions',
    'Hủy': 'Cancel',
    'Thêm vào bộ': 'Add to group'
}

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\employerPages\InterviewPages\components\QuestionGroupTable.jsx',
    questiongrouptable_replacements
)
