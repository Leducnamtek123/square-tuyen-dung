import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import CompanyPage from '@/views/defaultPages/CompanyPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Danh sách công ty & Nhà tuyển dụng hàng đầu | InfoHR',
    description: 'Khám phá môi trường làm việc, chế độ đãi ngộ và các cơ hội tuyển dụng hấp dẫn từ hàng ngàn doanh nghiệp uy tín trên InfoHR.',
    path: '/cong-ty',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <CompanyPage />
    </DefaultLayout>
  );
}
