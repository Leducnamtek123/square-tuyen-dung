import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewLivePage from '@/views/employerPages/InterviewPages/InterviewLivePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interviews-live');
}

export default function Page() {
  return <InterviewLivePage />;
}
