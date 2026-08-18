import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import OnlineProfilePage from '@/views/jobSeekerPages/OnlineProfilePage';

export const metadata = {
  title: 'Online Profile',
  description: 'Browse Online Profile.',
};

export default function Page() {
  return (
    <JobSeekerLayout>
      <OnlineProfilePage />
    </JobSeekerLayout>
  );
}
