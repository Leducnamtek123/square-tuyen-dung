# Hướng dẫn sử dụng Square Tuyển Dụng

- Phiên bản: 1.0
- Ngày tạo: 09/05/2026
- Phạm vi: Hướng dẫn cho người dùng cuối, nhà tuyển dụng và admin

## 1. Tổng quan hệ thống

Square Tuyển Dụng là nền tảng tuyển dụng gồm các luồng chính:

- Người tìm việc xem tin, lưu tin, ứng tuyển và theo dõi lịch sử.
- Nhà tuyển dụng đăng tin, quản lý hồ sơ ứng viên, tạo phỏng vấn AI và quản lý nội dung công ty.
- Admin quản trị dữ liệu, kiểm duyệt nội dung và cấu hình hệ thống.

### Các cổng truy cập chính

| Khu vực | Đường dẫn |
|---|---|
| Trang công khai | `/` |
| Ứng viên | `/dashboard`, `/jobs`, `/companies`, `/profile`, `/my-jobs`, `/my-interviews` |
| Nhà tuyển dụng | `/employer/dashboard`, `/employer/job-posts`, `/employer/candidates`, `/employer/interviews` |
| Admin | `/admin/dashboard`, `/admin/users`, `/admin/jobs`, `/admin/interviews`, `/admin/settings` |

## 2. Hướng dẫn cho người dùng cuối

### 2.1 Đăng ký và đăng nhập

1. Mở trang chủ và chọn **Đăng ký** hoặc **Đăng nhập**.
2. Chọn đúng loại tài khoản:
   - Ứng viên
   - Nhà tuyển dụng
3. Điền thông tin bắt buộc và xác nhận email nếu hệ thống yêu cầu.
4. Sau khi đăng nhập, hệ thống đưa bạn đến trang tổng quan phù hợp.

### 2.2 Tạo và cập nhật hồ sơ cá nhân

1. Vào **Hồ sơ** hoặc **Profile**.
2. Cập nhật các thông tin cơ bản:
   - Họ tên
   - Số điện thoại
   - Ngày sinh
   - Địa chỉ
   - Kinh nghiệm, học vấn, kỹ năng
3. Tải lên CV hoặc tạo hồ sơ trực tuyến.
4. Lưu lại để hệ thống dùng cho việc ứng tuyển.

### 2.3 Tìm việc

1. Vào **Việc làm**.
2. Dùng bộ lọc theo:
   - Từ khóa
   - Ngành nghề
   - Tỉnh / thành phố
   - Loại công việc
3. Mở chi tiết tin tuyển dụng để xem:
   - Mô tả công việc
   - Yêu cầu
   - Quyền lợi
   - Thông tin liên hệ

### 2.4 Lưu tin và ứng tuyển

1. Mở một tin tuyển dụng phù hợp.
2. Chọn **Lưu tin** nếu muốn xem lại sau.
3. Chọn **Ứng tuyển** để nộp hồ sơ.
4. Kiểm tra lại CV và thông tin liên hệ trước khi gửi.
5. Theo dõi trạng thái ở **Việc đã ứng tuyển** hoặc **My Jobs**.

### 2.5 Theo dõi phỏng vấn AI

1. Khi được mời phỏng vấn, mở mục **Phỏng vấn của tôi** hoặc liên kết từ hệ thống.
2. Kiểm tra thiết bị âm thanh và mạng trước khi vào phòng.
3. Thực hiện phỏng vấn theo hướng dẫn trên màn hình.
4. Sau khi kết thúc, xem lại trạng thái và lịch sử nếu hệ thống có hiển thị.

### 2.6 Nhắn tin, thông báo và công ty

1. Vào **Thông báo** để xem cập nhật mới.
2. Vào **Chat** để trao đổi khi hệ thống cho phép.
3. Vào **Công ty** để xem thông tin doanh nghiệp và bài viết liên quan.

## 3. Hướng dẫn cho nhà tuyển dụng

### 3.1 Đăng ký và xác thực

1. Chọn **Nhà tuyển dụng** khi đăng ký.
2. Điền thông tin doanh nghiệp và tài khoản.
3. Hoàn tất xác minh nếu hệ thống yêu cầu.
4. Sau khi vào cổng employer, hệ thống sẽ mở trang dashboard.

### 3.2 Quản lý công ty

1. Vào **Company** hoặc **Công ty**.
2. Cập nhật:
   - Tên công ty
   - Logo
   - Ảnh bìa
   - Mô tả
   - Website và mạng xã hội
3. Quản lý thành viên nội bộ ở mục **Employees** nếu có quyền.

### 3.3 Đăng và quản lý tin tuyển dụng

1. Vào **Job Posts**.
2. Chọn **Create** để tạo tin mới.
3. Nhập các thông tin cần thiết:
   - Tên việc làm
   - Số lượng
   - Lương
   - Địa điểm
   - Mô tả
   - Yêu cầu
   - Quyền lợi
4. Lưu tin và chờ duyệt nếu quy trình yêu cầu.
5. Theo dõi lượt xem, lượt chia sẻ và trạng thái tin.

### 3.4 Tìm kiếm và quản lý ứng viên

1. Vào **Candidates**, **Profiles** hoặc **Applied Profiles**.
2. Lọc theo kỹ năng, kinh nghiệm, vị trí hoặc hồ sơ đã ứng tuyển.
3. Mở hồ sơ chi tiết để xem:
   - Thông tin cá nhân
   - Kinh nghiệm
   - Học vấn
   - Kỹ năng
   - Chứng chỉ
4. Lưu hồ sơ ứng viên phù hợp để theo dõi sau.

### 3.5 Tạo phỏng vấn AI

1. Vào **Interviews**.
2. Chọn **Create** để tạo phiên phỏng vấn.
3. Chọn bộ câu hỏi hoặc nhóm câu hỏi phù hợp.
4. Thiết lập lịch hẹn, ứng viên và tin tuyển dụng.
5. Chia sẻ link hoặc mã mời cho ứng viên.
6. Theo dõi lịch sử, transcript và điểm đánh giá sau phỏng vấn.

### 3.6 Quản lý nội dung và hỗ trợ

1. Vào **Blog** để tạo bài viết tuyển dụng hoặc thương hiệu nhà tuyển dụng.
2. Vào **Notifications** để xem thông báo hệ thống.
3. Vào **Support** nếu cần hỗ trợ.
4. Vào **Settings** để cập nhật cấu hình tài khoản.

## 4. Hướng dẫn cho admin

### 4.1 Đăng nhập

1. Truy cập `/admin/login`.
2. Đăng nhập bằng tài khoản có quyền quản trị.
3. Sau khi vào hệ thống, mở **Dashboard** để xem tổng quan.

### 4.2 Các khu vực quản trị chính

Admin có thể quản lý:

- `Users`
- `Jobs`
- `Profiles`
- `Companies`
- `Resumes`
- `Interviews`
- `Question Bank`
- `Question Groups`
- `Articles`
- `Banners`
- `Banner Types`
- `Feedbacks`
- `Cities`
- `Districts`
- `Wards`
- `Job Activity`
- `Job Notifications`
- `Settings`
- `Chat`

### 4.3 Quản lý người dùng

1. Vào **Users**.
2. Kiểm tra trạng thái tài khoản:
   - Hoạt động
   - Xác minh email
   - Quyền staff / superuser
3. Cập nhật thông tin, đổi mật khẩu, bật/tắt tài khoản khi cần.

### 4.4 Quản lý tin tuyển dụng

1. Vào **Jobs**.
2. Duyệt nội dung tin và kiểm tra tính hợp lệ.
3. Thay đổi trạng thái tin nếu cần:
   - Chờ duyệt
   - Đã duyệt
   - Từ chối
4. Theo dõi lượt xem, lượt chia sẻ và lịch sử thay đổi.

### 4.5 Quản lý phỏng vấn

1. Vào **Interviews**.
2. Kiểm tra danh sách phiên phỏng vấn, transcript và đánh giá.
3. Mở **Question Bank** và **Question Groups** để quản lý bộ câu hỏi.
4. Kiểm tra thống kê phỏng vấn nếu cần.

### 4.6 Quản lý nội dung và giao diện

1. Vào **Articles** để tạo hoặc sửa bài viết.
2. Vào **Banners** và **Banner Types** để quản lý banner hiển thị.
3. Vào **Feedbacks** để duyệt phản hồi người dùng.
4. Vào **Settings** để cấu hình các tham số hệ thống.

### 4.7 Quản lý địa danh

1. Vào **Cities**, **Districts** và **Wards**.
2. Kiểm tra dữ liệu địa lý dùng cho bộ lọc và hồ sơ.
3. Cập nhật khi có thay đổi dữ liệu hành chính.

## 5. Lưu ý vận hành

- Tài khoản phải đúng loại quyền mới thấy đúng portal.
- Một số chức năng có thể yêu cầu email đã xác minh.
- Khi upload ảnh hoặc CV, nên dùng định dạng phổ biến như JPG, PNG, PDF.
- Nếu phỏng vấn AI không vào được, kiểm tra lại micro, camera và kết nối mạng.

## 6. Hỗ trợ

Nếu cần chỉnh sửa thêm theo đúng quy trình nội bộ, nên bổ sung:

- Tên thương hiệu chính thức
- Ảnh chụp màn hình từng bước
- Số hotline / email hỗ trợ
- Quy trình phê duyệt nội bộ của doanh nghiệp

