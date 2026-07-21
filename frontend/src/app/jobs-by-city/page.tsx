import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByCityPage from '@/views/defaultPages/JobsByCityPage';

export const metadata = {
  title: 'Jobs By City',
  description: 'Browse Jobs By City.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByCityPage />
    </DefaultLayout>
  );
}
