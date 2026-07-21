import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import CareersPage from '@/views/adminPages/CareersPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.careers');
}

export default function Page() {
  return <CareersPage />;
}
