import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByCareerPage from '@/views/defaultPages/JobsByCareerPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Việc làm theo ngành nghề | InfoHR',
    description: 'Tìm kiếm việc làm theo ngành nghề chuyên môn: Công nghệ thông tin, Kinh doanh, Marketing, Kế toán, Nhân sự và nhiều lĩnh vực khác trên InfoHR.',
    path: '/viec-lam-theo-nganh-nghe',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByCareerPage />
    </DefaultLayout>
  );
}
