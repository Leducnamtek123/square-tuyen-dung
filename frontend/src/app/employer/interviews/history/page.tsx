import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewHistoryPage from '@/views/employerPages/InterviewPages/InterviewHistoryPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interviews-history');
}

export default function Page() {
  return <InterviewHistoryPage />;
}
