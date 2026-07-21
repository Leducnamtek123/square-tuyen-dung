import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DashboardPage from '@/views/employerPages/DashboardPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.dashboard');
}

export default function Page() {
  return <DashboardPage />;
}
