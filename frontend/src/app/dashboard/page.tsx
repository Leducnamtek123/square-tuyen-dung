import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Bảng điều khiển' };

import DashboardPage from '@/views/jobSeekerPages/DashboardPage';

export default function Page() {
  return <DashboardPage />;
}
