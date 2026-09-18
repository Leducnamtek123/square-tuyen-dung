import EmployerOnboardingPage from '@/views/onboardingPages/EmployerOnboardingPage';
import { buildPageMetadata } from '@/utils/serverI18n';

export const generateMetadata = () => buildPageMetadata('onboarding.employer');

export default function Page() {
  return <EmployerOnboardingPage />;
}
