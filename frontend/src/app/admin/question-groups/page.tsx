import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import QuestionGroupsPage from '@/views/employerPages/InterviewPages/QuestionGroupsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.question-groups');
}

export default function AdminQuestionGroupsPage() {
  return <QuestionGroupsPage />;
}
