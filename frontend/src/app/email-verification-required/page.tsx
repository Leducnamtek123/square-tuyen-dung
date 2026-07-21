import DefaultLayout from '@/layouts/DefaultLayout';
import EmailVerificationRequiredPage from '@/views/authPages/EmailVerificationRequiredPage';

export const metadata = {
  title: 'Email Verification Required',
  description: 'Browse Email Verification Required.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <EmailVerificationRequiredPage />
    </DefaultLayout>
  );
}
