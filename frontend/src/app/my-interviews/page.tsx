import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import MyInterviewsPage from '@/views/jobSeekerPages/MyInterviewsPage';

export const metadata = {
  title: 'My Interviews',
  description: 'Browse My Interviews.',
};

export default function Page() {
  return (
    <JobSeekerLayout>
      <MyInterviewsPage />
    </JobSeekerLayout>
  );
}
