import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import CompanyVerificationsPage from '@/views/adminPages/CompanyVerificationsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.company-verifications');
}

export default function Page() {
  return <CompanyVerificationsPage />;
}
