import type { Metadata } from 'next';
import SalaryAdaptiveLayout from '@/views/defaultPages/SalaryPage/components/SalaryAdaptiveLayout';

export const metadata: Metadata = {
  title: 'Cổng Tra Cứu Dải Lương Chuẩn Theo Vị Trí & Cấp Bậc 2026 | InfoHR Tuyển Dụng',
  description: 'Dữ liệu khảo sát chuẩn hóa mức lương thị trường năm 2026 các ngành Xây dựng, Kiến trúc, Thiết kế nội thất, CNTT, Nhân sự và Sales.',
};

export default function Page() {
  return <SalaryAdaptiveLayout />;
}
