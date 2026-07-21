import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByCareerPage from '@/views/defaultPages/JobsByCareerPage';

export const metadata = {
  title: 'Jobs By Career',
  description: 'Browse Jobs By Career.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByCareerPage />
    </DefaultLayout>
  );
}
