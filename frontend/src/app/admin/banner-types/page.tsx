import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import BannerTypesPage from '@/views/adminPages/BannerTypesPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.banner-types');
}

export default function Page() {
  return <BannerTypesPage />;
}
