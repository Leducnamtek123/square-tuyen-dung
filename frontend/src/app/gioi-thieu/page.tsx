import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import AboutUsPage from '@/views/defaultPages/AboutUsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Giới thiệu',
    description:
      'Tìm hiểu về InfoHR - Nền tảng tuyển dụng và kết nối việc làm thông minh hàng đầu Việt Nam, giúp ứng viên và nhà tuyển dụng tìm thấy nhau nhanh chóng.',
    path: '/gioi-thieu',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <AboutUsPage />
    </DefaultLayout>
  );
}
