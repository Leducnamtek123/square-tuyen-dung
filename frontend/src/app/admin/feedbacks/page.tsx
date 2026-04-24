import type { Metadata } from 'next';
import FeedbacksPage from '@/views/adminPages/FeedbacksPage';

export const metadata: Metadata = { title: 'Feedbacks' };

export default function Page() {
  return <FeedbacksPage />;
}
