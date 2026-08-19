import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByCareerPage from '@/views/defaultPages/JobsByCareerPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('jobs-by-career');
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByCareerPage />
    </DefaultLayout>
  );
}
