import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewScriptsPage from '@/views/employerPages/InterviewPages/InterviewScriptsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interview-scripts');
}

export default function Page() {
  return <InterviewScriptsPage />;
}
