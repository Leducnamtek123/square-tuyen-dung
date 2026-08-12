import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Liên hệ',
    description:
      'Liên hệ với InfoHR để được hỗ trợ giải đáp thắc mắc, đóng góp ý kiến hoặc tư vấn dịch vụ tuyển dụng và tìm việc làm.',
    path: '/lien-he',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="contact" />
    </DefaultLayout>
  );
}
