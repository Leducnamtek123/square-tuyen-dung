import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import ResetPasswordPage from '@/views/authPages/ResetPasswordPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('reset-password');
}

export default function Page() {
  return (
    <DefaultLayout>
      <ResetPasswordPage />
    </DefaultLayout>
  );
}
