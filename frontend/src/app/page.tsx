import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import HomeLayout from '@/layouts/HomeLayout';
import HomePage from '@/views/defaultPages/HomePage';

export async function generateMetadata(): Promise<Metadata> {
  const meta = buildSeoMetadata({
    title: 'InfoHR - Tìm việc nhanh, tuyển dụng hiệu quả',
    description:
      'InfoHR - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, kết nối với các nhà tuyển dụng uy tín. Ứng tuyển nhanh chóng, hiệu quả.',
    path: '/',
  });
  return {
    ...meta,
    title: {
      absolute: 'InfoHR - Tìm việc nhanh, tuyển dụng hiệu quả',
    },
  };
}

export default function Page() {
  return (
    <HomeLayout>
      <HomePage />
    </HomeLayout>
  );
}

