import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import LeaveListPage from '@/views/hrmPages/LeaveListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.leaves');
}

export default function Page() {
  return <LeaveListPage />;
}
