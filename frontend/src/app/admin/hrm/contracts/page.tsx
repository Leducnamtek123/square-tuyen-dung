import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ContractListPage from '@/views/hrmPages/ContractListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.hrm.contracts');
}

export default function Page() {
  return <ContractListPage />;
}
