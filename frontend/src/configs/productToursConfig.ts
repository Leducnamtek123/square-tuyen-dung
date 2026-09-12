import type { TourConfig } from '@/components/Features/ProductTour/types';

export type ProductTourKey =
  | 'interview_ai_live'
  | 'practice_room'
  | 'candidate_dashboard'
  | 'cv_builder'
  | 'salary_benchmark'
  | 'employer_dashboard'
  | 'employer_interview_create'
  | 'employer_interview_detail'
  | 'hrm_dashboard';

export const PRODUCT_TOURS_CONFIG: Record<string, TourConfig> = {
  interview_ai_live: {
    key: 'interview_ai_live',
    title: 'Hướng dẫn buồng phỏng vấn AI',
    themeMode: 'light',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'interview-recording',
        target: '[data-tour="interview-recording"]',
        title: 'Tự động ghi hình cuộc họp',
        content:
          'Biểu tượng vòng tròn đỏ và đồng hồ đếm thời gian cho biết buổi phỏng vấn đang được tự động ghi hình và lưu trữ bảo mật phục vụ đánh giá chuyên môn.',
        placement: 'bottom',
      },
      {
        id: 'interview-hints',
        target: '[data-tour="interview-hints"]',
        title: 'Gợi ý trả lời STAR',
        content:
          'Nhấn vào đây để xem gợi ý trả lời theo phương pháp STAR: Tình huống Situation, Nhiệm vụ Task, Hành động Action và Kết quả Result khi bạn cần tham khảo.',
        placement: 'right',
      },
      {
        id: 'interview-roadmap',
        target: '[data-tour="interview-roadmap"]',
        title: 'Lộ trình phỏng vấn',
        content:
          'Theo dõi tiến độ buổi phỏng vấn, số lượng câu hỏi và nhóm năng lực bạn đang trả lời gồm Phù hợp văn hóa, Chuyên môn và Xử lý tình huống.',
        placement: 'left',
      },
      {
        id: 'interview-agent',
        target: '[data-tour="interview-agent"]',
        title: 'Phỏng vấn viên AI & Sóng âm',
        content:
          'Lắng nghe phỏng vấn viên ảo đặt câu hỏi. Khi bạn nói, dải sóng âm aura sẽ phản hồi chuyển động theo thời gian thực.',
        placement: 'bottom',
      },
      {
        id: 'interview-controls',
        target: '[data-tour="interview-controls"]',
        title: 'Bảng điều khiển phỏng vấn',
        content:
          'Bật/tắt micro, camera và bấm nút bắt đầu trả lời hoặc chuyển câu tiếp theo khi bạn hoàn thành phần trình bày.',
        placement: 'top',
      },
    ],
  },

  practice_room: {
    key: 'practice_room',
    title: 'Hướng dẫn phòng luyện tập phỏng vấn',
    themeMode: 'light',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'practice-topics',
        target: '[data-tour="practice-topics"]',
        title: 'Thiết lập vị trí & Cấp bậc',
        content:
          'Tùy chỉnh chức danh, chuyên ngành, cấp bậc thử thách và số lượng câu hỏi để khởi tạo phiên phỏng vấn riêng.',
        placement: 'bottom',
      },
      {
        id: 'practice-start',
        target: '[data-tour="practice-start"]',
        title: 'Khởi tạo phỏng vấn AI tức thì',
        content:
          'Nhấn nút này để vào phòng phỏng vấn trực tiếp với AI. Hệ thống sẽ kết nối microphone và trợ lý AI sẽ phỏng vấn bạn bằng giọng nói.',
        placement: 'top',
      },
      {
        id: 'practice-bank',
        target: '[data-tour="practice-bank"]',
        title: 'Ngân hàng câu hỏi thực chiến',
        content:
          'Tra cứu hàng trăm câu hỏi tuyển dụng theo từng ngành nghề, xem trước dàn ý trả lời chuẩn STAR và mẹo ghi điểm đắt giá.',
        placement: 'top',
      },
    ],
  },

  candidate_dashboard: {
    key: 'candidate_dashboard',
    title: 'Hướng dẫn bảng điều khiển ứng viên',
    themeMode: 'light',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'candidate-kpi',
        target: '[data-tour="candidate-kpi"]',
        title: 'Chỉ số hồ sơ cốt lõi',
        content:
          'Theo dõi điểm chất lượng CV do AI phân tích, số lượt nhà tuyển dụng đã xem hồ sơ và các lịch phỏng vấn sắp tới.',
        placement: 'bottom',
      },
      {
        id: 'candidate-ai-jobs',
        target: '[data-tour="candidate-ai-jobs"]',
        title: 'Việc làm AI đề xuất',
        content:
          'Danh sách các cơ hội việc làm có độ tương thích kỹ năng cao nhất được thuật toán AI tính toán từ hồ sơ của bạn.',
        placement: 'top',
      },
      {
        id: 'candidate-activity-chart',
        target: '[data-tour="candidate-activity-chart"]',
        title: 'Biểu đồ hoạt động ứng tuyển',
        content:
          'Theo dõi trực quan tỷ lệ hồ sơ được duyệt và phản hồi của các doanh nghiệp qua từng tuần.',
        placement: 'top',
      },
    ],
  },

  cv_builder: {
    key: 'cv_builder',
    title: 'Hướng dẫn trình tạo CV thông minh',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'cv-templates',
        target: '[data-tour="cv-templates"]',
        title: 'Chọn mẫu CV chuẩn ATS',
        content:
          'Dễ dàng chuyển đổi các mẫu thiết kế CV hiện đại, tương thích hoàn hảo với hệ thống quét hồ sơ tự động.',
        placement: 'bottom',
      },
      {
        id: 'cv-ai-assist',
        target: '[data-tour="cv-ai-assist"]',
        title: 'Trợ lý AI viết CV',
        content:
          'Bấm nút AI để tự động nâng cấp câu từ, bổ sung động từ hành động đắt giá và từ khóa chuyên ngành vào CV.',
        placement: 'top',
      },
      {
        id: 'cv-export',
        target: '[data-tour="cv-export"]',
        title: 'Xem trước & Xuất file PDF',
        content:
          'Kiểm tra định dạng chuẩn trang in A4 và tải tệp PDF sắc nét chất lượng cao để nộp cho nhà tuyển dụng.',
        placement: 'left',
      },
    ],
  },

  salary_benchmark: {
    key: 'salary_benchmark',
    title: 'Hướng dẫn tra cứu lương thị trường',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'salary-filters',
        target: '[data-tour="salary-filters"]',
        title: 'Bộ lọc tìm kiếm đa chiều',
        content:
          'Tra cứu mức lương thực tế chính xác theo chức danh công việc, ngành nghề và cấp bậc kinh nghiệm.',
        placement: 'bottom',
      },
      {
        id: 'salary-benchmark-cards',
        target: '[data-tour="salary-benchmark-cards"]',
        title: 'Thước đo dải lương P25 - P50 - P75',
        content:
          'Hiểu rõ mức lương khởi điểm (P25), trung vị thị trường (P50) và mốc trần hấp dẫn (P75) của từng vị trí.',
        placement: 'top',
      },
      {
        id: 'salary-practice-cta',
        target: '[data-tour="salary-practice-cta"]',
        title: 'Luyện phỏng vấn theo dải lương',
        content:
          'Bấm vào đây để chuyển thẳng sang buồng luyện phỏng vấn AI với bộ câu hỏi chuẩn hóa theo vị trí bạn đang quan tâm.',
        placement: 'left',
      },
    ],
  },

  employer_dashboard: {
    key: 'employer_dashboard',
    title: 'Hướng dẫn cổng nhà tuyển dụng',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'employer-kpis',
        target: '[data-tour="employer-kpis"]',
        title: 'Chỉ số tuyển dụng cốt lõi',
        content:
          'Nắm bắt nhanh số lượng tin đăng đang chạy, hồ sơ ứng tuyển mới nhận và tỷ lệ phỏng vấn thành công.',
        placement: 'bottom',
      },
      {
        id: 'employer-active-interviews',
        target: '[data-tour="employer-active-interviews"]',
        title: 'Chiến dịch phỏng vấn AI',
        content:
          'Theo dõi các phòng phỏng vấn AI đang hoạt động và số lượng ứng viên đã hoàn thành buổi phỏng vấn.',
        placement: 'top',
      },
      {
        id: 'employer-quick-actions',
        target: '[data-tour="employer-quick-actions"]',
        title: 'Thao tác tạo nhanh',
        content:
          'Khởi tạo tin tuyển dụng mới hoặc phát hành đợt phỏng vấn AI chỉ với một cú nhấp chuột.',
        placement: 'left',
      },
    ],
  },

  employer_interview_create: {
    key: 'employer_interview_create',
    title: 'Hướng dẫn tạo chiến dịch phỏng vấn AI',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'interview-create-job',
        target: '[data-tour="interview-create-job"]',
        title: 'Chọn vị trí & Câu hỏi',
        content:
          'Chọn vị trí tuyển dụng và cấu hình ngân hàng câu hỏi chuyên môn, kỹ năng mềm phù hợp.',
        placement: 'bottom',
      },
      {
        id: 'interview-create-agent',
        target: '[data-tour="interview-create-agent"]',
        title: 'Giọng đọc AI & Thang điểm',
        content:
          'Lựa chọn phong cách giọng nói của AI và cài đặt tiêu chí chấm điểm tự động (Scoring Rubric).',
        placement: 'top',
      },
      {
        id: 'interview-create-candidates',
        target: '[data-tour="interview-create-candidates"]',
        title: 'Mời ứng viên',
        content:
          'Nhập danh sách ứng viên để hệ thống tự động phát hành đường dẫn phỏng vấn định danh bảo mật.',
        placement: 'top',
      },
    ],
  },

  employer_interview_detail: {
    key: 'employer_interview_detail',
    title: 'Hướng dẫn báo cáo đánh giá ứng viên',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'interview-detail-score',
        target: '[data-tour="interview-detail-score"]',
        title: 'Điểm Fit Score tổng hòa',
        content:
          'Tổng quan mức độ phù hợp của ứng viên theo thang điểm 100 dựa trên phân tích trả lời của AI.',
        placement: 'bottom',
      },
      {
        id: 'interview-detail-transcript',
        target: '[data-tour="interview-detail-transcript"]',
        title: 'Bóc băng hội thoại & Âm thanh',
        content:
          'Theo dõi toàn bộ câu trả lời, bấm vào từng câu để nghe đoạn ghi âm tương ứng của ứng viên.',
        placement: 'top',
      },
      {
        id: 'interview-detail-actions',
        target: '[data-tour="interview-detail-actions"]',
        title: 'Ra quyết định tuyển dụng',
        content:
          'Ghi chú nhận xét của hội đồng và cập nhật trạng thái ứng viên (Đạt, Không đạt, Make Offer).',
        placement: 'left',
      },
    ],
  },

  hrm_dashboard: {
    key: 'hrm_dashboard',
    title: 'Hướng dẫn quản trị nhân sự HRM',
    autoStartFirstVisit: true,
    steps: [
      {
        id: 'hrm-metrics',
        target: '[data-tour="hrm-metrics"]',
        title: 'Bức tranh nhân sự hôm nay',
        content:
          'Thống kê tỷ lệ đi làm thực tế hôm nay, số nhân viên nghỉ phép và biến động nhân sự trong tháng.',
        placement: 'bottom',
      },
      {
        id: 'hrm-reminders',
        target: '[data-tour="hrm-reminders"]',
        title: 'Nhắc việc tự động',
        content:
          'Cảnh báo hợp đồng lao động sắp hết hạn, các đơn nghỉ phép chờ duyệt và sinh nhật nhân sự trong tuần.',
        placement: 'top',
      },
      {
        id: 'hrm-quick-actions',
        target: '[data-tour="hrm-quick-actions"]',
        title: 'Truy cập nhanh nghiệp vụ',
        content:
          'Lối tắt dẫn thẳng sang quản lý ca làm việc, bảng chấm công máy vân tay và tính lương tự động.',
        placement: 'left',
      },
    ],
  },
};

export const PRODUCT_TOURS = PRODUCT_TOURS_CONFIG;
