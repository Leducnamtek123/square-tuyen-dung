import { buildPageMetadata } from '@/utils/serverI18n';
import TrustReportsPage from '@/views/adminPages/TrustReportsPage';

export async function generateMetadata() {
  return buildPageMetadata('admin.trustReports', {
    description: 'Admin trust report review.',
  });
}

export default function Page() {
  return <TrustReportsPage />;
}
