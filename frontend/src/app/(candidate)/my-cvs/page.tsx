import type { Metadata } from 'next';
import { CandidateCVListPage } from '@/views/cvBuilderPages';

export const metadata: Metadata = {
  title: 'Quản Lý CV Đã Lưu | Square Tuyển Dụng',
  description: 'Quản lý các bản CV ứng tuyển trực tuyến, đặt CV chính, nhân bản và tải file PDF A4 chuẩn chuyên nghiệp.',
};

export default function Page() {
  return <CandidateCVListPage />;
}
