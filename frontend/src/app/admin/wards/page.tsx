import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import WardsPage from '@/views/adminPages/WardsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.wards');
}

export default function Page() {
  return <WardsPage />;
}
