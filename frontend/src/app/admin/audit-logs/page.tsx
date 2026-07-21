import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AuditLogsPage from '@/views/adminPages/AuditLogsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('admin.audit-logs');
}

export default function Page() {
  return <AuditLogsPage />;
}
