import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import OnlineProfilePage from '@/views/jobSeekerPages/OnlineProfilePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('online-profile');
}

export default function Page() {
  return (
    <JobSeekerLayout>
      <OnlineProfilePage />
    </JobSeekerLayout>
  );
}
