import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Thông báo việc làm' };

import JobNotificationsPage from '@/views/adminPages/JobNotificationsPage';

export default function Page() {
  return <JobNotificationsPage />;
}
