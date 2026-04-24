import type { Metadata } from 'next';
import CitiesPage from '@/views/adminPages/CitiesPage';

export const metadata: Metadata = { title: 'Cities' };

export default function Page() {
  return <CitiesPage />;
}
