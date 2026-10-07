import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import AttachedProfilePage from '@/views/jobSeekerPages/AttachedProfilePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('attached-profile');
}

export default function Page() {
  return (
    <JobSeekerLayout>
      <AttachedProfilePage />
    </JobSeekerLayout>
  );
}
