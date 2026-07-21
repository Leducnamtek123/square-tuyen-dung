// Server Component - can export metadata
import type { Metadata } from 'next';
import EmployerSectionClient from './EmployerSectionClient';

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Tuyá»ƒn Dá»¥ng',
    default: 'NhÃ  tuyá»ƒn dá»¥ng | InfoHR Tuyá»ƒn Dá»¥ng',
  },
};

export default function EmployerSectionLayout({
  children,
}: {
  children: any;
}) {
  return <EmployerSectionClient>{children}</EmployerSectionClient>;
}

