import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import SupportPage from '@/views/employerPages/SupportPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.support');
}

export default function Page() {
  return <SupportPage />;
}
