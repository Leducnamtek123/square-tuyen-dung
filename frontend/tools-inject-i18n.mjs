import fs from 'fs';

function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  if (current[parts[parts.length - 1]] === undefined) {
    current[parts[parts.length - 1]] = value;
  }
}

const missing = [
  { ns: 'common', key: 'errorBoundary.title', fallback: 'Đã xảy ra lỗi' },
  { ns: 'common', key: 'errorBoundary.message', fallback: 'Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc tải lại trang.' },
  { ns: 'common', key: 'errorBoundary.copyError', fallback: 'Copy lỗi' },
  { ns: 'common', key: 'errorBoundary.retry', fallback: 'Thử lại' },
  { ns: 'common', key: 'errorBoundary.reload', fallback: 'Tải lại trang' },
  { ns: 'common', key: 'errors.networkError', fallback: 'Không thể kết nối đến máy chủ, vui lòng kiểm tra mạng.' },
  { ns: 'common', key: 'errors.unauthorized', fallback: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' },
  { ns: 'common', key: 'errors.forbidden', fallback: 'Bạn không có quyền thực hiện hành động này.' },
  { ns: 'common', key: 'errors.notFound', fallback: 'Tài nguyên yêu cầu không được tìm thấy.' },
  { ns: 'common', key: 'errors.payloadTooLarge', fallback: 'File quá lớn. Vui lòng sử dụng file nhỏ hơn.' },
  { ns: 'common', key: 'errors.tooManyRequests', fallback: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' },
  { ns: 'common', key: 'errors.serverError', fallback: 'Lỗi máy chủ, vui lòng thử lại sau.' },
  { ns: 'common', key: 'errors.generic', fallback: 'Đã xảy ra lỗi, vui lòng thử lại.' },
  
  { ns: 'jobseeker', key: 'home.topCompanies', fallback: 'Công ty nổi bật' },
  { ns: 'jobseeker', key: 'home.noCompaniesFound', fallback: 'Hiện chưa tìm công ty phù hợp với tiêu chí của bạn' },
  { ns: 'jobseeker', key: 'home.noFeedbacks', fallback: 'Chưa có người dùng nào đánh giá' },
  { ns: 'jobseeker', key: 'jobPost.timeLeft', fallback: 'Còn' },
  { ns: 'jobseeker', key: 'login.phone', fallback: 'Số điện thoại' },
  { ns: 'jobseeker', key: 'login.phoneIntro', fallback: 'Nhập số điện thoại của bạn để nhận mã xác thực.' },
  { ns: 'jobseeker', key: 'actions.sendOTP', fallback: 'Gửi mã OTP' },
  { ns: 'jobseeker', key: 'login.otpIntro', fallback: 'Nhập mã 6 chữ số đã được gửi đến điện thoại của bạn.' },
  { ns: 'jobseeker', key: 'actions.verifyOTP', fallback: 'Xác thực & Đăng nhập' },
  { ns: 'jobseeker', key: 'actions.changePhone', fallback: 'Thay đổi số điện thoại' },
  { ns: 'jobseeker', key: 'login.resendIn', fallback: 'Gửi lại sau' },
  { ns: 'jobseeker', key: 'actions.resendOTP', fallback: 'Gửi lại mã' },
  { ns: 'jobseeker', key: 'form.phoneNumber', fallback: 'Số điện thoại' },
  { ns: 'jobseeker', key: 'form.otpCode', fallback: 'Mã OTP' },

  { ns: 'employer', key: 'form.district', fallback: 'Phường/Xã' },
  { ns: 'employer', key: 'form.districtPlaceholder', fallback: 'Chọn phường/xã' },
  { ns: 'employer', key: 'jobPostForm.section.basicInfo', fallback: 'Thông tin cơ bản' },
  { ns: 'employer', key: 'jobPostForm.section.location', fallback: 'Địa điểm làm việc' },
  { ns: 'employer', key: 'jobPostForm.section.contact', fallback: 'Thông tin liên hệ' },
  { ns: 'employer', key: 'questionBank.deleteTitle', fallback: 'Xóa câu hỏi' },
  { ns: 'employer', key: 'questionBank.hint', fallback: 'Nhập nội dung câu hỏi rõ ràng và ngắn gọn.' },
];

const localesPath = './src/i18n/locales/vi';

// Group by ns
const grouped = {};
missing.forEach(m => {
  if (!grouped[m.ns]) grouped[m.ns] = [];
  grouped[m.ns].push(m);
});

for (const ns in grouped) {
  const file = `${localesPath}/${ns}.json`;
  let data = {};
  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  
  grouped[ns].forEach(m => {
    setNestedValue(data, m.key, m.fallback);
  });
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`Updated ${file}`);
}
