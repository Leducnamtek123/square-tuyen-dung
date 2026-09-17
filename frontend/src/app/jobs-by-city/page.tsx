import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByCityPage from '@/views/defaultPages/JobsByCityPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('jobs-by-city');
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByCityPage />
    </DefaultLayout>
  );
}
