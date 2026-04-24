import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DashboardPage from '@/views/adminPages/DashboardPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.dashboard');
}

export default function Page() {
  return <DashboardPage />;
}
