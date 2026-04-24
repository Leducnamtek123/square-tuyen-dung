import type { Metadata } from 'next';
import JobNotificationsPage from '@/views/adminPages/JobNotificationsPage';

export const metadata: Metadata = { title: 'Job Notifications' };

export default function Page() {
  return <JobNotificationsPage />;
}
