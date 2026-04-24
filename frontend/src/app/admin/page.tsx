import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AdminIndexClient from './AdminIndexClient';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin');
}

export default function Page() {
  return <AdminIndexClient />;
}
