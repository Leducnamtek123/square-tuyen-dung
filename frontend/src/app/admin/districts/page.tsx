import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DistrictsPage from '@/views/adminPages/DistrictsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.districts');
}

export default function Page() {
  return <DistrictsPage />;
}
