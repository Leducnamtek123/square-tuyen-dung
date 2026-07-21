import DefaultLayout from '@/layouts/DefaultLayout';
import ResetPasswordPage from '@/views/authPages/ResetPasswordPage';

export const metadata = {
  title: 'Reset password',
  description: 'Reset your account password.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <ResetPasswordPage />
    </DefaultLayout>
  );
}
