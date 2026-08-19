import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import EmailVerificationRequiredPage from '@/views/authPages/EmailVerificationRequiredPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('verify-email');
}

export default function Page() {
  return (
    <DefaultLayout>
      <EmailVerificationRequiredPage />
    </DefaultLayout>
  );
}
