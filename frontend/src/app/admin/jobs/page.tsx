import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobsPage from '@/views/adminPages/JobsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.jobs');
}

export default function Page() {
  return <JobsPage />;
}
