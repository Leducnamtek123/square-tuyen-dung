import EmployerSignUp from '@/views/authPages/EmployerSignUp';
import { buildPageMetadata } from '@/utils/serverI18n';

export const generateMetadata = () => buildPageMetadata('employer.register');

export default function Page() {
  return <EmployerSignUp />;
}
