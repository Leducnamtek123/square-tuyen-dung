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

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\components\auths\AccountForm\index.jsx',
    {
        "'Họ và tên là bắt buộc.'": "'Full name is required.'",
        "'Họ và tên không được vượt quá 100 ký tự.'": "'Full name cannot exceed 100 characters.'",
        "title=\"Họ và tên\"": "title=\"Full Name\""
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\components\Feedback\index.jsx',
    {
        "'Đánh giá là bắt buộc.'": "'Rating is required.'",
        "'Nội dung đánh giá là bắt buộc.'": "'Review content is required.'",
        "'Nội dung đánh giá không được vượt quá 2000 ký tự.'": "'Review content cannot exceed 2000 characters.'",
        "title=\"Nội dung đánh giá\"": "title=\"Review content\"",
        "placeholder=\"Nhập nội dung đánh giá của bạn (tùy chọn)\"": "placeholder=\"Enter your review content (optional)\"",
        "buttonText=\"Gửi đánh giá\"": "buttonText=\"Submit review\""
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\components\ApplyForm\index.jsx',
    {
        "'Họ và tên là bắt buộc.'": "'Full name is required.'",
        "'Email là bắt buộc.'": "'Email is required.'",
        "'Số điện thoại là bắt buộc.'": "'Phone number is required.'"
    }
)
