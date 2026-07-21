import { ForbiddenPage } from '@/views/errorsPage';

export const metadata = {
  title: 'Forbidden',
  description: 'Access denied.',
};

export default function Page() {
  return <ForbiddenPage />;
}
