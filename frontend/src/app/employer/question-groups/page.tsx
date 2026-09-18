import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import QuestionGroupsPage from '@/views/employerPages/InterviewPages/QuestionGroupsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.question-groups');
}

export default function Page() {
  return <QuestionGroupsPage />;
}
