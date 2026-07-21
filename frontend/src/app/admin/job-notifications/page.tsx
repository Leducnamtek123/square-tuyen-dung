import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobNotificationsPage from '@/views/adminPages/JobNotificationsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.job-notifications');
}

export default function Page() {
  return <JobNotificationsPage />;
}
