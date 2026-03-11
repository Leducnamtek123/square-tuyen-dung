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
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\employerPages\InterviewPages\hooks\useQuestionGroups.js',
    {
        "'Thêm bộ câu hỏi thành công'": "'Added question group successfully'",
        "'Cập nhật bộ câu hỏi thành công'": "'Updated question group successfully'",
        "'Xóa bộ câu hỏi thành công'": "'Deleted question group successfully'"
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\defaultPages\JobDetailPage\index.jsx',
    {
        '"Lưu thành công."': '"Saved successfully."',
        '"Hủy lưu thành công."': '"Unsaved successfully."'
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\defaultPages\CompanyDetailPage\index.jsx',
    {
        '"Theo dõi thành công."': '"Followed successfully."',
        '"Hủy theo dõi thành công."': '"Unfollowed successfully."'
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages\components\auths\AccountCard\index.jsx',
    {
        '"Cập nhật thông tin tài khoản thành công."': '"Account updated successfully."',
        '"Đổi mật khẩu thành công."': '"Password changed successfully."'
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\components\ApplyCard\index.jsx',
    {
        "'Ứng tuyển thành công.'": "'Applied successfully.'"
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\components\DropzoneDialogCustom\index.jsx',
    {
        '`Tệp ${fileName} đã được thêm thành công.`': '`File ${fileName} added successfully.`',
        '`Từ chối tệp ${fileName}. Kích thước quá lớn (tối đa. ${maxSize} MB)`': '`File ${fileName} rejected. Size too large (max ${maxSize} MB)`'
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\components\Feedback\index.jsx',
    {
        "'Gửi phản hồi thành công.'": "'Feedback sent successfully.'"
    }
)

replace_in_file(
    r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\components\Company\index.jsx',
    {
        "'Theo dõi thành công.'": "'Followed successfully.'",
        "'Hủy theo dõi thành công.'": "'Unfollowed successfully.'"
    }
)

