import type { Metadata } from 'next';
import { PublicCVPage } from '@/views/cvBuilderPages';

export const metadata: Metadata = {
  title: 'Hồ Sơ CV Trực Tuyến | InfoHR Tuyển Dụng',
  description: 'Xem hồ sơ CV trực tuyến chuẩn chuyên nghiệp của ứng viên trên nền tảng Tuyển Dụng InfoHR.',
};

export default function Page() {
  return <PublicCVPage />;
}
