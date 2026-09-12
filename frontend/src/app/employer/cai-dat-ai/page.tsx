import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import EmployerAiSettingsPage from '@/views/employerPages/InterviewPages/EmployerAiSettingsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.ai-settings');
}

export default function Page() {
  return <EmployerAiSettingsPage />;
}
