import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByJobTypePage from '@/views/defaultPages/JobsByJobTypePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('jobs-by-type');
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByJobTypePage />
    </DefaultLayout>
  );
}
