import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import SalaryAdaptiveLayout from '@/views/defaultPages/SalaryPage/components/SalaryAdaptiveLayout';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('salary');
}

export default function Page() {
  return <SalaryAdaptiveLayout />;
}
