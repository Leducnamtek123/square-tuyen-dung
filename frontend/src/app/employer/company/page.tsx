import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import CompanyPage from '@/views/employerPages/CompanyPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.company');
}

export default function Page() {
  return <CompanyPage />;
}
