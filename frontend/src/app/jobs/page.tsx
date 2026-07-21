import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobPage from '@/views/defaultPages/JobPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('jobs');
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobPage />
    </DefaultLayout>
  );
}
