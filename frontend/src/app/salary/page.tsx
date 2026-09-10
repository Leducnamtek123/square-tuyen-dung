import type { Metadata } from 'next';
import DefaultLayout from '@/layouts/DefaultLayout';
import SalaryBenchmarkPage from '@/views/defaultPages/SalaryPage';

export const metadata: Metadata = {
  title: 'Tra Cứu Dải Lương Thị Trường 2026 | InfoHR Tuyển Dụng',
  description: 'Báo cáo và công cụ tra cứu dải lương thị trường năm 2026 các ngành Xây dựng, Kiến trúc, Thiết kế nội thất, CNTT, Nhân sự và Sales.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <SalaryBenchmarkPage />
    </DefaultLayout>
  );
}
