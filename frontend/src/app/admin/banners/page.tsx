import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import BannersPage from '@/views/adminPages/BannersPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.banners');
}

export default function Page() {
  return <BannersPage />;
}
