import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewEditPage from '@/views/employerPages/InterviewPages/InterviewEditPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interviews-edit');
}

export default function Page() {
  return <InterviewEditPage />;
}
