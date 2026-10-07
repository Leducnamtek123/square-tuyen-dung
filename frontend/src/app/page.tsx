import type { Metadata } from 'next';
import { buildPageMetadata, getPageTitle } from '@/utils/serverI18n';
import HomeLayout from '@/layouts/HomeLayout';
import HomePage from '@/views/defaultPages/HomePage';

export const revalidate = 3600; // Cache and revalidate public homepage every 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildPageMetadata('home');
  const title = await getPageTitle('home');
  return {
    ...meta,
    title: {
      absolute: title,
    },
  };
}

const homeFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Làm thế nào để tìm việc và ứng tuyển nhanh chóng trên InfoHR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ứng viên chỉ cần nhập chức danh công việc hoặc kỹ năng tại thanh tìm kiếm trên InfoHR, chọn khu vực hoặc ngành nghề mong muốn. Sau đó chọn công việc phù hợp, tải lên CV có sẵn hoặc sử dụng công cụ tạo CV online chuẩn ATS của InfoHR để ứng tuyển trực tiếp chỉ với 1 cú click.',
      },
    },
    {
      '@type': 'Question',
      name: 'Tại sao nên luyện tập phỏng vấn với trợ lý AI AILA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trợ lý Voice AI AILA cung cấp môi trường mô phỏng phỏng vấn thực tế qua công nghệ WebRTC giọng nói thời gian thực. Sau mỗi buổi phỏng vấn, AILA cung cấp bảng chấm điểm chi tiết về chuyên môn, sự tự tin, phát âm và gợi ý câu trả lời tối ưu giúp ứng viên sẵn sàng cho buổi phỏng vấn thật.',
      },
    },
    {
      '@type': 'Question',
      name: 'Nhà tuyển dụng đăng tin và sàng lọc ứng viên như thế nào?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doanh nghiệp đăng ký tài khoản Nhà tuyển dụng tại cổng employer.infohr.vn, xác thực hồ sơ công ty và tiến hành đăng tin tuyển dụng. InfoHR hỗ trợ tính năng lọc hồ sơ nâng cao và tích hợp AI AILA để sơ loại tự động hàng loạt ứng viên.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hồ sơ ứng viên và CV trên InfoHR có được bảo mật không?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'InfoHR tuân thủ nghiêm ngặt các quy định pháp luật và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Toàn bộ hồ sơ, thông tin liên hệ và tài liệu CV được mã hóa và lưu trữ an toàn, chỉ hiển thị với nhà tuyển dụng khi được ứng viên cho phép.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeFaqJsonLd),
        }}
      />
      <HomeLayout>
        <HomePage />
      </HomeLayout>
    </>
  );
}
