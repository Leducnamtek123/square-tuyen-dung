import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import CandidateLoginPage from '@/views/jobSeekerPages/CandidateLoginPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('interview.login');
}

export default function Page() {
  return (
    <DefaultLayout>
      <CandidateLoginPage />
    </DefaultLayout>
  );
}
