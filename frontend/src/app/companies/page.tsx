import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import CompanyPage from '@/views/defaultPages/CompanyPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('companies');
}

export default function Page() {
  return (
    <DefaultLayout>
      <CompanyPage />
    </DefaultLayout>
  );
}
