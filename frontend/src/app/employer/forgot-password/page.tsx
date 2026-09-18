import ForgotPasswordPage from '@/views/authPages/ForgotPasswordPage';
import { buildPageMetadata } from '@/utils/serverI18n';

export const generateMetadata = () => buildPageMetadata('employer.forgot-password');

export default function Page() {
  return <ForgotPasswordPage />;
}
