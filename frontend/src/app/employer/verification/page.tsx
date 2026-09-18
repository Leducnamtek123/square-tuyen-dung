import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import VerificationPage from '@/views/employerPages/VerificationPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.verification');
}

export default function Page() {
  return <VerificationPage />;
}
