// Server Component Ã¢â‚¬â€ can export metadata
import type { Metadata } from 'next';
import AdminSectionClient from './AdminSectionClient';

export const metadata: Metadata = {
  title: {
    template: '%s | Square Admin',
    default: 'QuÃ¡ÂºÂ£n trÃ¡Â»â€¹ | Square Admin',
  },
};

export default function AdminSectionLayout({
  children,
}: {
  children: any;
}) {
  return <AdminSectionClient>{children}</AdminSectionClient>;
}
