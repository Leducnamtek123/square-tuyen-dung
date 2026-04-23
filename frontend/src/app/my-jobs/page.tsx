import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import ProjectPage from '@/views/jobSeekerPages/ProjectPage';

export const metadata = {
  title: 'My Jobs',
  description: 'Browse My Jobs.',
};

export default function Page() {
  return (
    <JobSeekerLayout>
      <ProjectPage />
    </JobSeekerLayout>
  );
}
