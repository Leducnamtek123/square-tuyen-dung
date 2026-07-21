import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import MyCompanyPage from '@/views/jobSeekerPages/MyCompanyPage';

export const metadata = {
  title: 'My Company',
  description: 'Browse My Company.',
};

export default function Page() {
  return (
    <JobSeekerLayout>
      <MyCompanyPage />
    </JobSeekerLayout>
  );
}
