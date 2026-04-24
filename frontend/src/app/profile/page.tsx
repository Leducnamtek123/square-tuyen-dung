import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import ProfilePage from '@/views/jobSeekerPages/ProfilePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('profile');
}

export default function Page() {
  return (
    <JobSeekerLayout>
      <ProfilePage />
    </JobSeekerLayout>
  );
}
