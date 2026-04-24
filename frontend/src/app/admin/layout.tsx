// Server Component — can export metadata
import type { Metadata } from 'next';
import AdminSectionClient from './AdminSectionClient';

export const metadata: Metadata = {
  title: {
    template: '%s | Square Admin',
    default: 'Quản trị | Square Admin',
  },
};

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminSectionClient>{children}</AdminSectionClient>;
}
