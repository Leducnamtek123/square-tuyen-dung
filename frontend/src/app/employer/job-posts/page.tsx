import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobPostPage from '@/views/employerPages/JobPostPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.job-posts');
}

export default function Page() {
  return <JobPostPage />;
}
