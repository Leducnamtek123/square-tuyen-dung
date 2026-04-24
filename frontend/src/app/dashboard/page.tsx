import type { Metadata } from 'next';
import DashboardPage from '@/views/jobSeekerPages/DashboardPage';

export const metadata: Metadata = { title: 'Dashboard' };

export default function Page() {
  return <DashboardPage />;
}
