import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Phản hồi' };

import FeedbacksPage from '@/views/adminPages/FeedbacksPage';

export default function Page() {
  return <FeedbacksPage />;
}
