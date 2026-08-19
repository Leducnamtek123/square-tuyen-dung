import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewCreatePage from '@/views/employerPages/InterviewPages/InterviewCreatePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interviews-create');
}

export default function Page() {
  return <InterviewCreatePage />;
}
