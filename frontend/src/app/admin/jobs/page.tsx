import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Tin tuyển dụng' };

import JobsPage from '@/views/adminPages/JobsPage';

export default function Page() {
  return <JobsPage />;
}
