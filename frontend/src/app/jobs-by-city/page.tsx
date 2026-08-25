import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByCityPage from '@/views/defaultPages/JobsByCityPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Việc làm theo tỉnh thành | InfoHR',
    description: 'Tìm kiếm cơ hội việc làm tại Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Bình Dương, Hải Phòng và tất cả các tỉnh thành trên cả nước.',
    path: '/viec-lam-theo-tinh-thanh',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByCityPage />
    </DefaultLayout>
  );
}
