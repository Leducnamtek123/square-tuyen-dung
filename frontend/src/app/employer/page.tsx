import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.introduce');
}

export default function EmployerRootPage() {
  redirect('/employer/introduce');
}

