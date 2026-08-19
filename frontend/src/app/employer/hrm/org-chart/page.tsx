import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import OrgChartPage from '@/views/hrmPages/OrgChartPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.org-chart');
}

export default function Page() {
  return <OrgChartPage />;
}
