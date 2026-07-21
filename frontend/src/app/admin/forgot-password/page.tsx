import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ForgotPasswordPage from '@/views/authPages/ForgotPasswordPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.forgot-password');
}

export default function Page() {
  return <ForgotPasswordPage />;
}
