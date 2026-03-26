'use client';

import DefaultLayout from '@/layouts/DefaultLayout';
import EmailVerificationRequiredPage from '@/views/authPages/EmailVerificationRequiredPage';

export default function Page() {
  return (
    <DefaultLayout>
      <EmailVerificationRequiredPage />
    </DefaultLayout>
  );
}
