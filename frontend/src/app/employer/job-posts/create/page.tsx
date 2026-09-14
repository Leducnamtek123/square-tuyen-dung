import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import JobPostEditorPage from '@/views/employerPages/JobPostPage/JobPostEditorPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.job-posts-create');
}

export default function Page() {
  return <JobPostEditorPage mode="create" />;
}
