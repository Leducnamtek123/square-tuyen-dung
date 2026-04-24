import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobActivityPage from '@/views/adminPages/JobActivityPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.job-activity');
}

export default function Page() {
  return <JobActivityPage />;
}
