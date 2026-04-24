import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import CitiesPage from '@/views/adminPages/CitiesPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.cities');
}

export default function Page() {
  return <CitiesPage />;
}
