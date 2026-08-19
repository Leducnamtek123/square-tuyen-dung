import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import QuestionBankPage from '@/views/employerPages/InterviewPages/QuestionBankPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.questions');
}

export default function AdminQuestionsPage() {
  return <QuestionBankPage />;
}
