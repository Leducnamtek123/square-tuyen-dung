import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import QuestionBankPage from '@/views/employerPages/InterviewPages/QuestionBankPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.question-bank');
}

export default function Page() {
  return <QuestionBankPage />;
}
