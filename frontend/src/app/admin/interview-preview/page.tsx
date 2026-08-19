import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import InterviewPreviewPage from '@/views/adminPages/InterviewPreviewPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.interview-preview');
}

export default function Page() {
  return <InterviewPreviewPage />;
}

