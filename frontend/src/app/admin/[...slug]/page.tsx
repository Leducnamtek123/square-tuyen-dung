import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AdminCatchAllClient from './AdminCatchAllClient';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin');
}

export default function Page() {
  return <AdminCatchAllClient />;
}
