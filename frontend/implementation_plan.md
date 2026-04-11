# Kế hoạch Triển khai Đa ngôn ngữ (i18n) Toàn diện cho Frontend

Vấn đề bạn nêu rất chính xác. Việc chỉ sửa từng chỗ một theo yêu cầu không thề giải quyết triệt để vấn đề thiếu đa ngôn ngữ trên toàn bộ frontend. Qua quá trình phân tích codebase bằng script tự động, tôi đã phát hiện ra hai vấn đề chính gây ra tình trạng hiển thị tiếng Anh hoặc text cứng (hardcoded):

1.  **Thiếu key trong file `.json`**: Có ít nhất **35 key** đa ngôn ngữ đang sử dụng hàm `t('key', 'Text Tiếng Anh')` trong code nhưng lại không được khai báo trong các file `vi/*.json` tương ứng. Điều này dãn đến việc ứng dụng luôn hiển thị 'Text Tiếng Anh' mặc định.
2.  **Hardcode text trong JSX**: Có hàng trăm đoạn text (tiếng Anh hoặc tiếng Việt) được gán trực tiếp vào các component (ví dụ: `<div>Login</div>`) thay vì sử dụng hook `useTranslation()`.

Để xử lý triệt để, tôi đề xuất kế hoạch triển khai gồm các giai đoạn sau:

## User Review Required

> [!WARNING]
> Việc thay đổi và bọc lại toàn bộ text gán cứng trong JSX có rủi ro nhỏ là gây sai lệch về giao diện nếu text thay thế có độ dài chênh lệch đáng kể, hoặc lỗi cú pháp React nếu không bọc đúng cách trong các component đặc thù (như text trong thuộc tính `placeholder` của thẻ `<input>`).
> Bạn có đồng ý với việc tôi chạy một tập lệnh tự động hóa để bổ sung hàng loạt key này không, hay bạn muốn tôi thực hiện thủ công theo từng mô-đun quan trọng trước?

## Proposed Changes

### 1. Bổ sung các cấu hình `i18n` bị khuyết (Tự động)
- **Hành động**: Tự động lấy 35 key + giá trị tiếng Anh mặc định đã quét được, dịch chúng sang tiếng Việt và chèn vào các namespace tương ứng.
- **Files bị ảnh hưởng**:
  #### [MODIFY] [employer.json](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/i18n/locales/vi/employer.json)
  #### [MODIFY] [common.json](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/i18n/locales/vi/common.json)
  #### [MODIFY] [admin.json](file:///c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/i18n/locales/vi/admin.json)

### 2. Quét và cấu trúc hóa Hardcode JSX Text (Bán tự động)
- **Hành động**: Sử dụng regex parser tiên tiến kết hợp với AST (Abstract Syntax Tree) để phát hiện và bọc các text còn bị hardcode thành dạng `<ComponentName>{t('componentName.text')}</ComponentName>`.
- Ưu tiên xử lý quét và bọc text tại các luồng nghiệp vụ cốt lõi mà người dùng thường thấy nhất trước, bao gồm:
  1.  Luồng Nhà Tuyển Dụng (`src/views/components/employers/*` & `src/views/employerPages/*`)
  2.  Luồng Đăng nhập / Đăng ký Auth (`src/views/components/auths/*`)
  3.  Xử lý Lỗi (`src/utils/errorHandling.ts` & `src/components/ErrorBoundary/*`)

## Open Questions

> [!IMPORTANT]
> Đối với những đoạn chữ Tiếng Việt đang được gán cứng trên giao diện (chưa có đa ngôn ngữ). Bạn muốn tôi:
> a) Dịch chúng sang tiếng Anh và đưa vào chuẩn `t('key', 'Default English')` rối tạo thêm bản lưu cho file `vi/*.json`?
> b) Hay tôi sử dụng lại nguyên bản Tiếng Việt làm Default fallback `t('key', 'Chữ Tiếng Việt')`? (Tùy chọn A sẽ tốt hơn cho sự nhất quán sau này).

## Verification Plan

### Automated Tests
- Chạy hệ thống TypeScript compiler `npm run typecheck` để đảm bảo việc thay thế code hàng loạt không vô tình làm lỗi các interface hay syntax.

### Manual Verification
- Render lại ứng dụng (bằng `npm run dev` nếu đang chạy môi trường phát triển) và kiểm tra thủ công giao diện từ màn Dashboard, Login, đến Quản lý Công việc. Đảm bảo mọi text đều có thể sử dụng tính năng chuyển đổi ngôn ngữ.
