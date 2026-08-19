import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewSessionPage from '@/views/employerPages/InterviewPages/InterviewSessionPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interviews-session');
}

export default function Page() {
  return <InterviewSessionPage />;
}
