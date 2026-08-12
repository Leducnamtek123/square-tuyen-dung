import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import NewsPage from '@/views/defaultPages/NewsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Tin tức & Blog tuyển dụng',
    description:
      'Cập nhật tin tức mới nhất về thị trường lao động, kinh nghiệm phỏng vấn, tư vấn phát triển sự nghiệp và bí quyết tuyển dụng hiệu quả từ InfoHR.',
    path: '/tin-tuc',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <NewsPage />
    </DefaultLayout>
  );
}
