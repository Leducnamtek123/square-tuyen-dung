import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ResetPasswordPage from '@/views/authPages/ResetPasswordPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.reset-password');
}

export default function Page() {
  return <ResetPasswordPage />;
}
