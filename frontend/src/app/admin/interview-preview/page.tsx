import InterviewPreviewPage from '@/views/adminPages/InterviewPreviewPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interview UI Preview | Square Admin',
  description: 'Preview the full interview flow with fake data.',
};

export default function Page() {
  return <InterviewPreviewPage />;
}
