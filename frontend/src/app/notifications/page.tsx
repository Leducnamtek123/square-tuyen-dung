import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import NotificationPage from '@/views/defaultPages/NotificationPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('notifications');
}

export default function Page() {
  return (
    <JobSeekerLayout>
      <NotificationPage />
    </JobSeekerLayout>
  );
}
