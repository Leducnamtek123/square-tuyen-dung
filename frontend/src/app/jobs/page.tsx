import DefaultLayout from '@/layouts/DefaultLayout';
import JobPage from '@/views/defaultPages/JobPage';

export const metadata = {
  title: 'Jobs',
  description: 'Browse Jobs.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <JobPage />
    </DefaultLayout>
  );
}
