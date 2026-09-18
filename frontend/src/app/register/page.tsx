import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerSignUp from '@/views/authPages/JobSeekerSignUp';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('register');
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobSeekerSignUp />
    </DefaultLayout>
  );
}
