import type { Metadata } from 'next';
import CompaniesPage from '@/views/adminPages/CompaniesPage';

export const metadata: Metadata = { title: 'Companies' };

export default function Page() {
  return <CompaniesPage />;
}
