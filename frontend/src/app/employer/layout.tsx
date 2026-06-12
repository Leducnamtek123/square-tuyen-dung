// Server Component - can export metadata
import type { Metadata } from 'next';
import EmployerSectionClient from './EmployerSectionClient';

export const metadata: Metadata = {
  title: {
    template: '%s | Square Tuyển Dụng',
    default: 'Nhà tuyển dụng | Square Tuyển Dụng',
  },
};

export default function EmployerSectionLayout({
  children,
}: {
  children: any;
}) {
  return <EmployerSectionClient>{children}</EmployerSectionClient>;
}
