import DefaultLayout from '@/layouts/DefaultLayout';
import ForgotPasswordPage from '@/views/authPages/ForgotPasswordPage';

export const metadata = {
  title: 'Forgot Password',
  description: 'Browse Forgot Password.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <ForgotPasswordPage />
    </DefaultLayout>
  );
}
