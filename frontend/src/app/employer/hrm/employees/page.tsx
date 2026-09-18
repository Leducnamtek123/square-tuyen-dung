import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import EmployeeListPage from '@/views/hrmPages/EmployeeListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.employees');
}

export default function Page() {
  return <EmployeeListPage />;
}
