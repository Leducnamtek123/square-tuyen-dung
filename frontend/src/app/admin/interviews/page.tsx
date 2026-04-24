import type { Metadata } from 'next';
import InterviewsPage from '@/views/adminPages/InterviewsPage';

export const metadata: Metadata = { title: 'Interviews' };

export default function Page() {
  return <InterviewsPage />;
}
