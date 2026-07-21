import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AdminLogin from '@/views/authPages/AdminLogin';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.login');
}

export default function Page() {
  return <AdminLogin />;
}
