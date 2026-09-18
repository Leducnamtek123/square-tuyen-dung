import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DepartmentListPage from '@/views/hrmPages/DepartmentListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.hrm.departments');
}

export default function Page() {
  return <DepartmentListPage />;
}
