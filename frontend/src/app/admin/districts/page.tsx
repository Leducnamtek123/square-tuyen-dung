import type { Metadata } from 'next';
import DistrictsPage from '@/views/adminPages/DistrictsPage';

export const metadata: Metadata = { title: 'Districts' };

export default function Page() {
  return <DistrictsPage />;
}
