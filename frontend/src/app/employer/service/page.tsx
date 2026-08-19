import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ServicePage from '@/views/employerPages/ServicePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.service');
}

export default function Page() {
  return <ServicePage />;
}
