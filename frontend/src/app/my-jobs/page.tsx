import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import ProjectPage from '@/views/jobSeekerPages/ProjectPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('my-jobs');
}

export default function Page() {
  return (
    <JobSeekerLayout>
      <ProjectPage />
    </JobSeekerLayout>
  );
}
