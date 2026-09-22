import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import SalaryBenchmarkPage from '@/views/defaultPages/SalaryPage/SalaryBenchmarkPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('salary');
}

export default function Page() {
  return <SalaryBenchmarkPage />;
}
