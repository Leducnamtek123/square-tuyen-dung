import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewListPage from '@/views/employerPages/InterviewPages/InterviewListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interviews');
}

export default function Page() {
  return <InterviewListPage />;
}
