import type { Metadata } from 'next';
import AdminIndexClient from './AdminIndexClient';

export const metadata: Metadata = { title: 'Admin' };

export default function Page() {
  return <AdminIndexClient />;
}
