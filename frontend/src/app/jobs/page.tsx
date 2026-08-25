import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobPage from '@/views/defaultPages/JobPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Tìm việc làm nhanh, việc làm mới nhất | InfoHR',
    description: 'Tìm kiếm hàng ngàn cơ hội việc làm hấp dẫn từ các nhà tuyển dụng hàng đầu. Lương cao, phúc lợi tốt, ứng tuyển trực tuyến nhanh chóng trên InfoHR.',
    path: '/viec-lam',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobPage />
    </DefaultLayout>
  );
}
