import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ProjectPage from '@/views/jobSeekerPages/ProjectPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('my-jobs');
}

export default function Page() {
  return <ProjectPage />;
}
