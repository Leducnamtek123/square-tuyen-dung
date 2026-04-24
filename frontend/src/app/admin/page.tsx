// Server Component — exports metadata, delegates redirect logic to client
import type { Metadata } from 'next';
import AdminIndexClient from './AdminIndexClient';

export const metadata: Metadata = { title: 'Quản trị' };

export default function AdminPage() {
  return <AdminIndexClient />;
}
