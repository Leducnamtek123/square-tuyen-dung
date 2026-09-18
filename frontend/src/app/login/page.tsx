import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerLogin from '@/views/authPages/JobSeekerLogin';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('login');
}

export default function Page() {
  return (
    <DefaultLayout>
      <JobSeekerLogin />
    </DefaultLayout>
  );
}
