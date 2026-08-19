import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import ForgotPasswordPage from '@/views/authPages/ForgotPasswordPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('forgot-password');
}

export default function Page() {
  return (
    <DefaultLayout>
      <ForgotPasswordPage />
    </DefaultLayout>
  );
}
