import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import OnboardingPage from '@/views/hrmPages/OnboardingPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.onboarding');
}

export default function Page() {
  return <OnboardingPage />;
}
