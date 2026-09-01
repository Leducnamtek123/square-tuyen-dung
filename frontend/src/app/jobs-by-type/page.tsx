import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByJobTypePage from '@/views/defaultPages/JobsByJobTypePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Việc làm theo hình thức làm việc',
    description: 'Tìm kiếm việc làm toàn thời gian, bán thời gian, thực tập, làm việc từ xa (Remote / Hybrid) linh hoạt trên InfoHR.',
    path: '/viec-lam-theo-hinh-thuc-lam-viec',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByJobTypePage />
    </DefaultLayout>
  );
}
