import EmployerLogin from '@/views/authPages/EmployerLogin';
import { buildPageMetadata } from '@/utils/serverI18n';

export const generateMetadata = () => buildPageMetadata('employer.login');

export default function Page() {
  return <EmployerLogin />;
}
