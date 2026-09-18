import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import PricingPage from '@/views/employerPages/PricingPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.pricing');
}

export default function Page() {
  return <PricingPage />;
}
