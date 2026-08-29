import type { Metadata } from 'next';
import { CVGalleryPage } from '@/views/cvBuilderPages/CVGalleryPage';

export const metadata: Metadata = {
  title: 'Trang Trí CV & Danh Sách Mẫu CV Đẹp | InfoHR',
  description:
    'Khám phá thư viện mẫu CV xin việc chuẩn chuyên nghiệp, chuẩn ATS, hỗ trợ tạo và trang trí CV trực tuyến hoàn toàn miễn phí.',
};

export default function CandidateCVGalleryPage() {
  return <CVGalleryPage />;
}
