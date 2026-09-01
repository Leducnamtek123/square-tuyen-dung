export interface LegalSection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    id: string;
    title: string;
    content: string;
    callout?: {
      type: 'info' | 'warning' | 'tip';
      text: string;
    };
  }[];
  callout?: {
    type: 'info' | 'warning' | 'tip';
    text: string;
  };
}

export interface LegalDocument {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: 'legal' | 'policy' | 'guide' | 'sitemap';
  targetAudience: 'all' | 'candidate' | 'employer';
  lastUpdated: string;
  effectiveDate: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  'tuan-thu-va-su-dong-y-cua-khach-hang': {
    slug: 'tuan-thu-va-su-dong-y-cua-khach-hang',
    title: 'Tuân thủ và xác nhận sự đồng ý về chính sách dữ liệu cá nhân',
    shortTitle: 'Tuân thủ & Sự đồng ý',
    subtitle: 'Cam kết bảo vệ dữ liệu cá nhân và quyền riêng tư theo Nghị định 13/2023/NĐ-CP. Thông tin minh bạch về thu thập, xử lý và quyền của người dùng tại InfoHR.',
    category: 'legal',
    targetAudience: 'all',
    lastUpdated: '18/11/2024',
    effectiveDate: '01/07/2023',
    summary: 'InfoHR hiểu rằng việc bảo vệ dữ liệu cá nhân của người dùng là vô cùng quan trọng. Chúng tôi cam kết tuân thủ nghiêm ngặt Nghị định số 13/2023/NĐ-CP và các quy định pháp luật liên quan về bảo vệ dữ liệu cá nhân tại Việt Nam.',
    sections: [
      {
        id: 'tong-quan-nghi-dinh-13',
        title: '1. Cam kết tuân thủ Nghị định 13/2023/NĐ-CP',
        content: 'Theo Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân, InfoHR thực hiện đầy đủ các biện pháp kỹ thuật và tổ chức để bảo vệ dữ liệu cá nhân của Người tìm việc và Nhà tuyển dụng. Chúng tôi chỉ thu thập, xử lý và chia sẻ dữ liệu khi có sự đồng ý rõ ràng, tự nguyện của chủ thể dữ liệu.',
        callout: {
          type: 'info',
          text: 'Kể từ ngày 01/07/2023, InfoHR áp dụng quy trình xác nhận sự đồng ý minh bạch cho mọi hoạt động thu thập và xử lý dữ liệu cá nhân trên toàn hệ thống.',
        },
      },
      {
        id: 'cach-cho-phep-su-dung',
        title: '2. Người dùng cho phép sử dụng thông tin cá nhân',
        content: 'Khi sử dụng các dịch vụ trên nền tảng website InfoHR.vn, người dùng xác nhận đồng ý cho phép InfoHR sử dụng thông tin cá nhân thông qua các phương thức minh bạch dưới đây:',
        subsections: [
          {
            id: 'dang-nhap-dang-ky',
            title: 'a. Đăng nhập hoặc Đăng ký tài khoản',
            content: 'Bằng việc đăng ký hoặc đăng nhập tài khoản trên InfoHR.vn (thông qua Email, Google, hoặc Số điện thoại), người dùng đã đồng ý cho phép InfoHR lưu trữ và xử lý thông tin cơ bản (họ tên, email, số điện thoại) phục vụ việc cung cấp dịch vụ tuyển dụng.',
          },
          {
            id: 'nop-ho-so',
            title: 'b. Nộp hồ sơ ứng tuyển (Apply)',
            content: 'Khi người dùng chủ động nộp CV/hồ sơ vào một tin tuyển dụng, người dùng đồng ý chia sẻ thông tin trong CV với InfoHR và chuyển tiếp thông tin này đến Nhà tuyển dụng đăng tin để phục vụ quy trình xét duyệt và liên hệ phỏng vấn.',
          },
          {
            id: 'bat-tim-kiem-ho-so',
            title: 'c. Bật chế độ "Cho phép Nhà tuyển dụng tìm kiếm hồ sơ"',
            content: 'Khi bật tính năng tìm kiếm hồ sơ trong trang quản lý tài khoản, ứng viên đồng ý cho phép các Nhà tuyển dụng đã được InfoHR xác thực có thể tra cứu và tiếp cận hồ sơ của mình để đề xuất cơ hội việc làm phù hợp.',
          },
          {
            id: 'ho-tro-cskh',
            title: 'd. Nhân viên Chăm sóc khách hàng hỗ trợ tạo hồ sơ',
            content: 'Trường hợp người dùng nhờ chuyên viên CSKH của InfoHR hỗ trợ khởi tạo hoặc tối ưu CV, hệ thống sẽ gửi email xác nhận. Người dùng click xác nhận trong email để đồng ý ủy quyền xử lý thông tin.',
          },
        ],
      },
      {
        id: 'thu-hoi-quyen-su-dung',
        title: '3. Quyền thu hồi sự đồng ý sử dụng thông tin',
        content: 'Người dùng có toàn quyền thu hồi sự đồng ý chia sẻ thông tin cá nhân bất kỳ lúc nào bằng cách:',
        subsections: [
          {
            id: 'cac-buoc-thu-hoi',
            title: 'Quy trình thực hiện thu hồi',
            content: '1. Truy cập phần Cài đặt tài khoản > Quyền riêng tư & Dữ liệu cá nhân.\n2. Nhấp chọn "Thu hồi quyền chia sẻ dữ liệu cá nhân" hoặc nhấp vào liên kết xác nhận thu hồi trong email thông báo định kỳ của InfoHR.\n3. Hệ thống sẽ hiển thị bảng thông báo xác nhận trước khi thực hiện thu hồi hoàn toàn.',
            callout: {
              type: 'warning',
              text: 'Lưu ý: Nếu chọn thu hồi sự đồng ý, tài khoản của bạn sẽ không thể tiếp tục sử dụng các dịch vụ tìm việc, nộp hồ sơ hoặc nhận đề xuất việc làm từ nhà tuyển dụng.',
            },
          },
        ],
      },
      {
        id: 'quyen-chu-the-du-lieu',
        title: '4. Quyền của chủ thể dữ liệu theo pháp luật',
        content: 'Theo quy định của pháp luật, bạn có đầy đủ các quyền: Quyền được biết; Quyền đồng ý; Quyền truy cập; Quyền rút lại sự đồng ý; Quyền xóa dữ liệu; Quyền hạn chế xử lý dữ liệu; Quyền cung cấp dữ liệu; Quyền phản đối xử lý dữ liệu; Quyền khiếu nại, tố cáo, khởi kiện; Quyền yêu cầu bồi thường thiệt hại; và Quyền tự bảo vệ.',
      },
      {
        id: 'lien-he-bao-ve-du-lieu',
        title: '5. Bộ phận tiếp nhận & Bảo vệ dữ liệu cá nhân InfoHR',
        content: 'Mọi thắc mắc, yêu cầu tra cứu, chỉnh sửa hoặc xóa dữ liệu cá nhân, vui lòng liên hệ:\n• Công Ty Cổ Phần Công Nghệ Tuyển Dụng InfoHR\n• Địa chỉ: 29 Hòa Hảo, Phường 2, Quận 10, TP. Hồ Chí Minh, Việt Nam\n• Hotline: 0987 987 733 | (028) 7108 2424\n• Email tiếp nhận yêu cầu bảo mật: support@infohr.vn / dpo@infohr.vn',
      },
    ],
  },

  'thoa-thuan-su-dung': {
    slug: 'thoa-thuan-su-dung',
    title: 'Thỏa thuận sử dụng và Điều khoản dịch vụ InfoHR',
    shortTitle: 'Điều khoản sử dụng',
    subtitle: 'Quy định và điều kiện chi tiết về việc sử dụng dịch vụ tìm việc, đăng tin tuyển dụng và quyền lợi của người dùng trên nền tảng tuyển dụng InfoHR.vn.',
    category: 'legal',
    targetAudience: 'all',
    lastUpdated: '18/11/2024',
    effectiveDate: '01/01/2024',
    summary: 'Bạn vui lòng đọc kỹ các Điều khoản & Điều kiện trong Thỏa thuận sử dụng này trước khi đăng ký, truy cập và sử dụng dịch vụ trên Website InfoHR.vn. Bằng việc truy cập hoặc sử dụng dịch vụ, bạn xác nhận đã đọc, hiểu và đồng ý chịu sự ràng buộc bởi các quy định này.',
    sections: [
      {
        id: 'dieu-1-doi-tuong-pham-vi',
        title: 'ĐIỀU 1. ĐỐI TƯỢNG VÀ PHẠM VI ÁP DỤNG',
        content: '1.1 Thỏa thuận này áp dụng đối với tất cả các cá nhân, tổ chức truy cập và/hoặc sử dụng dịch vụ trên nền tảng InfoHR.vn; các trang mạng, dịch vụ và ứng dụng trực thuộc Công Ty Cổ Phần Công Nghệ Tuyển Dụng InfoHR.\n\n1.2 Thỏa thuận áp dụng cho mọi hành vi phát sinh từ việc truy cập, đăng ký tài khoản, tìm kiếm việc làm, đăng tin tuyển dụng, nộp hồ sơ, kết nối phỏng vấn trực tiếp và sử dụng các dịch vụ liên quan.',
      },
      {
        id: 'dieu-2-dinh-nghia',
        title: 'ĐIỀU 2. ĐỊNH NGHĨA VÀ GIẢI THÍCH THUẬT NGỮ',
        content: '• InfoHR / Chúng tôi: Công Ty Cổ Phần Công Nghệ Tuyển Dụng InfoHR.\n• Website / Nền tảng: Hệ thống trực tuyến tại địa chỉ InfoHR.vn và các ứng dụng di động liên quan.\n• Người Dùng: Bất kỳ cá nhân (Người tìm việc) hoặc tổ chức (Nhà tuyển dụng) truy cập và sử dụng dịch vụ.\n• Nội Dung Người Dùng: Toàn bộ thông tin, hồ sơ CV, tin tuyển dụng, hình ảnh, văn bản được đăng tải hoặc truyền tải qua nền tảng.\n• Dịch Vụ: Các giải pháp kết nối tuyển dụng, tìm việc làm, phỏng vấn trực tuyến AI và các dịch vụ giá trị gia tăng khác do InfoHR cung cấp.',
      },
      {
        id: 'dieu-3-xac-thuc-tai-khoan',
        title: 'ĐIỀU 3. XÁC THỰC THÔNG TIN VÀ ĐĂNG KÝ SỬ DỤNG',
        content: '3.1 Để sử dụng đầy đủ các tính năng, Người Dùng cần cung cấp thông tin chính xác, trung thực khi đăng ký tài khoản.\n\n3.2 Nhà tuyển dụng có nghĩa vụ cung cấp giấy phép đăng ký kinh doanh hoặc giấy tờ xác thực pháp lý khi có yêu cầu để đảm bảo tính an toàn và minh bạch cho cộng đồng ứng viên.',
      },
      {
        id: 'dieu-4-bao-mat-tai-khoan',
        title: 'ĐIỀU 4. TRÁCH NHIỆM BẢO MẬT TÀI KHOẢN',
        content: '4.1 Người Dùng có nghĩa vụ bảo mật tên đăng nhập, mật khẩu và mã xác thực OTP. Người Dùng chịu trách nhiệm đối với toàn bộ hoạt động diễn ra dưới tài khoản của mình.\n\n4.2 Trường hợp phát hiện tài khoản bị truy cập trái phép, Người Dùng phải thông báo ngay cho InfoHR qua hotline hoặc email hỗ trợ để được xử lý kịp thời.',
      },
      {
        id: 'dieu-5-thoa-thuan-thong-tin',
        title: 'ĐIỀU 5. NỘI DUNG VÀ HÀNH VI BỊ NGHIÊM CẤM',
        content: 'Người Dùng cam kết KHÔNG thực hiện các hành vi sau:\n• Đăng tải thông tin sai sự thật, lừa đảo, giả mạo tổ chức hoặc cá nhân khác.\n• Thu bất kỳ khoản phí nào của ứng viên trái quy định pháp luật.\n• Đăng tin tuyển dụng liên quan đến đa cấp trái phép, mại dâm, cờ bạc hoặc các ngành nghề bị pháp luật cấm.\n• Phát tán virus, mã độc, spam hoặc can thiệp phá hoại hệ thống của InfoHR.\n• Vi phạm bản quyền, nhãn hiệu hoặc quyền sở hữu trí tuệ của bên thứ ba.',
      },
      {
        id: 'dieu-6-so-huu-tri-tue',
        title: 'ĐIỀU 6. QUYỀN SỞ HỮU TRÍ TUỆ',
        content: 'Toàn bộ giao diện, logo, nhãn hiệu, mã nguồn, cơ sở dữ liệu và nội dung biên soạn trên InfoHR.vn thuộc sở hữu độc quyền của InfoHR hoặc được cấp phép hợp pháp. Nghiêm cấm sao chép, trích xuất hoặc phân phối lại dưới mọi hình thức khi chưa có sự đồng ý bằng văn bản.',
      },
      {
        id: 'dieu-7-quang-cao-thong-bao',
        title: 'ĐIỀU 7. THỎA THUẬN VỀ THÔNG BÁO VÀ QUẢNG CÁO',
        content: 'Bằng việc đăng ký tài khoản, Người Dùng đồng ý nhận các thông báo liên quan đến trạng thái hồ sơ, thông báo việc làm phù hợp, tin tức tuyển dụng và ưu đãi dịch vụ qua email, SMS hoặc thông báo trên ứng dụng.',
      },
      {
        id: 'dieu-8-che-tai-xu-ly',
        title: 'ĐIỀU 8. CHẾ TÀI VÀ XỬ LÝ VI PHẠM',
        content: 'InfoHR có toàn quyền tạm khóa, chấm dứt tài khoản hoặc gỡ bỏ nội dung vi phạm mà không cần báo trước nếu Người Dùng vi phạm Thỏa thuận này. Trong các trường hợp nghiêm trọng, InfoHR sẽ phối hợp với cơ quan pháp luật có thẩm quyền để xử lý theo luật định.',
      },
      {
        id: 'dieu-9-giai-quyet-tranh-chap',
        title: 'ĐIỀU 9. LUẬT ÁP DỤNG VÀ GIẢI QUYẾT TRANH CHẤP',
        content: 'Thỏa thuận này được điều chỉnh bởi pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh trước hết sẽ được giải quyết thông qua thương lượng, hòa giải. Nếu không giải quyết được trong vòng 60 ngày, vụ việc sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại TP. Hồ Chí Minh.',
      },
      {
        id: 'dieu-10-hieu-luc-thi-hanh',
        title: 'ĐIỀU 10. HIỆU LỰC VÀ SỬA ĐỔI ĐIỀU KHOẢN',
        content: 'InfoHR có quyền sửa đổi, cập nhật Thỏa thuận sử dụng này theo từng thời kỳ để phù hợp với quy định pháp luật và hoạt động vận hành. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên Website.',
      },
    ],
  },

  'quy-dinh-bao-mat': {
    slug: 'quy-dinh-bao-mat',
    title: 'Chính sách bảo mật thông tin & Quyền riêng tư',
    shortTitle: 'Quy định bảo mật',
    subtitle: 'Tiêu chuẩn và cam kết bảo vệ an toàn thông tin, bảo mật dữ liệu cá nhân của người tìm việc và nhà tuyển dụng trên hệ thống InfoHR Việt Nam.',
    category: 'policy',
    targetAudience: 'all',
    lastUpdated: '18/11/2024',
    effectiveDate: '01/01/2024',
    summary: 'Chính sách bảo mật này mô tả cách InfoHR thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của Người tìm việc và Nhà tuyển dụng khi truy cập và sử dụng dịch vụ trên nền tảng của chúng tôi.',
    sections: [
      {
        id: 'muc-dich-thu-thap',
        title: '1. Mục đích thu thập thông tin',
        content: 'InfoHR thu thập thông tin người dùng nhằm các mục đích:\n• Cung cấp tài khoản, xác thực danh tính và kết nối việc làm.\n• Gợi ý công việc phù hợp dựa trên kỹ năng, kinh nghiệm và vị trí địa lý.\n• Hỗ trợ Nhà tuyển dụng tìm kiếm ứng viên tiềm năng.\n• Gửi thông báo về lịch phỏng vấn, trạng thái ứng tuyển và các bản tin tuyển dụng hữu ích.\n• Nâng cao chất lượng dịch vụ và ngăn ngừa các hành vi gian lận.',
      },
      {
        id: 'pham-vi-thu-thap',
        title: '2. Loại thông tin được thu thập',
        content: '• Thông tin cá nhân cơ bản: Họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ email, địa chỉ cư trú.\n• Thông tin nghề nghiệp (CV): Học vấn, kinh nghiệm làm việc, kỹ năng, chứng chỉ, mức lương mong muốn, hồ sơ đính kèm.\n• Thông tin Nhà tuyển dụng: Tên doanh nghiệp, mã số thuế, giấy phép kinh doanh, thông tin người liên hệ, địa chỉ trụ sở.\n• Dữ liệu kỹ thuật: Địa chỉ IP, loại trình duyệt, thời gian truy cập, cookie và lịch sử tương tác trên website.',
      },
      {
        id: 'thoi-gian-luu-tru',
        title: '3. Thời gian lưu trữ thông tin',
        content: 'Dữ liệu cá nhân của Người Dùng được lưu trữ an toàn trên hệ thống máy chủ cho đến khi Người Dùng có yêu cầu hủy bỏ hoặc tự thực hiện xóa tài khoản.',
      },
      {
        id: 'chia-se-thong-tin',
        title: '4. Những bên có thể tiếp cận thông tin',
        content: 'InfoHR cam kết không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại, ngoại trừ các trường hợp sau:\n• Nhà tuyển dụng nhận được CV khi ứng viên nộp hồ sơ trực tiếp.\n• Nhà tuyển dụng được cấp quyền xem hồ sơ khi ứng viên bật tính năng cho phép tìm kiếm.\n• Đơn vị cung cấp dịch vụ hạ tầng kỹ thuật (máy chủ đám mây, dịch vụ email/SMS xác thực) có ký thỏa thuận bảo mật nghiêm ngặt.\n• Cơ quan nhà nước có thẩm quyền khi có yêu cầu bằng văn bản theo đúng trình tự pháp luật.',
      },
      {
        id: 'bien-phap-bao-mat',
        title: '5. Các biện pháp bảo mật dữ liệu',
        content: '• Mã hóa dữ liệu truyền tải với chứng chỉ SSL/TLS 256-bit.\n• Mã hóa một chiều mật khẩu người dùng (Bcrypt/Argon2).\n• Hệ thống tường lửa WAF và kiểm soát truy cập phân quyền nghiêm ngặt.\n• Sao lưu định kỳ và kiểm tra bảo mật thường xuyên.',
      },
      {
        id: 'quyen-cua-ban',
        title: '6. Quyền chỉnh sửa và xóa dữ liệu',
        content: 'Người Dùng có thể tự đăng nhập để kiểm tra, cập nhật hoặc xóa thông tin cá nhân trong trang Quản lý tài khoản, hoặc gửi yêu cầu xóa toàn bộ dữ liệu qua email: support@infohr.vn.',
      },
    ],
  },

  'chinh-sach-bao-hanh': {
    slug: 'chinh-sach-bao-hanh',
    title: 'Chính sách bảo hành dịch vụ & Quy định hoàn tiền',
    shortTitle: 'Chính sách bảo hành',
    subtitle: 'Quy định bảo hành quyền lợi, hoàn tiền và bảo lưu dịch vụ đăng tin dành cho Nhà tuyển dụng sử dụng giải pháp tuyển dụng trên hệ thống InfoHR.',
    category: 'policy',
    targetAudience: 'employer',
    lastUpdated: '18/11/2024',
    effectiveDate: '01/01/2024',
    summary: 'InfoHR cam kết mang lại hiệu quả tuyển dụng thực tế và trải nghiệm dịch vụ an tâm cho mọi đối tác doanh nghiệp thông qua chính sách bảo hành dịch vụ rõ ràng, minh bạch.',
    sections: [
      {
        id: 'pham-vi-bao-hanh',
        title: '1. Phạm vi áp dụng chính sách bảo hành',
        content: 'Chính sách này áp dụng cho tất cả các gói dịch vụ trả phí trên InfoHR bao gồm: Gói đăng tin tuyển dụng VIP, Gói lọc hồ sơ ứng viên (Resume Search), Dịch vụ Phỏng vấn AI & Đề xuất ứng viên chuyên sâu.',
      },
      {
        id: 'dieu-kien-bao-hanh-ho-so',
        title: '2. Bảo hành lượt mở hồ sơ ứng viên',
        content: 'Nhà tuyển dụng được bù lại 100% lượt mở hồ sơ (Credit) trong các trường hợp sau:\n• Số điện thoại hoặc email của ứng viên không liên lạc được trong vòng 3 ngày làm việc kể từ khi mở hồ sơ.\n• Ứng viên xác nhận không hề tìm việc hoặc thông tin hoàn toàn không đúng sự thật.\n\nThời hạn gửi yêu cầu bảo hành hồ sơ: Trong vòng 05 ngày làm việc kể từ thời điểm mở hồ sơ.',
      },
      {
        id: 'bao-luu-dich-vu',
        title: '3. Chính sách bảo lưu và gia hạn tin đăng',
        content: 'Trường hợp doanh nghiệp đã tuyển đủ vị trí trước thời hạn của gói đăng tin, InfoHR hỗ trợ bảo lưu thời gian còn lại của gói tin đăng tối đa 06 tháng hoặc chuyển đổi sang vị trí tuyển dụng khác tương đương.',
      },
      {
        id: 'quy-dinh-hoan-tien',
        title: '4. Quy định về hoàn tiền',
        content: 'InfoHR thực hiện hoàn tiền trong trường hợp sự cố kỹ thuật từ phía hệ thống InfoHR kéo dài quá 48 giờ mà không thể khắc phục, gây ảnh hưởng trực tiếp đến quyền lợi của khách hàng.\n\nHình thức hoàn tiền: Chuyển khoản trực tiếp về tài khoản ngân hàng của doanh nghiệp trong vòng 03 - 07 ngày làm việc.',
      },
      {
        id: 'quy-trinh-tiep-nhan',
        title: '5. Quy trình tiếp nhận yêu cầu bảo hành',
        content: '1. Doanh nghiệp gửi yêu cầu bảo hành kèm mã hồ sơ/mã đơn hàng qua email: support@infohr.vn hoặc liên hệ chuyên viên phụ trách.\n2. Bộ phận CSKH kiểm tra và phản hồi kết quả trong vòng 24 giờ làm việc.\n3. Hệ thống tự động hoàn lại lượt mở hồ sơ hoặc cập nhật thời hạn dịch vụ cho quý khách.',
      },
    ],
  },

  'so-do-trang-web': {
    slug: 'so-do-trang-web',
    title: 'Sơ đồ trang web InfoHR (HTML Sitemap)',
    shortTitle: 'Sơ đồ trang web',
    subtitle: 'Sơ đồ trang web InfoHR tổng hợp toàn bộ liên kết quan trọng, danh mục tìm việc làm theo ngành nghề, tỉnh thành, công ty và cẩm nang nghề nghiệp.',
    category: 'sitemap',
    targetAudience: 'all',
    lastUpdated: '18/11/2024',
    effectiveDate: '01/01/2024',
    summary: 'Sơ đồ trang web giúp ứng viên và nhà tuyển dụng dễ dàng định hướng, tra cứu việc làm theo ngành nghề, khu vực địa lý, cẩm nang kiến thức và dịch vụ tuyển dụng.',
    sections: [
      {
        id: 'danh-cho-ung-vien',
        title: '1. Dành cho Người tìm việc',
        content: '• Trang chủ tìm việc: / \n• Tìm việc làm mới nhất: /viec-lam\n• Việc làm theo ngành nghề: /viec-lam-theo-nganh-nghe\n• Việc làm theo tỉnh thành: /viec-lam-theo-tinh-thanh\n• Việc làm theo hình thức: /viec-lam-theo-hinh-thuc-lam-viec\n• Danh sách công ty: /cong-ty\n• Cẩm nang nghề nghiệp: /tin-tuc\n• Tạo & Quản lý CV trực tuyến: /ho-so\n• Việc làm đã ứng tuyển: /viec-lam-cua-toi\n• Lịch phỏng vấn cá nhân: /phong-van-cua-toi',
      },
      {
        id: 'danh-cho-nha-tuyen-dung',
        title: '2. Dành cho Nhà tuyển dụng',
        content: '• Trang chủ tuyển dụng: /employer\n• Đăng tin tuyển dụng: /employer/job-posts\n• Tìm kiếm ứng viên: /employer/candidates\n• Bảng giá dịch vụ: /employer/pricing\n• Hệ thống phỏng vấn trực tuyến: /employer/interviews\n• Ngân hàng câu hỏi phỏng vấn: /employer/question-bank\n• Quản lý hồ sơ ứng tuyển: /employer/applied-profiles\n• Quản trị nhân sự HRM: /employer/hrm',
      },
      {
        id: 'thong-tin-phap-ly',
        title: '3. Thông tin pháp lý & Hỗ trợ',
        content: '• Về chúng tôi: /about-us\n• Liên hệ: /lien-he\n• Điều khoản sử dụng: /thoa-thuan-su-dung.html\n• Quy định bảo mật: /quy-dinh-bao-mat.html\n• Tuân thủ & Sự đồng ý: /tuan-thu-va-su-dong-y-cua-khach-hang.html\n• Chính sách bảo hành: /employer/chinh-sach-bao-hanh.html\n• Câu hỏi thường gặp: /faq',
      },
    ],
  },

  'quy-dinh-dang-tin': {
    slug: 'quy-dinh-dang-tin',
    title: 'Quy định đăng tin tuyển dụng và Tiêu chuẩn kiểm duyệt',
    shortTitle: 'Quy định đăng tin',
    subtitle: 'Hướng dẫn và tiêu chuẩn đăng tin tuyển dụng minh bạch, hiệu quả, chống trùng lặp và tuân thủ đúng quy định pháp luật lao động Việt Nam.',
    category: 'policy',
    targetAudience: 'employer',
    lastUpdated: '18/11/2024',
    effectiveDate: '01/01/2024',
    summary: 'Quy định đăng tin tuyển dụng nhằm đảm bảo tính chính xác, minh bạch, bảo vệ quyền lợi hợp pháp của người tìm việc và nâng cao uy tín tuyển dụng của doanh nghiệp.',
    sections: [
      {
        id: 'tieu-chuan-tieu-de-mo-ta',
        title: '1. Tiêu chuẩn tiêu đề và mô tả công việc',
        content: '• Tiêu đề tin đăng phải rõ ràng, phản ánh đúng chức danh và vị trí tuyển dụng (Ví dụ: "Nhân Viên Kế Toán Tổng Hợp", "Senior React Developer"). Không chèn ký tự đặc biệt, viết hoa toàn bộ hoặc kèm số điện thoại trên tiêu đề.\n• Mô tả công việc chi tiết: Nêu rõ nhiệm vụ cụ thể, yêu cầu kinh nghiệm, kỹ năng và quyền lợi dành cho ứng viên.\n• Mức lương: Khuyến khích công khai khoảng lương cụ thể để tăng tỷ lệ ứng tuyển chất lượng.',
      },
      {
        id: 'quy-dinh-chong-trung-lap',
        title: '2. Quy định chống tin đăng trùng lặp (Anti-Spam)',
        content: 'Một doanh nghiệp không được đăng nhiều tin tuyển dụng có cùng vị trí, cùng địa điểm làm việc trong cùng một khoảng thời gian. Các tin đăng trùng lặp sẽ bị hệ thống tự động gộp hoặc từ chối duyệt.',
      },
      {
        id: 'noi-dung-cam-dang-tai',
        title: '3. Các nội dung tuyệt đối cấm đăng tải',
        content: '• Tuyển dụng các công việc bất hợp pháp, kinh doanh đa cấp không có giấy phép, môi giới việc làm thu phí trước.\n• Yêu cầu ứng viên nộp tiền đặt cọc, thế chấp tài sản hoặc mua hàng hóa.\n• Phân biệt đối xử về giới tính, vùng miền, tôn giáo trái pháp luật lao động.\n• Đăng tin tuyển dụng không đúng với hoạt động kinh doanh thực tế của công ty.',
      },
      {
        id: 'quy-trinh-kiem-duyet',
        title: '4. Quy trình kiểm duyệt tin đăng',
        content: '• Mọi tin đăng mới sẽ được hệ thống kiểm duyệt tự động kết hợp đội ngũ kiểm duyệt viên InfoHR xác minh trong vòng tối đa 02 giờ làm việc.\n• Đối với tài khoản doanh nghiệp đã xác thực, tin đăng sẽ được ưu tiên xuất bản ngay lập tức.',
      },
    ],
  },
};

// Aliases mapping for flexible slug resolutions
export const LEGAL_SLUG_ALIASES: Record<string, string> = {
  'dieu-khoan-su-dung': 'thoa-thuan-su-dung',
  'thoa-thuan-su-dung': 'thoa-thuan-su-dung',
  'terms-of-service': 'thoa-thuan-su-dung',
  'terms': 'thoa-thuan-su-dung',
  'chinh-sach-bao-mat': 'quy-dinh-bao-mat',
  'quy-dinh-bao-mat': 'quy-dinh-bao-mat',
  'chinh-sach-du-lieu-ca-nhan': 'quy-dinh-bao-mat',
  'privacy-policy': 'quy-dinh-bao-mat',
  'privacy': 'quy-dinh-bao-mat',
  'tuan-thu-va-su-dong-y-cua-khach-hang': 'tuan-thu-va-su-dong-y-cua-khach-hang',
  'compliance-and-consent': 'tuan-thu-va-su-dong-y-cua-khach-hang',
  'chinh-sach-bao-hanh': 'chinh-sach-bao-hanh',
  'quy-dinh-dang-tin': 'quy-dinh-dang-tin',
  'quy-dinh-dang-tin-tuyen-dung': 'quy-dinh-dang-tin',
  'so-do-trang-web': 'so-do-trang-web',
  'sitemap': 'so-do-trang-web',
};

export const getLegalDocument = (rawSlug: string): LegalDocument | null => {
  if (!rawSlug) return null;
  // Strip trailing .html if provided in query or slug param
  const cleanSlug = rawSlug.replace(/\.html$/i, '').trim().toLowerCase();
  const canonicalSlug = LEGAL_SLUG_ALIASES[cleanSlug] || cleanSlug;
  return LEGAL_DOCUMENTS[canonicalSlug] || null;
};
