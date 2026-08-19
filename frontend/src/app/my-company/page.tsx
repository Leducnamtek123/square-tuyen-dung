import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import MyCompanyPage from '@/views/jobSeekerPages/MyCompanyPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('my-company');
}

export default function Page() {
  return (
    <JobSeekerLayout>
      <MyCompanyPage />
    </JobSeekerLayout>
  );
}
