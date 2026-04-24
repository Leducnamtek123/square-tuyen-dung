import type { Metadata } from 'next';
import ForgotPasswordPage from '@/views/authPages/ForgotPasswordPage';

export const metadata: Metadata = { title: 'Forgot Password' };

export default function Page() {
  return <ForgotPasswordPage />;
}
