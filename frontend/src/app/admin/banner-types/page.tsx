import type { Metadata } from 'next';
import BannerTypesPage from '@/views/adminPages/BannerTypesPage';

export const metadata: Metadata = { title: 'Banner Types' };

export default function Page() {
  return <BannerTypesPage />;
}
