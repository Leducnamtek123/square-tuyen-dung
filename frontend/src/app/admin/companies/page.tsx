import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import CompaniesPage from '@/views/adminPages/CompaniesPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.companies');
}

export default function Page() {
  return <CompaniesPage />;
}
