import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import ProfilePage from '@/views/jobSeekerPages/ProfilePage';

export const metadata = {
  title: 'Profile',
  description: 'Browse Profile.',
};

export default function Page() {
  return (
    <JobSeekerLayout>
      <ProfilePage />
    </JobSeekerLayout>
  );
}
