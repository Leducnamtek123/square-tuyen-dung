import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewDetailPage from '@/views/employerPages/InterviewPages/InterviewDetailPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.interview-detail');
}

export default function Page() {
  return <InterviewDetailPage />;
}
