import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Bảng điều khiển' };

import AdminDashboardPage from '@/views/adminPages/DashboardPage';

export default function Page() {
  return <AdminDashboardPage />;
}
