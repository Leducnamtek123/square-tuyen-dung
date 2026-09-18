import CandidateOnboardingPage from '@/views/onboardingPages/CandidateOnboardingPage';
import { buildPageMetadata } from '@/utils/serverI18n';

export const generateMetadata = () => buildPageMetadata('onboarding.candidate');

export default function Page() {
  return <CandidateOnboardingPage />;
}
