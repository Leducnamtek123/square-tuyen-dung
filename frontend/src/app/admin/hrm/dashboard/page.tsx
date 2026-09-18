import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import HrmDashboardPage from '@/views/hrmPages/HrmDashboardPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.hrm.dashboard');
}

export default function Page() {
  return <HrmDashboardPage />;
}
