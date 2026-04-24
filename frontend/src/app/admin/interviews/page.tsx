import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Danh sách phỏng vấn' };

import InterviewsPage from '@/views/adminPages/InterviewsPage';

export default function Page() {
  return <InterviewsPage />;
}
