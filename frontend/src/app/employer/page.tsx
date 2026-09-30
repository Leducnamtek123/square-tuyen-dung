import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import EmployerHomePage from '@/views/employerPages/EmployerHomePage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.home');
}

export default function EmployerRootPage() {
  return <EmployerHomePage />;
}
