import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByJobTypePage from '@/views/defaultPages/JobsByJobTypePage';

export const metadata = {
  title: 'Jobs By Type',
  description: 'Browse Jobs By Type.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByJobTypePage />
    </DefaultLayout>
  );
}
