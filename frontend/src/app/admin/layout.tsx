// Server Component - can export metadata
import type { Metadata } from 'next';
import AdminSectionClient from './AdminSectionClient';

export const metadata: Metadata = {
  title: {
    template: '%s | InfoHR Admin',
    default: 'Quản trị | InfoHR Admin',
  },
};

export default function AdminSectionLayout({
  children,
}: {
  children: any;
}) {
  return <AdminSectionClient>{children}</AdminSectionClient>;
}

